import type { AuthUser } from "../api/auth";

/** Permission codes are owned by the backend permissions table. The frontend
 * accepts string codes so adding a permission does not require a rebuild. */
export type AccessPermission = string;

export function hasPermission(
  user: Pick<AuthUser, "permissions"> | null | undefined,
  permission: AccessPermission,
): boolean {
  return Boolean(user?.permissions.includes(permission));
}

export function hasAnyPermission(
  user: Pick<AuthUser, "permissions"> | null | undefined,
): boolean {
  return Boolean(user?.permissions.length);
}
