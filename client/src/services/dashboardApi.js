import { apiBase } from "./apiBase.js";
const API_BASE = `${apiBase}/api/dashboard`;

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

export const fetchDashboardStats = (token) =>
    fetch(`${API_BASE}/stats`, { headers: authHeaders(token) }).then(handleResponse);
