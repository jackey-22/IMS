import { useEffect, useMemo, useState } from "react";
import { Users, UserCheck, UserX, ShieldCheck, Calendar, MoreVertical } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { listUsers } from "../../services/usersApi.js";

const roleLabel = (role) => {
  if (role === "admin") return "Admin";
  if (role === "inventory_manager") return "Inventory Manager";
  if (role === "warehouse_staff") return "Warehouse Staff";
  return role;
};

export default function AdminDashboard() {
  const { session } = useAuth();
  const token = session?.token;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await listUsers(token);
        setUsers(data);
      } catch (err) {
        setError(err.message || "Failed to load dashboard stats");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const stats = useMemo(() => {
    const total = users.length + 1;
    const active = users.filter((u) => u.isActive).length + (session?.user?.isActive ? 1 : 0);
    const disabled = total - active;
    const adminCount = users.filter((u) => u.role === "admin").length + (session?.user?.role === "admin" ? 1 : 0);

    return { total, active, disabled, adminCount };
  }, [session?.user?.isActive, session?.user?.role, users]);

  const kpis = [
    { label: "Total Users", value: String(stats.total), sub: "Managed accounts", icon: Users, color: "#3b82f6", bg: "#eff6ff" },
    { label: "Active Accounts", value: String(stats.active), sub: "Enabled users", icon: UserCheck, color: "#10b981", bg: "#ecfdf5" },
    { label: "Disabled Accounts", value: String(stats.disabled), sub: "Suspended users", icon: UserX, color: "#ef4444", bg: "#fef2f2" },
    { label: "Admin Users", value: String(stats.adminCount), sub: "Privileged roles", icon: ShieldCheck, color: "#8b5cf6", bg: "#f5f3ff" }
  ];

  const adminAlerts = [
    { id: "disabled", label: "Disabled accounts pending review", value: stats.disabled },
    { id: "admins", label: "Admins with full access", value: stats.adminCount }
  ];

  const quickActions = [
    { label: "Manage Users", to: "/admin/users" },
    { label: "Warehouse Settings", to: "/admin/settings/warehouse" },
    { label: "Inventory Dashboard", to: "/inventory/dashboard" }
  ];

  const recentAdminActions = users
    .slice(0, 6)
    .map((u) => ({
      action: "User Account",
      user: u.name,
      details: `${roleLabel(u.role)} · ${u.isActive ? "Active" : "Disabled"}`,
      date: u.createdAt ? new Date(u.createdAt).toISOString().slice(0, 10) : "-",
      status: u.isActive ? "Done" : "Waiting"
    }));

  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case "waiting":
        return { background: "#e0f2fe", color: "#075985" };
      case "done":
        return { background: "#d1fae5", color: "#065f46" };
      default:
        return { background: "#fef3c7", color: "#92400e" };
    }
  };

  const styles = {
    titleSection: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "24px"
    },
    h1: { fontSize: "24px", fontWeight: "700", color: "#111827", margin: 0 },
    p: { color: "#6b7280", margin: "4px 0 0 0", fontSize: "14px" },
    btnRow: { display: "flex", gap: "10px", alignItems: "center" },
    btnSecondary: {
      background: "white",
      color: "#111827",
      border: "1px solid #e5e7eb",
      padding: "8px 16px",
      borderRadius: "8px",
      fontWeight: "600",
      fontSize: "14px",
      display: "flex",
      alignItems: "center",
      gap: "8px"
    },
    btnPrimary: {
      background: "#111827",
      color: "white",
      border: "1px solid #111827",
      padding: "8px 16px",
      borderRadius: "8px",
      fontWeight: "600",
      fontSize: "14px",
      textDecoration: "none"
    },
    actionGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "14px",
      marginBottom: "24px"
    },
    actionCard: {
      background: "#ffffff",
      borderRadius: "12px",
      border: "1px solid #e5e7eb",
      padding: "16px",
      textDecoration: "none",
      color: "#111827",
      display: "flex",
      flexDirection: "column",
      gap: "6px",
      boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
    },
    actionLabel: { fontSize: "14px", fontWeight: "600" },
    actionSub: { fontSize: "12px", color: "#6b7280" },
    alertCard: {
      background: "#ffffff",
      borderRadius: "12px",
      border: "1px solid #e5e7eb",
      padding: "16px",
      display: "grid",
      gap: "10px",
      marginBottom: "24px",
      boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
    },
    alertRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      fontSize: "14px",
      color: "#111827"
    },
    alertValue: { fontWeight: "700", color: "#111827" },
    kpiGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: "20px",
      marginBottom: "30px"
    },
    kpiCard: {
      background: "#ffffff",
      padding: "22px",
      borderRadius: "12px",
      boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      border: "1px solid #e5e7eb",
      display: "flex",
      alignItems: "center",
      gap: "14px"
    },
    kpiIcon: (bg, color) => ({
      width: "46px",
      height: "46px",
      borderRadius: "12px",
      backgroundColor: bg,
      color,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }),
    kpiLabel: { fontSize: "14px", color: "#6b7280", margin: "0 0 4px 0" },
    kpiValue: { fontSize: "24px", fontWeight: "700", color: "#111827", margin: 0 },
    card: {
      background: "#ffffff",
      borderRadius: "12px",
      border: "1px solid #e5e7eb",
      boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      overflow: "hidden"
    },
    cardHeader: {
      padding: "20px 24px",
      borderBottom: "1px solid #e5e7eb",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    },
    cardTitle: { fontSize: "18px", fontWeight: "600", margin: 0 },
    table: { width: "100%", borderCollapse: "collapse" },
    th: {
      textAlign: "left",
      padding: "16px 24px",
      background: "#f9fafb",
      color: "#6b7280",
      fontWeight: "600",
      fontSize: "13px",
      textTransform: "uppercase",
      letterSpacing: "0.05em"
    },
    td: {
      padding: "16px 24px",
      borderBottom: "1px solid #e5e7eb",
      fontSize: "14px",
      color: "#111827"
    },
    statusBadge: (statusStyle) => ({
      padding: "4px 10px",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: "600",
      ...statusStyle
    })
  };

  return (
    <div>
      <div style={styles.titleSection}>
        <div>
          <h1 style={styles.h1}>Welcome back, Admin</h1>
          <p style={styles.p}>Here is what is happening in user administration today.</p>
        </div>
        <div style={styles.btnRow}>
          <button style={styles.btnSecondary}>
            <Calendar size={18} />
            <span>March 14, 2026</span>
          </button>
          <Link style={styles.btnPrimary} to="/admin/users">Manage Users</Link>
        </div>
      </div>

      <div style={styles.actionGrid}>
        {quickActions.map((action) => (
          <Link key={action.label} to={action.to} style={styles.actionCard}>
            <span style={styles.actionLabel}>{action.label}</span>
            <span style={styles.actionSub}>Open {action.label.toLowerCase()}</span>
          </Link>
        ))}
      </div>

      <div style={styles.kpiGrid}>
        {kpis.map((kpi) => (
          <div key={kpi.label} style={styles.kpiCard}>
            <div style={styles.kpiIcon(kpi.bg, kpi.color)}>
              <kpi.icon size={22} />
            </div>
            <div>
              <h3 style={styles.kpiLabel}>{kpi.label}</h3>
              <p style={styles.kpiValue}>{kpi.value}</p>
              <div style={styles.p}>{kpi.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.alertCard}>
        {adminAlerts.map((alert) => (
          <div key={alert.id} style={styles.alertRow}>
            <span>{alert.label}</span>
            <span style={styles.alertValue}>{alert.value}</span>
          </div>
        ))}
      </div>

      {error && (
        <div style={{ marginBottom: "14px", padding: "10px 14px", borderRadius: "10px", border: "1px solid #fecaca", background: "#fef2f2", color: "#b91c1c", fontSize: "14px", fontWeight: 600 }}>
          {error}
        </div>
      )}

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>{loading ? "Loading Recent Activity..." : "Recent Admin Activity"}</h2>
          <MoreVertical size={18} style={{ color: "#6b7280", cursor: "pointer" }} />
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Action</th>
                <th style={styles.th}>User</th>
                <th style={styles.th}>Details</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Date</th>
              </tr>
            </thead>
            <tbody>
              {!loading && recentAdminActions.length === 0 && (
                <tr>
                  <td style={styles.td} colSpan={5}>No activity found yet.</td>
                </tr>
              )}
              {recentAdminActions.map((row) => (
                <tr key={`${row.action}-${row.user}-${row.date}`}>
                  <td style={{ ...styles.td, fontWeight: "600" }}>{row.action}</td>
                  <td style={styles.td}>{row.user}</td>
                  <td style={{ ...styles.td, color: "#4b5563" }}>{row.details}</td>
                  <td style={styles.td}>
                    <span style={styles.statusBadge(getStatusStyle(row.status))}>{row.status}</span>
                  </td>
                  <td style={{ ...styles.td, color: "#6b7280" }}>{row.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
