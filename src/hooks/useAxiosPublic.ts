import axios from "axios";
import { apiBaseUrl } from "../lib/api";

const axiosPublic = axios.create({
  baseURL: apiBaseUrl || "/",
  headers: {
    "Content-Type": "application/json",
  },
});

export const useAxiosPublic = () => {
  return axiosPublic;
};
