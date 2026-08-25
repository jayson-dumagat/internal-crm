import type { Server } from "socket.io";
import type { CrmRealtimeEvent, RealtimeEvent } from "./realtime-events";

let realtimeServer: Server | null = null;

export function registerRealtimeServer(server: Server) {
  realtimeServer = server;
}

export function emitPermissionUpdate(tenantId: string, userId?: string) {
  realtimeServer
    ?.to(`tenant:${tenantId}`)
    .emit("permissions.updated", { userId: userId ?? null });
}

export function emitCrmEvent(event: CrmRealtimeEvent) {
  realtimeServer?.to(`tenant:${event.tenantId}`).emit("crm.event", event);
}

export function emitRealtimeEvent(event: RealtimeEvent) {
  if (event.type === "crm.event") {
    emitCrmEvent(event);
    return;
  }

  emitPermissionUpdate(event.tenantId, event.userId ?? undefined);
}

export function emitNotification(notification: Record<string, unknown>) {
  const tenantId =
    typeof notification.tenantId === "string"
      ? notification.tenantId
      : undefined;
  if (!tenantId || !realtimeServer) return;

  const actorObjectId =
    typeof notification.actorObjectId === "string"
      ? notification.actorObjectId
      : undefined;
  const room = realtimeServer.sockets.adapter.rooms.get(`tenant:${tenantId}`);
  if (!room) return;

  for (const socketId of room) {
    const socket = realtimeServer.sockets.sockets.get(socketId);
    if (!socket) continue;

    const sessionUser = socket.data.sessionUser as
      | { entraObjectId?: string }
      | undefined;
    if (actorObjectId && sessionUser?.entraObjectId === actorObjectId) continue;
    socket.emit("notification.created", notification);
  }
}
