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

  // Student endpoints
  students: {
    list: `${API_BASE_URL}/students`,
    create: `${API_BASE_URL}/students`,
    update: (id: string) => `${API_BASE_URL}/students/${id}`,
    delete: (id: string) => `${API_BASE_URL}/students/${id}`,
  },

  // Faculty endpoints
  faculty: {
    list: `${API_BASE_URL}/faculty`,
    create: `${API_BASE_URL}/faculty`,
    update: (id: string) => `${API_BASE_URL}/faculty/${id}`,
    delete: (id: string) => `${API_BASE_URL}/faculty/${id}`,
    dashboard: (userId: string) =>
      `${API_BASE_URL}/faculty/dashboard/${userId}`,
    materials: (facultyId: string) =>
      `${API_BASE_URL}/faculty/materials/${facultyId}`,
    papers: (facultyId: string) =>
      `${API_BASE_URL}/faculty/papers/${facultyId}`,
  },

  // Admin endpoints
  admin: {
    dashboard: `${API_BASE_URL}/admin/dashboard`,
    users: `${API_BASE_URL}/admin/users`,
  },

  // File upload endpoint
  upload: `${API_BASE_URL}/upload`,
};
