import { apiBase } from "./apiBase.js";
const API_BASE = `${apiBase}/api/products`;

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

export const listProducts = (token, params = {}) => {
  const searchParams = new URLSearchParams();
  if (params.q) searchParams.set("q", params.q);
  if (params.categoryId) searchParams.set("categoryId", params.categoryId);
  if (params.isActive !== undefined) searchParams.set("isActive", String(params.isActive));

  const query = searchParams.toString();
  const url = query ? `${API_BASE}?${query}` : API_BASE;

  return fetch(url, { headers: authHeaders(token) }).then(handleResponse);
};

export const createProduct = (token, body) =>
  fetch(API_BASE, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(body)
  }).then(handleResponse);

export const updateProduct = (token, id, body) =>
  fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(body)
  }).then(handleResponse);

export const deleteProduct = (token, id) =>
  fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
    headers: authHeaders(token)
  }).then(handleResponse);
