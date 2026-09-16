import { registerSchema } from "@/lib/validation/auth";
import { findUserByEmail, createUser } from "@/lib/auth/userRepository";
import { hashPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";
import { errorResponse, successResponse } from "@/lib/api/response";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("VALIDATION_ERROR", "Invalid request", 400, parsed.error.flatten());
    }
    const { name, email, password } = parsed.data;
    const existing = await findUserByEmail(email);
    if (existing) {
      return errorResponse("EMAIL_EXISTS", "Email already registered", 409);
    }
    const passwordHash = await hashPassword(password);
    const user = await createUser({ name, email, passwordHash });
    await setSessionCookie({ userId: user.id, email: user.email });
    return successResponse({ id: user.id, name: user.name, email: user.email }, 201);
  } catch (err) {
    console.error("POST /api/auth/register failed:", err);
    return errorResponse("INTERNAL_ERROR", "Failed to register", 500);
  }
}
