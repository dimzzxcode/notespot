/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { SaveStatusType } from "@/components/editor/SaveStatus";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateNote } from "@/lib/api/notes";

type AutosavePayload = { title: string; content: string };

type UseAutosaveOptions = {
  id: string | null;
  payload: AutosavePayload;
  delay?: number;
  enabled?: boolean;
};

export function useAutosave({ id, payload, delay = 3000, enabled = true }: UseAutosaveOptions) {
  const [status, setStatus] = useState<SaveStatusType>("saved");
  const lastSavedRef = useRef<string>("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const payloadKey = JSON.stringify(payload);

  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: (data: AutosavePayload) => updateNote(id as string, data),
    onSuccess: (_data, vars) => {
      lastSavedRef.current = JSON.stringify(vars);
      setStatus("saved");
      qc.invalidateQueries({ queryKey: ["notes"] });
      qc.invalidateQueries({ queryKey: ["note", id] });
    },
    onError: (err) => {
      if ((err as Error).name === "AbortError") return;
      setStatus("error");
    },
  });

  const save = useCallback(
    async (data: AutosavePayload) => {
      if (!id || !enabled) return;
      const key = JSON.stringify(data);
      if (key === lastSavedRef.current) return;
      setStatus("saving");
      try {
        await mutation.mutateAsync(data);
      } catch {
        // handled in onError
      }
    },
    [id, enabled, mutation],
  );

  useEffect(() => {
    if (!id || !enabled) return;
    if (payloadKey === lastSavedRef.current) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      save(payload);
    }, delay);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payloadKey, id, enabled, delay, save]);

  const triggerImmediateSave = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    save(payload);
  }, [save, payload]);

  useEffect(() => {
    lastSavedRef.current = payloadKey;
    setStatus("saved");
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return { status, triggerImmediateSave };
}
