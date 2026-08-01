import axios from 'axios';

const axiosSecure = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

// Request interceptor to add authorization header dynamically
axiosSecure.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jstu_net_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const useAxiosSecure = () => {
  return axiosSecure;
};
