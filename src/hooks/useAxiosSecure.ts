import axios from "axios";
import { getAuth } from "firebase/auth";

import app from "../firebase/firebase.config";

const axiosSecure = axios.create({
  baseURL: (import.meta as any).env.VITE_API_URL || "/",
  headers: { "Content-Type": "application/json" },
});

axiosSecure.interceptors.request.use(async (config) => {
  const user = getAuth(app).currentUser;

  if (!user) {
    return Promise.reject(new Error("Authentication is required."));
  }

  config.headers.Authorization = `Bearer ${await user.getIdToken()}`;
  return config;
});

export const useAxiosSecure = () => axiosSecure;
