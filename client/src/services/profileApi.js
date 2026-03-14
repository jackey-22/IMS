import { apiBase } from "./apiBase.js";
const API_BASE = `${apiBase}/api/profile`;

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

export const getMyProfile = (token) =>
  fetch(`${API_BASE}/me`, {
    headers: authHeaders(token)
  }).then(handleResponse);

export const updateMyProfile = (token, body) =>
  fetch(`${API_BASE}/me`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(body)
  }).then(handleResponse);

export const changeMyPassword = (token, body) =>
  fetch(`${API_BASE}/me/password`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(body)
  }).then(handleResponse);
