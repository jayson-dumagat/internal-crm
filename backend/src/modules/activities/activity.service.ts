import { AppDataSource } from "../../database/data-source";
import { Activity } from "./activity.entity";

const fullActivityLogRoles = new Set([
  "crm.admin",
  "admin",
  "crm.manager",
  "manager",
]);

/**
 * Activity logs are personal by default. Only the administrator and manager
 * Entra roles are allowed to review the tenant-wide audit stream.
 */
export function canViewTenantActivityLog(roles: readonly string[] = []): boolean {
  return roles.some((role) => fullActivityLogRoles.has(role.trim().toLowerCase()));
}

export async function recordActivity(input: {
  tenantId: string;
  actorId?: string | null;
  actorName: string;
  actorAvatarUrl?: string | null;
  action: string;
  target: string;
  category: string;
  outcome?: string;
  ipAddress?: string | null;
  details?: string | null;
}): Promise<void> {
  await AppDataSource.getRepository(Activity).save(
    AppDataSource.getRepository(Activity).create({
      tenantId: input.tenantId,
      actorId: input.actorId ?? null,
      actorName: input.actorName,
      actorAvatarUrl: input.actorAvatarUrl ?? null,
      action: input.action,
      target: input.target,
      category: input.category,
      outcome: input.outcome ?? "Success",
      ipAddress: input.ipAddress ?? null,
      details: input.details ?? null,
    }),
  );
}
