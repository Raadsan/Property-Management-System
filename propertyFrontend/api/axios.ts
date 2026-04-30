import axios from "axios";

const getBaseURL = () => {
  // If we are on the client side (browser) and the site is HTTPS, we must use a relative path
  // to avoid Mixed Content errors when connecting to an HTTP backend.
  // Next.js rewrites in next.config.ts will proxy this relative path to the live backend.
  if (typeof window !== "undefined") {
    // Check if it's explicitly set to an HTTPS URL, otherwise use the proxy route
    if (process.env.NEXT_PUBLIC_API_URL?.startsWith("https://")) {
      return process.env.NEXT_PUBLIC_API_URL;
    }
    return "/api";
  }
  
  // On the server side, we can safely use the HTTP IP address directly
  return process.env.NEXT_PUBLIC_API_URL || "http://178.18.241.5:8002/api";
  //  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002/api";
  
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if needed
    // const token = localStorage.getItem("token");
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle global errors like 401 or 500
    if (error.response) {
      console.error("API Error:", error.response.data);
    } else {
      console.error("Network Error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
