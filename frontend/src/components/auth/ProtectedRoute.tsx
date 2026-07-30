import { useEffect, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigate, useLocation } from "react-router";
import { getCurrentSession } from "../../api/auth";
import { useAuthStore } from "../../stores/authStore";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);

  const sessionQuery = useQuery({
    queryKey: ["auth", "session"],
    queryFn: getCurrentSession,
    staleTime: 30 * 1000,
    retry: false,
    refetchOnMount: "always",
    refetchInterval: 60 * 1000,
  });

  useEffect(() => {
    if (sessionQuery.data) {
      setUser(sessionQuery.data.user);
    }
  }, [sessionQuery.data, setUser]);

  useEffect(() => {
    if (sessionQuery.isError) {
      clearUser();
    }
  }, [clearUser, sessionQuery.isError]);

  if (sessionQuery.isPending) {
    return (
      <div
        role="status"
        aria-label="Checking your session"
        className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950"
      >
        <div className="flex flex-col items-center gap-3">
          <span
            aria-hidden="true"
            className="size-9 animate-spin rounded-full border-3 border-gray-200 border-t-brand-500 dark:border-gray-800 dark:border-t-brand-400"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Checking your session...
          </p>
        </div>
      </div>
    );
  }

  if (sessionQuery.isError) {
    return (
      <Navigate
        to="/signin"
        replace
        state={{ returnTo: `${location.pathname}${location.search}` }}
      />
    );
  }

  return children;
}
