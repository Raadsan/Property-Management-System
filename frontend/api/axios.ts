import axios from "axios";
import { clearAuthSession, getToken } from "@/lib/authSession";

const getBaseURL = () => {
  if (typeof window !== "undefined") {
    if (process.env.NEXT_PUBLIC_API_URL?.startsWith("https://")) {
      return process.env.NEXT_PUBLIC_API_URL;
    }
    return "/api";
  }

  const serverApi =
    process.env.API_PROXY_TARGET ||
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ||
    "http://localhost:8002";

  return `${serverApi}/api`;
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
});

const ADMIN_PREFIXES = ["/dashboard", "/content", "/settings", "/reports", "/communication"];

function isAdminPath(path: string) {
  return ADMIN_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      clearAuthSession();

      const path = window.location.pathname;
      if (isAdminPath(path)) {
        window.location.href = "/login";
      }
    }

    if (error.response) {
      console.error("API Error:", error.response.data);
    } else {
      console.error("Network Error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
