import { useEffect, useMemo, type ReactNode } from "react";
import { useAuthStore } from "../stores/authStore";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);

  useEffect(() => {
    const handleSessionExpired = () => {
      clearUser();
    };

    window.addEventListener("auth:session-expired", handleSessionExpired);

    return () => {
      window.removeEventListener(
        "auth:session-expired",
        handleSessionExpired,
      );
    };
  }, [clearUser]);

  const value = useMemo(
    () => ({ user, isAuthenticated, setUser, clearUser }),
    [clearUser, isAuthenticated, setUser, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
