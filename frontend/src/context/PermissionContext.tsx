import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import { io } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";

import { useAuth } from "../hooks/auth/useAuth";
import type { AccessPermission } from "../config/rbac";
import { authKeys } from "../hooks/auth/useAuthApi";

export type PermissionResource = "leads" | "companies" | "contacts" | "tasks" | "notes" | "activities";
export type PermissionField = string;
export type PermissionDataScope = "all" | "assigned" | "own";

type PermissionContextValue = {
  user: ReturnType<typeof useAuth>["user"];
  can: (permission: AccessPermission) => boolean;
  canAny: (...permissions: AccessPermission[]) => boolean;
  canAll: (...permissions: AccessPermission[]) => boolean;
  canViewField: (field: PermissionField) => boolean;
  dataScope: (resource: PermissionResource) => PermissionDataScope;
  isRecordRestricted: (resource: PermissionResource) => boolean;
  canAccessRecord: (resource: PermissionResource, recordId: string) => boolean;
  canCreate: (resource: PermissionResource) => boolean;
};

const sensitiveFields = new Set([
  "companies.revenue", "companies.contacts", "contacts.email", "contacts.phone", "contacts.owner",
  "contacts.location", "contacts.preferences", "leads.email", "leads.phone", "leads.owner",
  "leads.assignedTo", "leads.address", "leads.revenue", "tasks.schedule", "tasks.description",
  "tasks.assignee", "tasks.lead", "notes.content", "notes.relatedTo", "notes.author",
  "activities.actor", "activities.target", "activities.details", "activities.ipAddress",
]);

const createPermissions: Record<PermissionResource, AccessPermission> = {
  leads: "leads.create",
  companies: "companies.create",
  contacts: "contacts.create",
  tasks: "tasks.create",
  notes: "notes.create",
  activities: "activities.create",
};

const PermissionContext = createContext<PermissionContextValue | null>(null);

export function PermissionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user?.entraObjectId) return;
    const configuredApiUrl = import.meta.env.VITE_API_URL as string | undefined;
    const socketUrl = configuredApiUrl?.startsWith("http")
      ? new URL(configuredApiUrl).origin
      : window.location.origin;
    const socket = io(socketUrl, { withCredentials: true, transports: ["websocket", "polling"] });
    const handlePermissionUpdate = (event: { userId?: string | null }) => {
      if (event.userId && event.userId !== user.entraObjectId) return;
      queryClient.invalidateQueries({ queryKey: authKeys.session() });
    };
    socket.on("permissions.updated", handlePermissionUpdate);
    return () => {
      socket.off("permissions.updated", handlePermissionUpdate);
      socket.disconnect();
    };
  }, [queryClient, user?.entraObjectId]);
  const value = useMemo<PermissionContextValue>(() => {
    const permissions = new Set(user?.permissions ?? []);
    const policy = user?.accessPolicy;
    const assignments = policy?.resourceAssignments ?? {};

    return {
      user,
      can: (permission) => permissions.has(permission),
      canAny: (...required) => required.some((permission) => permissions.has(permission)),
      canAll: (...required) => required.every((permission) => permissions.has(permission)),
      canViewField: (field) => policy?.fieldRules?.[field] !== "hidden" && (!sensitiveFields.has(field) || permissions.has("data.sensitive.read")),
      dataScope: (resource) => policy?.dataScopes?.[resource] === "own" || policy?.dataScopes?.[resource] === "assigned" ? policy.dataScopes[resource] : "all",
      isRecordRestricted: (resource) => Object.prototype.hasOwnProperty.call(assignments, resource),
      canAccessRecord: (resource, recordId) => !Object.prototype.hasOwnProperty.call(assignments, resource) || (assignments[resource] ?? []).includes(recordId),
      canCreate: (resource) => permissions.has(createPermissions[resource]) && !Object.prototype.hasOwnProperty.call(assignments, resource),
    };
  }, [user]);

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
}

export function usePermission(): PermissionContextValue {
  const context = useContext(PermissionContext);
  if (!context) throw new Error("usePermission must be used inside PermissionProvider");
  return context;
}

export function usePermissionOptional(): PermissionContextValue | null {
  return useContext(PermissionContext);
}
