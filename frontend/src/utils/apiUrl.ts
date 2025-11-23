// Centralized API URL configuration
// Uses VITE_API_URL in production, relative path in development

export const getApiUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    // Ensure it ends with /api
    return envUrl.endsWith('/api') ? envUrl : `${envUrl.replace(/\/$/, '')}/api`;
  }
  // Fallback for production if VITE_API_URL not set
  return import.meta.env.PROD
    ? 'https://isbjorn-backend-production.up.railway.app/api'
    : '/api';
};

export const API_URL = getApiUrl();
