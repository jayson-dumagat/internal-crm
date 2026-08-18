import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_API_URL?.replace(/\/+$/, "");

if (!apiBaseUrl) {
  throw new Error("VITE_API_URL is required.");
}

export const apiClient = axios.create({
  baseURL: `${apiBaseUrl}/v1`,
  withCredentials: true,
  timeout: 15_000,
  headers: {
    Accept: "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      typeof window !== "undefined" &&
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      (String(error.config?.url ?? "").includes("/auth/session") ||
        error.response?.data?.error === "authentication_session_missing")
    ) {
      window.dispatchEvent(new Event("auth:session-expired"));
    }

    return Promise.reject(error);
  },
);
