import { useEffect, useMemo, useState } from "react";
import {
  Users, UserCheck, UserX, ShieldCheck, Package, Warehouse,
  Calendar, MoreVertical, RefreshCw, Activity
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { fetchDashboardStats } from "../../services/dashboardApi.js";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f97316", "#8b5cf6", "#ef4444"];

const roleLabel = (role) => {
  if (role === "admin") return "Admin";
  if (role === "inventory_manager") return "Inv. Manager";
  if (role === "warehouse_staff") return "Warehouse Staff";
  return role;
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#ffffff", border: "1px solid rgba(24,52,87,0.1)",
      borderRadius: 12, padding: "12px 16px", boxShadow: "0 14px 36px rgba(17,40,70,0.08)",
      fontFamily: "Manrope, sans-serif", fontSize: 13
    }}>
      <p style={{ margin: 0, fontWeight: 700, color: "#15304f" }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ margin: "4px 0 0", color: p.color || p.fill }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const { session } = useAuth();
  const token = session?.token;
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStats = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const data = await fetchDashboardStats(token);
      setStats(data);
    } catch (err) {
      setError(err.message || "Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStats(); }, [token]);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric"
  });

  // KPI data
  const kpis = stats ? [
    { label: "Total Users", value: String(stats.users?.total || 0), sub: "Managed accounts", icon: Users, color: "#3b82f6", bg: "#eff6ff" },
    { label: "Active Accounts", value: String(stats.users?.active || 0), sub: "Enabled users", icon: UserCheck, color: "#10b981", bg: "#ecfdf5" },
    { label: "Total Products", value: String(stats.products.total), sub: `${stats.products.active} active`, icon: Package, color: "#8b5cf6", bg: "#f5f3ff" },
    { label: "Warehouses", value: String(stats.warehouses.total), sub: `${stats.warehouses.totalLocations} locations`, icon: Warehouse, color: "#f97316", bg: "#fff7ed" },
  ] : [];

  // Charts
  const usersByRole = stats?.users?.byRole
    ? Object.entries(stats.users.byRole).map(([key, value]) => ({
      name: roleLabel(key), value
    }))
    : [];

  const opsByType = stats
    ? Object.entries(stats.operations.byType)
      .filter(([, v]) => v > 0)
      .map(([key, value]) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1), value
      }))
    : [];

  // Quick actions
  const quickActions = [
    { label: "Manage Users", to: "/admin/users", sub: "Add, edit, or disable accounts" },
    { label: "Warehouse Settings", to: "/admin/settings/warehouse", sub: "Configure warehouse locations" },
    { label: "Inventory Dashboard", to: "/inventory/dashboard", sub: "View inventory insights" },
  ];

  const getStatusStyle = (status) => {
    switch (status) {
      case "active": return { background: "#d1fae5", color: "#065f46" };
      case "disabled": return { background: "#fee2e2", color: "#991b1b" };
      default: return { background: "#f3f4f6", color: "#374151" };
    }
  };

  const styles = {
    titleSection: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: 12 },
    h1: { fontSize: "24px", fontWeight: "700", color: "#15304f", margin: 0, fontFamily: "Sora, sans-serif", letterSpacing: "-0.03em" },
    p: { color: "#527196", margin: "4px 0 0 0", fontSize: "14px" },
    btnRow: { display: "flex", gap: "10px", alignItems: "center" },
    btnSecondary: {
      background: "white", color: "#15304f", border: "1px solid rgba(24,52,87,0.1)",
      padding: "8px 16px", borderRadius: "12px", fontWeight: "600", fontSize: "14px",
      display: "flex", alignItems: "center", gap: "8px", cursor: "pointer"
    },
    btnPrimary: {
      background: "linear-gradient(135deg, #3b82f6, #2563eb)", color: "white",
      border: "none", padding: "8px 20px", borderRadius: "12px",
      fontWeight: "700", fontSize: "14px", textDecoration: "none",
      boxShadow: "0 4px 14px rgba(37,99,235,0.25)"
    },
    kpiGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "28px" },
    kpiCard: {
      background: "#ffffff", padding: "20px", borderRadius: "16px",
      boxShadow: "0 14px 36px rgba(17,40,70,0.08)", border: "1px solid rgba(24,52,87,0.08)",
      display: "flex", alignItems: "center", gap: "14px", transition: "transform 140ms ease, box-shadow 140ms ease"
    },
    kpiIcon: (bg, color) => ({
      width: "48px", height: "48px", borderRadius: "14px",
      backgroundColor: bg, color, display: "flex", alignItems: "center", justifyContent: "center"
    }),
    kpiLabel: { fontSize: "12px", color: "#527196", margin: "0 0 4px 0", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" },
    kpiValue: { fontSize: "26px", fontWeight: "700", color: "#15304f", margin: 0, fontFamily: "Sora, sans-serif" },
    kpiSub: { fontSize: "12px", color: "#527196", margin: "2px 0 0" },
    chartCard: {
      background: "#ffffff", borderRadius: "16px", border: "1px solid rgba(24,52,87,0.08)",
      boxShadow: "0 14px 36px rgba(17,40,70,0.08)", padding: "20px", overflow: "hidden"
    },
    chartTitle: { fontSize: "16px", fontWeight: "600", margin: 0, fontFamily: "Sora, sans-serif", color: "#15304f" },
    actionGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginBottom: "24px" },
    actionCard: {
      background: "#ffffff", borderRadius: "16px", border: "1px solid rgba(24,52,87,0.08)",
      padding: "18px", textDecoration: "none", color: "#15304f",
      display: "flex", flexDirection: "column", gap: "4px",
      boxShadow: "0 14px 36px rgba(17,40,70,0.08)", transition: "transform 140ms ease"
    },
    alertCard: {
      background: "#ffffff", borderRadius: "16px", border: "1px solid rgba(24,52,87,0.08)",
      padding: "18px", marginBottom: "24px", boxShadow: "0 14px 36px rgba(17,40,70,0.08)"
    },
    alertTitle: { fontSize: "16px", fontWeight: "600", margin: "0 0 12px", fontFamily: "Sora, sans-serif" },
    alertRow: {
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "10px 0", borderBottom: "1px solid rgba(24,52,87,0.06)",
      fontSize: "14px", color: "#15304f"
    },
    alertValue: { fontWeight: "700", color: "#15304f", fontSize: "18px" },
    card: {
      background: "#ffffff", borderRadius: "16px", border: "1px solid rgba(24,52,87,0.08)",
      boxShadow: "0 14px 36px rgba(17,40,70,0.08)", overflow: "hidden"
    },
    cardHeader: {
      padding: "18px 22px", borderBottom: "1px solid rgba(24,52,87,0.08)",
      display: "flex", alignItems: "center", justifyContent: "space-between"
    },
    cardTitle: { fontSize: "16px", fontWeight: "600", margin: 0, fontFamily: "Sora, sans-serif" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: {
      textAlign: "left", padding: "12px 22px", background: "#f8fafc",
      color: "#527196", fontWeight: "600", fontSize: "12px",
      textTransform: "uppercase", letterSpacing: "0.05em"
    },
    td: {
      padding: "14px 22px", borderBottom: "1px solid rgba(24,52,87,0.06)",
      fontSize: "14px", color: "#15304f"
    },
    statusBadge: (statusStyle) => ({
      padding: "4px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: "600",
      ...statusStyle
    }),
    loadingCard: {
      background: "#ffffff", borderRadius: "16px", border: "1px solid rgba(24,52,87,0.08)",
      boxShadow: "0 14px 36px rgba(17,40,70,0.08)", padding: "20px", minHeight: 100
    }
  };

  if (loading) {
    return (
      <div>
        <div style={styles.titleSection}>
          <div>
            <h1 style={styles.h1}>Welcome back, Admin</h1>
            <p style={styles.p}>Loading dashboard data...</p>
          </div>
        </div>
        <div style={styles.kpiGrid}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ ...styles.loadingCard, opacity: 0.6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: "#edf4fb" }} />
                <div>
                  <div style={{ height: 10, width: 80, background: "#edf4fb", borderRadius: 6, marginBottom: 8 }} />
                  <div style={{ height: 22, width: 50, background: "#edf4fb", borderRadius: 6 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div style={styles.titleSection}>
          <div>
            <h1 style={styles.h1}>Admin Dashboard</h1>
          </div>
        </div>
        <div style={{
          padding: "14px 18px", borderRadius: "14px", border: "1px solid #f2b5c0",
          background: "#fff0f2", color: "#a94258", fontSize: "14px", fontWeight: 600
        }}>
          {error}
        </div>
      </div>
    );
  }

  const systemAlerts = [
    { id: "disabled", label: "Disabled accounts pending review", value: stats.users?.disabled || 0, warn: (stats.users?.disabled || 0) > 0 },
    { id: "lowstock", label: "Products with low stock", value: stats.products.lowStock, warn: stats.products.lowStock > 0 },
    { id: "pending", label: "Pending operations", value: stats.operations.pendingReceipts + stats.operations.pendingDeliveries, warn: false },
    { id: "categories", label: "Product categories", value: stats.categories.total, warn: false },
  ];

  return (
    <div>
      {/* Header */}
      <div style={styles.titleSection}>
        <div>
          <h1 style={styles.h1}>Welcome back, Admin</h1>
          <p style={styles.p}>Here's what's happening across the system today.</p>
        </div>
        <div style={styles.btnRow}>
          <button style={styles.btnSecondary} onClick={loadStats}>
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
          <button style={styles.btnSecondary}>
            <Calendar size={16} />
            <span>{today}</span>
          </button>
          <Link style={styles.btnPrimary} to="/admin/users">Manage Users</Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={styles.actionGrid}>
        {quickActions.map((action) => (
          <Link key={action.label} to={action.to} style={styles.actionCard}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "none"}>
            <span style={{ fontSize: "14px", fontWeight: "700" }}>{action.label}</span>
            <span style={{ fontSize: "12px", color: "#527196" }}>{action.sub}</span>
          </Link>
        ))}
      </div>

      {/* KPI Grid */}
      <div style={styles.kpiGrid}>
        {kpis.map((kpi) => (
          <div key={kpi.label} style={styles.kpiCard}>
            <div style={styles.kpiIcon(kpi.bg, kpi.color)}>
              <kpi.icon size={22} />
            </div>
            <div>
              <h3 style={styles.kpiLabel}>{kpi.label}</h3>
              <p style={styles.kpiValue}>{kpi.value}</p>
              <div style={styles.kpiSub}>{kpi.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
        {/* Users by Role */}
        <div style={styles.chartCard}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 style={styles.chartTitle}>Users by Role</h3>
            <Users size={18} style={{ color: "#527196" }} />
          </div>
          {usersByRole.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={usersByRole} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3} dataKey="value">
                  {usersByRole.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" iconType="circle" iconSize={8}
                  formatter={(v) => <span style={{ color: "#527196", fontSize: 12 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 260, display: "flex", alignItems: "center", justifyContent: "center", color: "#527196", fontSize: 14 }}>
              No user data available
            </div>
          )}
        </div>

        {/* Operations by Type */}
        <div style={styles.chartCard}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 style={styles.chartTitle}>Operations by Type</h3>
            <Activity size={18} style={{ color: "#527196" }} />
          </div>
          {opsByType.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={opsByType} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(24,52,87,0.06)" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#527196" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#527196" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Count" radius={[8, 8, 0, 0]}>
                  {opsByType.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 260, display: "flex", alignItems: "center", justifyContent: "center", color: "#527196", fontSize: 14 }}>
              No operations data yet
            </div>
          )}
        </div>
      </div>

      {/* System Overview */}
      <div style={styles.alertCard}>
        <h3 style={styles.alertTitle}>System Overview</h3>
        {systemAlerts.map((alert, i) => (
          <div key={alert.id} style={{
            ...styles.alertRow,
            borderBottom: i === systemAlerts.length - 1 ? "none" : styles.alertRow.borderBottom
          }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {alert.warn && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b", display: "inline-block" }} />}
              {alert.label}
            </span>
            <span style={styles.alertValue}>{alert.value}</span>
          </div>
        ))}
      </div>

      {/* Recent User Activity Table */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>{loading ? "Loading..." : "Recent User Accounts"}</h2>
          <MoreVertical size={18} style={{ color: "#527196", cursor: "pointer" }} />
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Login ID</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Created</th>
              </tr>
            </thead>
            <tbody>
              {(!stats.users?.recent || stats.users.recent.length === 0) ? (
                <tr>
                  <td style={styles.td} colSpan={5}>No users found.</td>
                </tr>
              ) : (
                stats.users.recent.map((u) => (
                  <tr key={u._id}>
                    <td style={{ ...styles.td, fontWeight: "600" }}>{u.name}</td>
                    <td style={{ ...styles.td, fontFamily: "Consolas, Monaco, monospace", fontSize: "13px" }}>{u.loginId}</td>
                    <td style={styles.td}>{roleLabel(u.role)}</td>
                    <td style={styles.td}>
                      <span style={styles.statusBadge(getStatusStyle(u.isActive ? "active" : "disabled"))}>
                        {u.isActive ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td style={{ ...styles.td, color: "#527196" }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
