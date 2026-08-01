import axios from "axios";
import { getAuth } from "firebase/auth";

import app from "../firebase/firebase.config";
import { apiBaseUrl } from "../lib/api";

const axiosSecure = axios.create({
  baseURL: apiBaseUrl || "/",
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
