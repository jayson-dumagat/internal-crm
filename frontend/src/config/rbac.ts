import type { AuthUser } from "../api/auth";

export const accessPermissions = [
  "dashboard.read",
  "calendar.read",
  "tasks.read",
  "tasks.create",
  "tasks.update",
  "tasks.delete",
  "tasks.status.update",
  "notes.read",
  "notes.create",
  "notes.update",
  "notes.delete",
  "inbox.read",
  "activities.read",
  "activities.create",
  "leads.read",
  "leads.create",
  "leads.update",
  "leads.delete",
  "contacts.read",
  "contacts.create",
  "contacts.update",
  "contacts.delete",
  "companies.read",
  "companies.create",
  "companies.update",
  "companies.delete",
  "pipelines.read",
  "pipelines.manage",
  "users.read",
] as const;

export type AccessPermission = (typeof accessPermissions)[number];

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

