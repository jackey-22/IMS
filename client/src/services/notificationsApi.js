const normalizeBase = (value) => (value ? value.trim().replace(/\/+$/, "") : "");
const createNotificationsBase = (value) => {
  const cleaned = normalizeBase(value);
  if (!cleaned) return null;
  if (cleaned.endsWith("/api/notifications")) return cleaned;
  if (cleaned.endsWith("/api")) return `${cleaned}/notifications`;
  return `${cleaned}/api/notifications`;
};

const ENV_NOTIFICATIONS_BASE = createNotificationsBase(
  import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_URL
);
const API_BASE = ENV_NOTIFICATIONS_BASE || "/api/notifications";

const authHeaders = (token) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`
});

const handleResponse = async (res) => {
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(payload.message || "Request failed");
  }
  return payload;
};

export const listNotifications = (token, { unreadOnly = false, limit = 50 } = {}) => {
  const params = new URLSearchParams();
  if (unreadOnly) params.set("unreadOnly", "true");
  if (limit) params.set("limit", String(limit));

  return fetch(`${API_BASE}?${params.toString()}`, {
    headers: authHeaders(token)
  }).then(handleResponse);
};

export const markNotificationRead = (token, id) =>
  fetch(`${API_BASE}/${id}/read`, {
    method: "PATCH",
    headers: authHeaders(token)
  }).then(handleResponse);

export const markAllNotificationsRead = (token) =>
  fetch(`${API_BASE}/read-all`, {
    method: "PATCH",
    headers: authHeaders(token)
  }).then(handleResponse);
