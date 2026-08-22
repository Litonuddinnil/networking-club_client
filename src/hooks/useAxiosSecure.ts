import axios, { AxiosError } from "axios";
import { getAuth } from "firebase/auth";

import app from "../firebase/firebase.config";
import { apiBaseUrl } from "../lib/api";

// One shared instance per app load. baseURL is the Render API URL in prod
// and "/" (relying on Vite proxy) in dev.
const axiosSecure = axios.create({
  baseURL: apiBaseUrl || "/",
  headers: { "Content-Type": "application/json" },
  timeout: 20_000,
});

axiosSecure.interceptors.request.use(async (config) => {
  const user = getAuth(app).currentUser;

  if (user) {
    try {
      config.headers.Authorization = `Bearer ${await user.getIdToken()}`;
    } catch (e) {
      console.warn("[useAxiosSecure] Failed to fetch Firebase ID token:", e);
      // fall through and send the request without auth — server decides
    }
  } else {
    // No Firebase user signed in. Don't block the request — the server is
    // responsible for any auth enforcement. This used to short-circuit
    // every admin write with "Authentication is required.", which made
    // admins think their posts weren't saving to MongoDB.
    console.info(
      `[useAxiosSecure] ${config.method?.toUpperCase()} ${config.url} (no Firebase session)`
    );
  }

  return config;
});

// One-line response logger to make admin-write debugging trivial.
axiosSecure.interceptors.response.use(
  (res) => {
    if (import.meta.env.DEV) {
      console.info(
        `[api] ${res.config.method?.toUpperCase()} ${res.config.url} → ${res.status}`
      );
    }
    return res;
  },
  (err: AxiosError) => {
    if (import.meta.env.DEV) {
      const status = err.response?.status ?? "no-response";
      console.error(
        `[api] ${err.config?.method?.toUpperCase()} ${err.config?.url} → ${status}`,
        err.response?.data || err.message
      );
    }
    return Promise.reject(err);
  }
);

export const useAxiosSecure = () => axiosSecure;
