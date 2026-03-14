const API_BASE = "/api/users";

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

export const listUsers = (token) =>
  fetch(API_BASE, { headers: authHeaders(token) }).then(handleResponse);

export const createUser = (token, body) =>
  fetch(API_BASE, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(body)
  }).then(handleResponse);

export const updateUserRole = (token, id, role) =>
  fetch(`${API_BASE}/${id}/role`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ role })
  }).then(handleResponse);

export const updateUserStatus = (token, id, isActive) =>
  fetch(`${API_BASE}/${id}/status`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ isActive })
  }).then(handleResponse);

export const resetUserPassword = (token, id, newPassword) =>
  fetch(`${API_BASE}/${id}/password`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ newPassword })
  }).then(handleResponse);

export const deleteUser = (token, id) =>
  fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
    headers: authHeaders(token)
  }).then(handleResponse);
