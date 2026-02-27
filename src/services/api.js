import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4001/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const authAPI = {
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
  logout: () => api.get("/auth/logout"),
};

// Users
export const userAPI = {
  create: (data) => api.post("/users", data),
  getAll: (params) => api.get("/users", { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  toggleStatus: (id) => api.patch(`/users/${id}/toggle-status`),
  delete: (id) => api.delete(`/users/${id}`),
};

// Tasks
export const taskAPI = {
  create: (data) => api.post("/tasks", data),
  getAll: () => api.get("/tasks"),
  getMyTasks: () => api.get("/tasks/my-tasks"),
  updateStatus: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
};

// Payroll
export const payrollAPI = {
  generate: (data) => api.post("/payroll", data),
  getAll: () => api.get("/payroll"),
  getMyPayroll: () => api.get("/payroll/my-payroll"),
  getById: (id) => api.get(`/payroll/${id}`),
};

// Inventory
export const inventoryAPI = {
  addItem: (data) => api.post("/inventory", data),
  getAll: () => api.get("/inventory"),
  update: (id, data) => api.put(`/inventory/${id}`, data),
  issue: (data) => api.post("/inventory/issue", data),
  return: (data) => api.post("/inventory/return", data),
  getAllLogs: () => api.get("/inventory/logs"),
  getMyLogs: () => api.get("/inventory/my-logs"),
};

// Dashboard
export const dashboardAPI = {
  getStats: () => api.get("/dashboard/stats"),
};

export default api;
