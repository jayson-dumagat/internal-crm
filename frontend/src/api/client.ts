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
    "Content-Type": "application/json",
  },
});

