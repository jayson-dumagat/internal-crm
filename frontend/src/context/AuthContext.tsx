import { createContext } from "react";
import type { AuthUser } from "../api/auth";

export type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  setUser: (user: AuthUser) => void;
  clearUser: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);





