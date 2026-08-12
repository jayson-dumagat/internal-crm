import { AppDataSource } from "../../database/data-source.js";
import { Permission } from "./permission.entity.js";
import { Role } from "./role.entity.js";
import type { AccessPolicySnapshot } from "./access-control.js";

/** Loads role grants from PostgreSQL. There is deliberately no in-process
 * permission cache, so an access-control change is visible on the next API
 * request. */
export async function getDatabasePermissionsForRoles(roles: readonly string[]): Promise<string[]> {
  if (!roles.length) return [];
  const normalizedRoles = new Set(roles.map((role) => role.trim().toLowerCase()));
  const records = await AppDataSource.getRepository(Role).find({
    where: { isActive: true },
    relations: { permissions: true },
  });
  const permissions = new Set<string>();
  for (const role of records) {
    if (!normalizedRoles.has(role.entraAppRoleValue.trim().toLowerCase())) continue;
    for (const permission of role.permissions ?? []) permissions.add(permission.code);
  }
  return [...permissions];
}

export async function getDatabasePermissionCatalog(): Promise<Permission[]> {
  return AppDataSource.getRepository(Permission).find({ order: { code: "ASC" } });
}

export function applyPermissionPolicy(
  baselinePermissions: readonly string[],
  policy?: Partial<AccessPolicySnapshot> | null,
): string[] {
  const effective = new Set(baselinePermissions);
  const allowed = new Set(policy?.allowedPermissions ?? []);
  const denied = new Set(policy?.deniedPermissions ?? []);
  if (allowed.size) {
    for (const permission of effective) if (!allowed.has(permission)) effective.delete(permission);
  }
  for (const permission of denied) effective.delete(permission);
  return [...effective];
}

export async function getDatabaseEffectivePermissions(
  roles: readonly string[],
  policy?: Partial<AccessPolicySnapshot> | null,
): Promise<string[]> {
  return applyPermissionPolicy(await getDatabasePermissionsForRoles(roles), policy);
}
