const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000/api"
    : "https://frontend-backend-clubdeportivo-production.up.railway.app/api";
    
const ENDPOINTS = {
  auth: {
    login: `${API_URL}/auth/login`,
    register: `${API_URL}/auth/register`,
    me: `${API_URL}/auth/me`,
    updateMe: `${API_URL}/auth/me`,
    changePassword: `${API_URL}/auth/me/password`,
  },

  users: {
    list: `${API_URL}/users`,
    create: `${API_URL}/users`,

    byId(id) {
      return `${API_URL}/users/${id}`;
    },
  },
};
