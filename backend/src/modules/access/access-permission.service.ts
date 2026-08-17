import { AppDataSource } from "../../database/data-source.js";
import { Permission } from "./permission.entity.js";
import { Role } from "./role.entity.js";
import type { AccessPolicySnapshot } from "./access-control.js";

export async function getDatabasePermissionsForRoles(
  roles: readonly string[],
): Promise<string[]> {
  if (!roles.length) return [];
  const normalizedRoles = new Set(
    roles.map((role) => role.trim().toLowerCase()),
  );
  const records = await AppDataSource.getRepository(Role).find({
    where: { isActive: true },
    relations: { permissions: true },
  });
  const permissions = new Set<string>();
  for (const role of records) {
    if (!normalizedRoles.has(role.entraAppRoleValue.trim().toLowerCase()))
      continue;
    for (const permission of role.permissions ?? [])
      permissions.add(permission.code);
  }
  return [...permissions];
}

export async function getDatabasePermissionCatalog(): Promise<Permission[]> {
  return AppDataSource.getRepository(Permission).find({
    order: { code: "ASC" },
  });
}

export function applyPermissionPolicy(
  baselinePermissions: readonly string[],
  policy?: Partial<AccessPolicySnapshot> | null,
): string[] {
  const effective = new Set(baselinePermissions);
  const denied = new Set(policy?.deniedPermissions ?? []);

  // Permission policies are restrictive overrides. An empty or legacy
  // allowedPermissions value must never turn into an implicit allowlist: doing
  // so would remove every other Entra role permission after one checkbox is
  // enabled again. Entra roles remain the source of grants; deniedPermissions
  // is the explicit revocation list.
  for (const permission of denied) effective.delete(permission);

  return [...effective];
}

export async function getDatabaseEffectivePermissions(
  roles: readonly string[],
  policy?: Partial<AccessPolicySnapshot> | null,
): Promise<string[]> {
  return applyPermissionPolicy(
    await getDatabasePermissionsForRoles(roles),
    policy,
  );
}
