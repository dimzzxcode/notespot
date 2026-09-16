import { clearSessionCookie } from "@/lib/auth/session";
import { successResponse, errorResponse } from "@/lib/api/response";

export async function POST() {
  try {
    await clearSessionCookie();
    return successResponse({ message: "Logged out" });
  } catch (err) {
    console.error("POST /api/auth/logout failed:", err);
    return errorResponse("INTERNAL_ERROR", "Failed to logout", 500);
  }
}
