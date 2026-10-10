import { auth } from "@/lib/auth"; // your Better Auth instance
import { headers } from "next/headers";
import { forbidden, unauthorized } from "./error";

// Returns the session user or throws 401.
export async function requireAuth() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) throw unauthorized();
  return session.user;
}

// Returns the session user if role === "admin", else throws 401/403.
export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== "admin") throw forbidden();
  return user;
}
