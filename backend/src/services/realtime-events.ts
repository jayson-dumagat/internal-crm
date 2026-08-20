import { redisClient } from "../config/redis";

export const realtimeEventChannel = "crm:realtime-events";

export type CrmEventAction = "created" | "updated" | "deleted";

export type CrmRealtimeEvent = {
  type: "crm.event";
  tenantId: string;
  resource: string;
  action: CrmEventAction;
  entityId?: string | null;
  actorObjectId?: string | null;
  occurredAt: string;
};

export type PermissionRealtimeEvent = {
  type: "permissions.updated";
  tenantId: string;
  userId?: string | null;
};

export type RealtimeEvent = CrmRealtimeEvent | PermissionRealtimeEvent;

export async function publishCrmEvent(input: {
  tenantId: string;
  resource: string;
  action: CrmEventAction;
  entityId?: string | null;
  actorObjectId?: string | null;
}): Promise<void> {
  const event: CrmRealtimeEvent = {
    type: "crm.event",
    tenantId: input.tenantId,
    resource: input.resource,
    action: input.action,
    entityId: input.entityId ?? null,
    actorObjectId: input.actorObjectId ?? null,
    occurredAt: new Date().toISOString(),
  };
  await publishRealtimeEvent(event);
}

export async function publishPermissionEvent(input: {
  tenantId: string;
  userId?: string | null;
}): Promise<void> {
  await publishRealtimeEvent({
    type: "permissions.updated",
    tenantId: input.tenantId,
    userId: input.userId ?? null,
  });
}

export async function publishRealtimeEvent(event: RealtimeEvent): Promise<void> {
  if (!redisClient.isOpen) return;
  await redisClient.publish(realtimeEventChannel, JSON.stringify(event));
}
