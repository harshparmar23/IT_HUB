export const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

export const API_ENDPOINTS = {
  // Auth endpoints
  auth: {
    login: "/auth/google-signin",
    logout: "/auth/logout",
  },

  // Course endpoints
  courses: {
    list: `${API_BASE_URL}/courses`,
    create: `${API_BASE_URL}/courses`,
    update: (id: string) => `${API_BASE_URL}/courses/${id}`,
    delete: (id: string) => `${API_BASE_URL}/courses/${id}`,
  },

  // Faculty endpoints
  faculty: {
    dashboard: (userId: string) => `/faculty/dashboard/${userId}`,
    profile: (userId: string) => `/faculty/profile/${userId}`,
    materials: (userId: string) => `/faculty/materials/${userId}`,
    papers: (userId: string) => `/faculty/papers/${userId}`,
  },

  // Student endpoints
  student: {
    dashboard: (userId: string) => `/student/dashboard/${userId}`,
    profile: (userId: string) => `/student/profile/${userId}`,
    materials: (userId: string) => `/student/materials/${userId}`,
    papers: (userId: string) => `/student/papers/${userId}`,
  },

  // Admin endpoints
  admin: {
    dashboard: "/admin/dashboard",
    students: "/admin/students",
    faculty: "/admin/faculty",
    materials: "/admin/materials",
    papers: "/admin/papers",
    courses: "/admin/courses",
  },

  // File upload endpoint
  upload: `${API_BASE_URL}/upload`,
};
