import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { listNotifications, markAllNotificationsRead, markNotificationRead } from "../services/notificationsApi.js";
import { useAuth } from "./AuthContext.jsx";

const NotificationsContext = createContext(null);
const POLL_INTERVAL = 30000;

export function NotificationsProvider({ children }) {
  const { session } = useAuth();
  const token = session?.token;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const unreadCount = useMemo(
    () => items.filter((n) => !n.readAt).length,
    [items]
  );

  const refresh = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const data = await listNotifications(token, { limit: 30 });
      setItems(data || []);
    } catch (err) {
      setError(err.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    if (!token) return;
    await markNotificationRead(token, id);
    setItems((prev) => prev.map((n) => (n._id === id ? { ...n, readAt: new Date().toISOString() } : n)));
  };

  const markAllRead = async () => {
    if (!token) return;
    await markAllNotificationsRead(token);
    setItems((prev) => prev.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() })));
  };

  useEffect(() => {
    if (!token) {
      setItems([]);
      return;
    }
    refresh();
    const timer = setInterval(refresh, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [token]);

  const value = {
    items,
    unreadCount,
    loading,
    error,
    refresh,
    markRead,
    markAllRead
  };

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationsProvider");
  }
  return context;
}
