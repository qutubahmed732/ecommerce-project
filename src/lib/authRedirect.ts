import type { UserRole } from "@/types";

export function getAuthenticatedDestination(role: UserRole | null | undefined) {
  if (role === "ADMIN") return "/admin";
  if (role === "VENDOR") return "/vendor-dashboard";
  if (role === "USER") return "/user-dashboard";
  return "/";
}
