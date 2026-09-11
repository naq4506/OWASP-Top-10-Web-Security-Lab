// src/pages/apiConfig.js
export const API_BASE =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000'
    : '';