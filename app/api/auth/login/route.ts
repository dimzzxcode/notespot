import { loginSchema } from "@/lib/validation/auth";
import { findUserByEmail } from "@/lib/auth/userRepository";
import { verifyPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";
import { errorResponse, successResponse } from "@/lib/api/response";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("VALIDATION_ERROR", "Invalid request", 400, parsed.error.flatten());
    }
    const { email, password } = parsed.data;
    const user = await findUserByEmail(email);
    if (!user) {
      return errorResponse("INVALID_CREDENTIALS", "Invalid email or password", 401);
    }
    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return errorResponse("INVALID_CREDENTIALS", "Invalid email or password", 401);
    }
    await setSessionCookie({ userId: user.id, email: user.email });
    return successResponse({ id: user.id, name: user.name, email: user.email });
  } catch (err) {
    console.error("POST /api/auth/login failed:", err);
    return errorResponse("INTERNAL_ERROR", "Failed to login", 500);
  }
}
