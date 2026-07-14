import axios from 'axios';

// Since this is a test/internship project, we will mock the auth token.
// The backend uses JWT. We'll simulate a valid token for 'customer' role.
// Note: In reality, you'd get this from a login response.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// We intercept requests to attach the real JWT token from localStorage.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
