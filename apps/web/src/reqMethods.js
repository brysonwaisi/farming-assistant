import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/";

export const pubRequest = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export const userRequest = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

let refreshPromise = null;

userRequest.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    const isRefreshCall = original?.url?.includes("/auth/refresh");
    if (status === 401 && original && !original._retried && !isRefreshCall) {
      original._retried = true;
      try {
        if (!refreshPromise) {
          refreshPromise = pubRequest.post("/auth/refresh").finally(() => {
            refreshPromise = null;
          });
        }
        await refreshPromise;
        return userRequest(original);
      } catch (refreshErr) {
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(error);
  }
);
