// services/api.js
import axios from "axios";
import { startLoading, stopLoading } from "./loadingTracker";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "https://secureshield-backend-1.onrender.com"
)
  .trim()
  .replace(/\/+$/, "");

export { API_BASE_URL };

const MAX_GET_RETRIES = 2;
const RETRY_STATUSES = [502, 503, 504, 429];

// Fire-and-forget ping to wake a cold backend (Render free tier) so the
// first real request the user makes is fast.
export const warmUpServer = () => {
  try {
    fetch(`${API_BASE_URL}/`, {
      method: "GET",
      headers: { "ngrok-skip-browser-warning": "true" },
      cache: "no-store",
      keepalive: true,
    }).catch(() => {});
  } catch {
    // ignore
  }
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  timeout: 20000,
});

// --- Request Interceptor ---
api.interceptors.request.use(
  (config) => {
    startLoading();
    config.headers["ngrok-skip-browser-warning"] = "true";
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    stopLoading();
    return Promise.reject(error);
  }
);

// --- Response Interceptor ---
api.interceptors.response.use(
  (response) => {
    stopLoading();
    return response;
  },
  async (error) => {
    stopLoading();

    const config = error.config || {};
    const status = error.response?.status;
    const method = (config.method || "get").toLowerCase();
    const canRetry =
      Boolean(config.url) &&
      method === "get" &&
      (!error.response || RETRY_STATUSES.includes(status)) &&
      (config.__retryCount || 0) < MAX_GET_RETRIES;

    if (canRetry) {
      config.__retryCount = (config.__retryCount || 0) + 1;
      const delay = 700 * config.__retryCount;
      await new Promise((resolve) => setTimeout(resolve, delay));
      return api(config);
    }

    if (error.code === "ERR_NETWORK") {
      throw { 
        message: "Cannot connect to server. Please check your connection.",
        isCorsError: true
      };
    }
    if (error.response) {
      const errorData = error.response.data || { message: "Server error occurred" };
      errorData.status = error.response.status;
      throw errorData;
    }
    throw { message: error.message || "An error occurred" };
  }
);

// ==================== AUTH ENDPOINTS ====================

export const register = async (userData) => {
  try {
    const response = await api.post("/auth/register", userData);
    if (response.data.accessToken) {
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Registration failed" };
  }
};

export const login = async (credentials) => {
  try {
    const response = await api.post("/auth/login", credentials);
    if (response.data.accessToken) {
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Login failed" };
  }
};

export const logout = async () => {
  try {
    const response = await api.post("/auth/logout");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    return response.data;
  } catch (error) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    throw error.response?.data || { message: "Logout failed" };
  }
};

export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("accessToken");
};

export const updateProfile = async (userData) => {
  try {
    const response = await api.put("/auth/profile", userData);
    if (response.data.user) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to update profile" };
  }
};

export const changePassword = async (passwordData) => {
  try {
    const response = await api.put("/auth/change-password", passwordData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to change password" };
  }
};

// ==================== SCAN ENDPOINTS ====================

export const scanURL = async (url) => {
  try {
    const response = await api.post("/scans/url", { url });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to scan URL" };
  }
};

export const scanMessage = async (message) => {
  try {
    const response = await api.post("/scans/messages", { message });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to scan message" };
  }
};

// ==================== HISTORY ENDPOINTS ====================

export const getScanHistory = async (type = null) => {
  try {
    const params = type ? { type } : {};
    const response = await api.get("/scans", { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch scan history" };
  }
};

export const getScanByReference = async (reference) => {
  try {
    const response = await api.get(`/scans/${reference}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch scan details" };
  }
};

export const deleteScanByReference = async (reference) => {
  try {
    const ref = String(reference).trim();
    if (!ref) {
      throw new Error("Invalid reference ID");
    }

    const response = await api.delete(`/scans/${ref}`, {
      headers: { 
        "Accept": "*/*",
        "Content-Type": "*/*",
      },
    });

    if (response.status === 204) {
      return { message: "Scan deleted successfully", success: true };
    }
    
    if (response.data) {
      return response.data;
    }
    
    return { message: "Scan deleted successfully", success: true };
  } catch (error) {
    if (error.code === "ERR_NETWORK") {
      throw { 
        message: "Cannot connect to server. Please check your connection.",
        isCorsError: true
      };
    }
    
    if (error.response) {
      if (error.response.status === 204) {
        return { message: "Scan deleted successfully", success: true };
      }
      
      if (error.response.status === 401) {
        throw { 
          status: 401, 
          message: "Session expired. Please login again." 
        };
      }
      
      if (error.response.status === 403) {
        throw { 
          status: 403, 
          message: "You don't have permission to delete this scan." 
        };
      }
      
      if (error.response.status === 404) {
        throw { 
          status: 404, 
          message: "Scan not found. It may have already been deleted." 
        };
      }
      
      throw error.response.data || { message: "Failed to delete scan" };
    }
    
    throw { message: error.message || "Failed to delete scan" };
  }
};

export const downloadScanReport = async (reference) => {
  try {
    const response = await api.get(`/scans/${reference}/report`, {
      responseType: "blob",
    });
    return response;
  } catch (error) {
    if (error.response && error.response.data) {
      try {
        const errorText = await error.response.data.text();
        try {
          const errorJson = JSON.parse(errorText);
          throw errorJson;
        } catch {
          throw { message: errorText || "Failed to download report" };
        }
      } catch {
        throw { message: "Failed to download report" };
      }
    }
    throw { message: "Failed to download report" };
  }
};

// ==================== DASHBOARD ENDPOINTS ====================

export const getDashboardStats = async () => {
  try {
    const response = await api.get("/dashboard/stats");
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch dashboard statistics" };
  }
};

// ==================== FEEDBACK ENDPOINTS ====================

export const submitFeedbackMessage = async (message) => {
  try {
    const response = await api.post("/feedback", { message });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to submit feedback" };
  }
};

export const submitAccuracy = async (data) => {
  try {
    if (!data.reference) {
      throw new Error("Scan reference is required");
    }
    const payload = {
      reference: data.reference,
      accurate: data.accurate
    };
    const response = await api.post("/feedback/accuracy", payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to submit accuracy" };
  }
};

export default api;