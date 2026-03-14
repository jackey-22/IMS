import { createContext, useContext, useEffect, useState } from "react";

const SESSION_KEY = "ims-auth-session";
const AuthContext = createContext(null);

const readSession = () => {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readSession());

  useEffect(() => {
    if (!session) {
      window.localStorage.removeItem(SESSION_KEY);
      return;
    }

    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }, [session]);

  const logout = () => setSession(null);

  return <AuthContext.Provider value={{ session, setSession, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}