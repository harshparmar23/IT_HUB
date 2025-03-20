export const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

export const API_ENDPOINTS = {
  // Auth endpoints
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/auth/register`,
    profile: `${API_BASE_URL}/auth/profile`,
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
    profile: (userId: string) => `${API_BASE_URL}/faculty/profile/${userId}`,
    materials: (facultyId: string) =>
      `${API_BASE_URL}/faculty/materials/${facultyId}`,
    papers: (facultyId: string) =>
      `${API_BASE_URL}/faculty/papers/${facultyId}`,
    dashboard: (userId: string) =>
      `${API_BASE_URL}/faculty/dashboard/${userId}`,
  },

  // Student endpoints
  students: {
    profile: (userId: string) => `${API_BASE_URL}/students/profile/${userId}`,
    dashboard: (userId: string) =>
      `${API_BASE_URL}/students/dashboard/${userId}`,
  },

  // Admin endpoints
  admin: {
    dashboard: `${API_BASE_URL}/admin/dashboard`,
    users: `${API_BASE_URL}/admin/users`,
  },

  // File upload endpoint
  upload: `${API_BASE_URL}/upload`,
};
