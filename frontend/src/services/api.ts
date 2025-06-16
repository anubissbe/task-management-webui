import axios from 'axios';

// Dynamically determine API URL based on current location
const getApiUrl = () => {
  // Check for runtime override first
  if ((window as { __PROJECTHUB_API_OVERRIDE__?: string }).__PROJECTHUB_API_OVERRIDE__) {
    return (window as { __PROJECTHUB_API_OVERRIDE__?: string }).__PROJECTHUB_API_OVERRIDE__;
  }
  
  // If VITE_API_URL is set, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // For development, always use localhost
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3001/api';
  }
  
  // For production, use the same hostname as the frontend
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  
  return `${protocol}//${hostname}:3001/api`;
};

const API_BASE_URL = getApiUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Dynamically update base URL on each request
    const dynamicUrl = getApiUrl();
    if (config.baseURL !== dynamicUrl) {
      config.baseURL = dynamicUrl;
    }
    // Add auth token here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Suppress all API errors during development - they're handled by React Query
    return Promise.reject(error);
  }
);