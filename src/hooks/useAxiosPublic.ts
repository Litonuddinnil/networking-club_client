import axios from "axios";

const axiosPublic = axios.create({
  baseURL: (import.meta as any).env.VITE_API_URL || "/",
  headers: {
    "Content-Type": "application/json",
  },
});

export const useAxiosPublic = () => {
  return axiosPublic;
};
