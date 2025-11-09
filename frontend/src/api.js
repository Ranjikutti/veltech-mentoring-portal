import axios from "axios";

// This part is the same as yours
const BASE = (process.env.REACT_APP_API_URL || "").replace(/\/+$/,"");
const api = axios.create({
  baseURL: `${BASE}/api`, // add /api exactly once
});

// --- THIS IS THE MAGIC ---
// This "interceptor" runs before EVERY request
api.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    
    // If the token exists, add it to the Authorization header
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Handle request errors
    return Promise.reject(error);
  }
);
// ----------------------------------------

export default api;