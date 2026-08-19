import type { Server } from "socket.io";

let realtimeServer: Server | null = null;

export function registerRealtimeServer(server: Server) {
  realtimeServer = server;
}

export function emitPermissionUpdate(tenantId: string, userId?: string) {
  realtimeServer?.to(`tenant:${tenantId}`).emit("permissions.updated", { userId: userId ?? null });
}

export function emitNotification(notification: Record<string, unknown>) {
  const tenantId = typeof notification.tenantId === "string" ? notification.tenantId : undefined;
  if (tenantId) realtimeServer?.to(`tenant:${tenantId}`).emit("notification.created", notification);
}
