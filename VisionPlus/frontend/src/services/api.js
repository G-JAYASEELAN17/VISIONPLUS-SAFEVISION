import axios from "axios";

// =======================================================
// VisionPlus API Configuration
// =======================================================

const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000";

console.log("VisionPlus Backend:", baseURL);

export const api = axios.create({
  baseURL,
  timeout: 600000, // 10 minutes
  headers: {
    "Content-Type": "application/json",
  },
});

// =======================================================
// Request Interceptor
// =======================================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("sv_token");

    // Ignore fake development token
    if (token && token !== "dev-mode") {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// =======================================================
// Response Interceptor
// =======================================================

api.interceptors.response.use(
  (response) => response,

  (error) => {
    console.error("API Error:", error);

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    }

    if (error?.response?.status === 401) {
      localStorage.removeItem("sv_token");
      localStorage.removeItem("sv_user");

      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// =======================================================
// Authentication
// =======================================================

export const login = (email, password) =>
  api.post("/auth/login", {
    email,
    password,
  });

export const register = (
  full_name,
  email,
  password
) =>
  api.post("/auth/register", {
    full_name,
    email,
    password,
  });

export const getMe = () =>
  api.get("/auth/me");

// =======================================================
// Dashboard
// =======================================================

export const getDashboardStats = () =>
  api.get("/dashboard/stats");

export const getRecentAlerts = () =>
  api.get("/dashboard/recent-alerts");

export const getRecentReports = () =>
  api.get("/dashboard/recent-reports");

// =======================================================
// Camera APIs
// =======================================================

export const getCameras = () =>
  api.get("/camera/");

export const addCamera = (payload) =>
  api.post("/camera/", payload);

export const deleteCamera = (id) =>
  api.delete(`/camera/${id}`);
// =======================================================
// Videos
// =======================================================

export const getVideos = () => api.get("/video/");

export const uploadVideo = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await api.post("/video/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onUploadProgress) {
          onUploadProgress(progressEvent);
        }
      },
    });

    console.log("✅ Upload Success:", response.data);

    return response;
  } catch (error) {
    console.error("❌ Upload Failed");

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Response:", error.response.data);
    } else {
      console.error(error.message);
    }

    throw error;
  }
};

// =======================================================
// AI Analysis
// =======================================================

export const analyzeVideo = async (videoId) => {
  try {
    const response = await api.post(`/analyze/${videoId}`);

    console.log("Analysis:", response.data);

    return response;
  } catch (error) {
    console.error("Analysis Error:", error);
    throw error;
  }
};

// =======================================================
// Alerts
// =======================================================

export const getAlerts = () =>
  api.get("/alerts/");

// =======================================================
// Reports
// =======================================================

export const getReports = () =>
  api.get("/reports/");

export const getReport = (videoId) =>
  api.get(`/reports/${videoId}`);

// =======================================================
// Analytics
// =======================================================

export const getAnalytics = () =>
  api.get("/analytics/");

// =======================================================
// Investigation
// =======================================================

export const getEvents = (videoId) =>
  api.get(`/events/${videoId}`);

export const getInvestigation = (videoId) =>
  api.get(`/investigation/${videoId}`);

// =======================================================
// Notifications
// =======================================================

export const getNotifications = (
  unreadOnly = false
) =>
  api.get("/notifications/", {
    params: {
      unread_only: unreadOnly,
    },
  });

export const getUnreadNotificationCount =
  () => api.get("/notifications/unread-count");

export const markNotificationRead = (id) =>
  api.post(`/notifications/${id}/read`);

export const markAllNotificationsRead = () =>
  api.post("/notifications/read-all");

// =======================================================
// Report Downloads
// =======================================================

const downloadFile = async (
  url,
  filename
) => {
  const response = await api.get(url, {
    responseType: "blob",
  });

  const blob = new Blob([response.data]);

  const blobUrl =
    window.URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = blobUrl;
  link.download = filename;

  document.body.appendChild(link);

  link.click();

  link.remove();

  window.URL.revokeObjectURL(blobUrl);
};

export const downloadReportPdf = (
  videoId
) =>
  downloadFile(
    `/reports/${videoId}/export/pdf`,
    `report_${videoId}.pdf`
  );

export const downloadReportCsv = (
  videoId
) =>
  downloadFile(
    `/reports/${videoId}/export/csv`,
    `report_${videoId}.csv`
  );

export const downloadReportJson = (
  videoId
) =>
  downloadFile(
    `/reports/${videoId}/export/json`,
    `report_${videoId}.json`
  );
  // =======================================================
// Live Monitoring
// =======================================================

// MJPEG Stream URL
export const getLiveStreamUrl = () => `${baseURL}/stream/`;

// Current Stream Status
export const getLiveStatus = () =>
  api.get("/stream/status");

// Controls
export const startLiveMonitoring = () =>
  api.post("/stream/start");

export const stopLiveMonitoring = () =>
  api.post("/stream/stop");

export const pauseLiveMonitoring = () =>
  api.post("/stream/pause");

export const resumeLiveMonitoring = () =>
  api.post("/stream/resume");

export const restartLiveMonitoring = () =>
  api.post("/stream/restart");

export const toggleLiveDetection = () =>
  api.post("/stream/detection-toggle");

// =======================================================
// Media URL Resolver
// =======================================================

export const resolveMediaUrl = (filepath) => {
  if (!filepath) return null;

  const clean = filepath.replace(/^\/+/, "");

  if (clean.startsWith("reports/")) {
    return `${baseURL}/media/reports/${clean.replace(
      "reports/",
      ""
    )}`;
  }

  if (clean.startsWith("uploads/videos/")) {
    return `${baseURL}/media/uploads/${clean.replace(
      "uploads/videos/",
      ""
    )}`;
  }

  return `${baseURL}/${clean}`;
};

// =======================================================
// Chatbot
// =======================================================

export const askChatbot = async (question) => {
  try {
    const response = await api.post("/chatbot/ask", {
      question,
    });

    return response;
  } catch (error) {
    console.error("Chatbot Error:", error);
    throw error;
  }
};

export const getChatHistory = (limit = 50) =>
  api.get("/chatbot/history", {
    params: {
      limit,
    },
  });

// =======================================================
// Health
// =======================================================

export const getHealth = () =>
  api.get("/system/health");

// =======================================================
// Default Export
// =======================================================

export default api;