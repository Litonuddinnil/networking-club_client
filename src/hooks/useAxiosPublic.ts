import axios, { AxiosError } from "axios";
import { apiBaseUrl } from "../lib/api";

const axiosPublic = axios.create({
  baseURL: apiBaseUrl || "/",
  headers: {
    "Content-Type": "application/json",
  },
});

// Debug-only logging so every public GET/POST shows in the browser console.
// Guarded by import.meta.env.DEV so production stays silent.
axiosPublic.interceptors.request.use((config) => {
  if (import.meta.env.DEV) {
    console.info(
      `[api-public] → ${config.method?.toUpperCase()} ${config.url}`,
      config.params ? { params: config.params } : undefined
    );
  }
  return config;
});

axiosPublic.interceptors.response.use(
  (res) => {
    if (import.meta.env.DEV) {
      console.info(
        `[api-public] ← ${res.config.method?.toUpperCase()} ${res.config.url} ${res.status}`,
        Array.isArray(res.data) ? `(${res.data.length} item${res.data.length === 1 ? "" : "s"})` : res.data
      );
    }
    return res;
  },
  (err: AxiosError) => {
    if (import.meta.env.DEV) {
      const status = err.response?.status ?? "no-response";
      console.error(
        `[api-public] ✖ ${err.config?.method?.toUpperCase()} ${err.config?.url} → ${status}`,
        err.response?.data || err.message
      );
    }
    return Promise.reject(err);
  }
);

export const useAxiosPublic = () => {
  return axiosPublic;
};
