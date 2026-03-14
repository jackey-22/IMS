const API_BASE = "/api/operations";

const authHeaders = (token) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

const handleResponse = async (res) => {
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(payload.message || "Request failed");
  }
  return payload;
};

export const listStock = (token) =>
  fetch(`${API_BASE}/stock`, { headers: authHeaders(token) }).then(handleResponse);

export const listReceipts = (token) =>
  fetch(`${API_BASE}/receipts`, { headers: authHeaders(token) }).then(handleResponse);

export const createReceiptApi = (token, body) =>
  fetch(`${API_BASE}/receipts`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(body),
  }).then(handleResponse);

export const listDeliveries = (token) =>
  fetch(`${API_BASE}/deliveries`, { headers: authHeaders(token) }).then(handleResponse);

export const createDeliveryApi = (token, body) =>
  fetch(`${API_BASE}/deliveries`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(body),
  }).then(handleResponse);

export const listTransfers = (token) =>
  fetch(`${API_BASE}/transfers`, { headers: authHeaders(token) }).then(handleResponse);

export const createTransferApi = (token, body) =>
  fetch(`${API_BASE}/transfers`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(body),
  }).then(handleResponse);
