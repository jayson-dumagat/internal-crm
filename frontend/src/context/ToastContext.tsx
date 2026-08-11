import { createContext } from "react";
import type { ExternalToast } from "sonner";

export type ToastContextType = {
  success: (message: string, options?: ExternalToast) => void;
  error: (message: string, options?: ExternalToast) => void;
  info: (message: string, options?: ExternalToast) => void;
  warning: (message: string, options?: ExternalToast) => void;
  loading: (message: string, options?: ExternalToast) => string | number;
  dismiss: (toastId?: string | number) => void;
};

export const ToastContext = createContext<ToastContextType | null>(null);