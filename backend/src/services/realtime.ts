import type { Server } from "socket.io";

let realtimeServer: Server | null = null;

export function registerRealtimeServer(server: Server) {
  realtimeServer = server;
}

export function emitPermissionUpdate(tenantId: string, userId?: string) {
  realtimeServer?.to(`tenant:${tenantId}`).emit("permissions.updated", { userId: userId ?? null });
}
