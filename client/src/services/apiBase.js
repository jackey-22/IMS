/**
 * apiBase — resolves the backend origin for all API service files.
 *
 * - In LOCAL DEV: Vite proxies /api/* to the backend automatically,
 *   so we can use an empty string (requests stay relative).
 *
 * - In PRODUCTION (no Vite proxy): set VITE_BACKEND_URL in your
 *   hosting environment (e.g. https://api.myapp.com) so every fetch
 *   call uses a fully-qualified URL.
 *
 * Usage:  `${apiBase}/api/products`
 */
const raw = (import.meta.env.VITE_BACKEND_URL || "").trim().replace(/\/+$/, "");

// If the value is just a port number (legacy), build a localhost URL.
export const apiBase = raw && !raw.startsWith("http")
  ? `http://localhost:${raw}`
  : raw;
