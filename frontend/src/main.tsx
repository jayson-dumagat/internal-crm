import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "swiper/swiper-bundle.css";
import "simplebar-react/dist/simplebar.min.css";
import "flatpickr/dist/flatpickr.css";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext.tsx";
import { SearchProvider } from "./context/SearchContext.tsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <AppWrapper>
            <SearchProvider>
            <App />
            </SearchProvider>
            <Toaster
              position="top-right"
              gap={12}
              offset={20}
              mobileOffset={16}
              visibleToasts={3}
              toastOptions={{
                duration: 4000,
                className: "border border-gray-200 bg-white text-gray-800 shadow-theme-lg dark:border-gray-700 dark:bg-gray-900 dark:text-white/90",
                descriptionClassName: "text-gray-500 dark:text-gray-400",
              }}
            />
          </AppWrapper>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
);
