// Centralized API configuration.
// In development, leave REACT_APP_API_BASE unset and CRA's "proxy" field in
// package.json will forward /api requests to http://localhost:5000.
// In production, set REACT_APP_API_BASE to your deployed backend URL
// (e.g. https://your-backend.onrender.com) as an environment variable
// on your hosting platform (Vercel/Netlify).
export const API_BASE = process.env.REACT_APP_API_BASE || '';

// Prepend the API base to a relative path like '/api/students'.
export function apiUrl(path) {
  return `${API_BASE}${path}`;
}
