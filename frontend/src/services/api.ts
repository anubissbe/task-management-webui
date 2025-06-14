import axios from 'axios';

// Dynamically determine API URL based on current location
const getApiUrl = () => {
  // If VITE_API_URL is set, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Get the hostname from the current page URL
  const currentUrl = window.location.href;
  
  // Extract the hostname from the URL
  const urlMatch = currentUrl.match(/^https?:\/\/([^:/]+)/);
  const hostname = urlMatch ? urlMatch[1] : 'localhost';
  
  const protocol = window.location.protocol;
  
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