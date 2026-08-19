import { AppDataSource } from "../../database/data-source";
import { Activity } from "./activity.entity";
import { publishNotification } from "../../services/notifications";

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
  const saved = await AppDataSource.getRepository(Activity).save(
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
  await publishNotification({
    tenantId: input.tenantId,
    id: saved.id,
    title: input.action,
    message: `${input.actorName} ${input.action} ${input.target}`,
    category: input.category,
    createdAt: saved.createdAt,
  }).catch((error) => console.error("Failed to publish CRM notification", error));
}
