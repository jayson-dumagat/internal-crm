import type { ReactNode } from "react";
import { Toaster, toast } from "sonner";

import { ToastContext } from "./ToastContext";

type ToastProviderProps = {
  children: ReactNode;
};

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const value = {
    success: toast.success,
    error: toast.error,
    info: toast.info,
    warning: toast.warning,
    loading: toast.loading,
    dismiss: toast.dismiss,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}

      <Toaster
        position="top-right"
        gap={12}
        offset={20}
        mobileOffset={16}
        visibleToasts={3}
        toastOptions={{
          duration: 4000,
          className:
            "border border-gray-200 bg-white text-gray-800 shadow-theme-lg dark:border-gray-700 dark:bg-gray-900 dark:text-white/90",
          descriptionClassName:
            "text-gray-500 dark:text-gray-400",
        }}
      />
    </ToastContext.Provider>
  );
};