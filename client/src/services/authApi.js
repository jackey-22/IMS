const normalizeBase = (value) => (value ? value.trim().replace(/\/+$/, "") : "");
const createAuthBase = (value) => {
  const cleaned = normalizeBase(value);
  if (!cleaned) return null;
  if (cleaned.endsWith("/api/auth")) return cleaned;
  if (cleaned.endsWith("/api")) return `${cleaned}/auth`;
  return `${cleaned}/api/auth`;
};

const ENV_AUTH_BASE = createAuthBase(import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_URL);
const API_BASES = [
  ENV_AUTH_BASE,
  "/api/auth",
  "http://localhost:4000/api/auth",
  "http://localhost:5051/api/auth"
].filter(Boolean);

export const passwordHint = "9+ chars with uppercase, lowercase, and special character.";

export const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
export const isValidLoginId = (value) => /^[A-Za-z0-9_-]{6,24}$/.test(value);
export const isValidPassword = (value) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{9,}$/.test(value);

const postJson = async (path, body) => {
  let lastError = null;

  for (const apiBase of API_BASES) {
    try {
      const response = await fetch(`${apiBase}${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      const payload = await response.json().catch(() => ({}));

      if (response.ok) {
        return payload;
      }

      const message = payload.message || "Request failed";

      // If the target is unavailable or wrong, try the next local fallback.
      if (response.status >= 500 || response.status === 404) {
        lastError = new Error(message);
        continue;
      }

      const authError = new Error(message);
      authError.retryable = false;
      throw authError;
    } catch (error) {
      if (error?.retryable === false) {
        throw error;
      }
      lastError = error;
      continue;
    }
  }

  throw new Error(lastError?.message || "Unable to reach authentication server");
};

export const loginUser = (body) => postJson("/login", body);
export const registerUser = (body) => postJson("/register", body);
export const requestPasswordReset = (body) => postJson("/password-reset/request", body);
export const confirmPasswordReset = (body) => postJson("/password-reset/confirm", body);