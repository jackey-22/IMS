import { apiBase } from "./apiBase.js";

const API_BASE = `${apiBase}/api/auth`;

export const passwordHint = "9+ chars with uppercase, lowercase, and special character.";

export const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
export const isValidLoginId = (value) => /^[A-Za-z0-9_-]{6,24}$/.test(value);
export const isValidPassword = (value) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{9,}$/.test(value);

const postJson = async (path, body) => {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => ({}));

  if (response.ok) return payload;

  const authError = new Error(payload.message || "Request failed");
  authError.retryable = false;
  throw authError;
};

export const loginUser = (body) => postJson("/login", body);
export const registerUser = (body) => postJson("/register", body);
export const requestPasswordReset = (body) => postJson("/password-reset/request", body);
export const confirmPasswordReset = (body) => postJson("/password-reset/confirm", body);