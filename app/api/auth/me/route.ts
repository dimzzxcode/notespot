import { getCurrentUser } from "@/lib/auth/session";
import { findUserById } from "@/lib/auth/userRepository";
import { errorResponse, successResponse } from "@/lib/api/response";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return errorResponse("UNAUTHORIZED", "Not authenticated", 401);
    }
    const user = await findUserById(session.userId);
    if (!user) {
      return errorResponse("UNAUTHORIZED", "User not found", 401);
    }
    return successResponse({ id: user.id, name: user.name, email: user.email });
  } catch (err) {
    console.error("GET /api/auth/me failed:", err);
    return errorResponse("INTERNAL_ERROR", "Failed to fetch user", 500);
  }
}
