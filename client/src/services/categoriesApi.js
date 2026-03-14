const API_BASE = "/api/categories";

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

export const listCategories = (token) =>
  fetch(API_BASE, { headers: authHeaders(token) }).then(handleResponse);

export const createCategory = (token, body) =>
  fetch(API_BASE, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(body)
  }).then(handleResponse);

export const updateCategory = (token, id, body) =>
  fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(body)
  }).then(handleResponse);

export const deleteCategory = (token, id) =>
  fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
    headers: authHeaders(token)
  }).then(handleResponse);
