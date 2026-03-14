const API_BASE = "/api/warehouses";

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

export const listWarehouses = (token) =>
  fetch(API_BASE, { headers: authHeaders(token) }).then(handleResponse);

export const createWarehouse = (token, body) =>
  fetch(API_BASE, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(body)
  }).then(handleResponse);

export const updateWarehouse = (token, id, body) =>
  fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(body)
  }).then(handleResponse);

export const deleteWarehouse = (token, id) =>
  fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
    headers: authHeaders(token)
  }).then(handleResponse);

export const createLocation = (token, warehouseId, body) =>
  fetch(`${API_BASE}/${warehouseId}/locations`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(body)
  }).then(handleResponse);

export const updateLocation = (token, warehouseId, locationId, body) =>
  fetch(`${API_BASE}/${warehouseId}/locations/${locationId}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(body)
  }).then(handleResponse);

export const deleteLocation = (token, warehouseId, locationId) =>
  fetch(`${API_BASE}/${warehouseId}/locations/${locationId}`, {
    method: "DELETE",
    headers: authHeaders(token)
  }).then(handleResponse);
