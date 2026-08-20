import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { io } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";

import { useAuth } from "../hooks/auth/useAuth";
import { authKeys } from "../hooks/auth/useAuthApi";
import { crmDirectoryKeys } from "../hooks/crm/useCrmDirectory";

export type RealtimeEventName = "crm.event" | "notification.created" | "permissions.updated";
type RealtimeListener = (payload: unknown) => void;

type CrmEvent = {
  type?: string;
  resource?: string;
};

type RealtimeContextValue = {
  connected: boolean;
  subscribe: (event: RealtimeEventName, listener: RealtimeListener) => () => void;
};

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

const resourceKeys: Record<string, readonly unknown[]> = {
  companies: crmDirectoryKeys.companies(),
  contacts: crmDirectoryKeys.contacts(),
  leads: crmDirectoryKeys.leads(),
  tasks: crmDirectoryKeys.tasks(),
  notes: crmDirectoryKeys.notes(),
  activities: crmDirectoryKeys.activities(),
};

function invalidateResourceQueries(queryClient: ReturnType<typeof useQueryClient>, resource: string) {
  const key = resourceKeys[resource];
  if (!key) return;

  queryClient.invalidateQueries({ queryKey: key });
  if (resource === "companies" || resource === "contacts") {
    queryClient.invalidateQueries({ queryKey: crmDirectoryKeys.companies() });
    queryClient.invalidateQueries({ queryKey: crmDirectoryKeys.contacts() });
  }
  if (resource === "leads" || resource === "notes" || resource === "tasks") {
    queryClient.invalidateQueries({ queryKey: crmDirectoryKeys.activities() });
  }
}

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [connected, setConnected] = useState(false);
  const listenersRef = useRef(new Map<RealtimeEventName, Set<RealtimeListener>>());

  const subscribe = useCallback((event: RealtimeEventName, listener: RealtimeListener) => {
    const listeners = listenersRef.current.get(event) ?? new Set<RealtimeListener>();
    listeners.add(listener);
    listenersRef.current.set(event, listeners);
    return () => {
      listeners.delete(listener);
      if (!listeners.size) listenersRef.current.delete(event);
    };
  }, []);

  const dispatch = useCallback((event: RealtimeEventName, payload: unknown) => {
    listenersRef.current.get(event)?.forEach((listener) => listener(payload));
  }, []);

  useEffect(() => {
    if (!user?.entraObjectId) {
      setConnected(false);
      return;
    }

    const configuredApiUrl = import.meta.env.VITE_API_URL as string | undefined;
    const socketUrl = configuredApiUrl?.startsWith("http")
      ? new URL(configuredApiUrl).origin
      : window.location.origin;
    const socket = io(socketUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    const handleCrmEvent = (payload: unknown) => {
      const event = payload as CrmEvent;
      if (event.type === "crm.event" && typeof event.resource === "string") {
        invalidateResourceQueries(queryClient, event.resource);
      }
      dispatch("crm.event", payload);
    };
    const handlePermissionEvent = (payload: unknown) => {
      const event = payload as { userId?: string | null };
      if (event.userId && event.userId !== user.entraObjectId) return;
      queryClient.invalidateQueries({ queryKey: authKeys.session() });
      dispatch("permissions.updated", payload);
    };
    const handleNotification = (payload: unknown) => dispatch("notification.created", payload);

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("connect_error", () => setConnected(false));
    socket.on("crm.event", handleCrmEvent);
    socket.on("permissions.updated", handlePermissionEvent);
    socket.on("notification.created", handleNotification);

    return () => {
      socket.off("crm.event", handleCrmEvent);
      socket.off("permissions.updated", handlePermissionEvent);
      socket.off("notification.created", handleNotification);
      socket.disconnect();
      setConnected(false);
    };
  }, [dispatch, queryClient, user?.entraObjectId]);

  const value = useMemo(() => ({ connected, subscribe }), [connected, subscribe]);
  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

export function useRealtime(): RealtimeContextValue {
  const context = useContext(RealtimeContext);
  if (!context) throw new Error("useRealtime must be used inside RealtimeProvider");
  return context;
}

export function useRealtimeEvent(event: RealtimeEventName, listener: RealtimeListener) {
  const realtime = useRealtime();
  const listenerRef = useRef(listener);

  useEffect(() => {
    listenerRef.current = listener;
  }, [listener]);

  useEffect(
    () => realtime.subscribe(event, (payload) => listenerRef.current(payload)),
    [event, realtime],
  );
}
