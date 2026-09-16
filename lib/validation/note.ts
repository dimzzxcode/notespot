import { z } from "zod";

export const titleSchema = z
  .string()
  .trim()
  .min(1, "Title is required")
  .max(255, "Title must be at most 255 characters");

export const contentSchema = z
  .string()
  .max(50000, "Content must be at most 50000 characters");

export const noteIdSchema = z.coerce.number().int().positive("Note ID must be a positive integer");

export const createNoteSchema = z.object({
  title: titleSchema,
  content: contentSchema.default(""),
});

export const updateNoteSchema = z
  .object({
    title: titleSchema.optional(),
    content: contentSchema.optional(),
  })
  .refine((data) => data.title !== undefined || data.content !== undefined, {
    message: "At least one of title or content must be provided",
  });

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(["asc", "desc"]).default("desc"),
});

export const searchQuerySchema = z.object({
  q: z.string().trim().max(200).optional().default(""),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type SearchQueryInput = z.infer<typeof searchQuerySchema>;
