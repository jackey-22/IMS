import { useEffect, useState } from "react";
import {
  ArrowDownCircle, ArrowUpCircle, ArrowLeftRight, Calendar,
  MoreVertical, PlusCircle, ClipboardCheck, CheckCircle2, RefreshCw, Activity
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { fetchDashboardStats } from "../../services/dashboardApi.js";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

const COLORS = ["#3b82f6", "#f97316", "#10b981", "#8b5cf6", "#ef4444"];

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

export default function WarehouseDashboard() {
  const { session } = useAuth();
  const token = session?.token;
  const displayName = session?.user?.name || "Warehouse Team";
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
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStats(); }, [token]);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric"
  });

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "waiting": return { background: "#e0f2fe", color: "#075985" };
      case "done": return { background: "#d1fae5", color: "#065f46" };
      case "ready": return { background: "#fef3c7", color: "#92400e" };
      case "scheduled": return { background: "#ede9fe", color: "#5b21b6" };
      case "draft": return { background: "#f3f4f6", color: "#374151" };
      case "canceled": return { background: "#fee2e2", color: "#991b1b" };
      default: return { background: "#f3f4f6", color: "#374151" };
    }
  };

  // KPIs
  const kpis = stats ? [
    { label: "Pending Receipts", value: String(stats.operations.pendingReceipts), sub: "Awaiting processing", icon: ArrowDownCircle, color: "#3b82f6", bg: "#eff6ff" },
    { label: "Pending Deliveries", value: String(stats.operations.pendingDeliveries), sub: "Ready to ship", icon: ArrowUpCircle, color: "#10b981", bg: "#ecfdf5" },
    { label: "Transfers", value: String(stats.operations.scheduledTransfers), sub: "Scheduled transfers", icon: ArrowLeftRight, color: "#8b5cf6", bg: "#f5f3ff" },
    { label: "Completed Today", value: String(stats.operations.completedToday), sub: "Validated operations", icon: CheckCircle2, color: "#10b981", bg: "#ecfdf5" },
  ] : [];

  // Chart data
  const workloadByType = stats ? [
    { name: "Receipts", pending: stats.operations.pendingReceipts, total: stats.operations.byType.receipt || 0 },
    { name: "Deliveries", pending: stats.operations.pendingDeliveries, total: stats.operations.byType.delivery || 0 },
    { name: "Transfers", pending: stats.operations.scheduledTransfers, total: stats.operations.byType.transfer || 0 },
  ] : [];

  const opsByStatus = stats
    ? Object.entries(stats.operations.byStatus)
      .filter(([, v]) => v > 0)
      .map(([key, value]) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1), value
      }))
    : [];

  const quickActions = [
    { label: "New Receipt", to: "/warehouse/receipts", icon: ArrowDownCircle },
    { label: "New Delivery", to: "/warehouse/deliveries", icon: ArrowUpCircle },
    { label: "Plan Transfer", to: "/warehouse/transfers", icon: ArrowLeftRight },
    { label: "Stock Count", to: "/warehouse/stock-count", icon: ClipboardCheck },
  ];

  const styles = {
    titleSection: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: 12 },
    h1: { fontSize: "24px", fontWeight: "700", color: "#15304f", margin: 0, fontFamily: "Sora, sans-serif", letterSpacing: "-0.03em" },
    p: { color: "#527196", margin: "4px 0 0 0", fontSize: "14px" },
    btnRow: { display: "flex", gap: "10px", alignItems: "center" },
    btnSecondary: {
      background: "white", color: "#15304f", border: "1px solid rgba(24,52,87,0.1)",
      padding: "8px 16px", borderRadius: "12px", fontWeight: "600", fontSize: "14px",
      cursor: "pointer", display: "flex", alignItems: "center", gap: "8px"
    },
    kpiGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "28px" },
    kpiCard: {
      background: "#ffffff", padding: "20px", borderRadius: "16px",
      boxShadow: "0 14px 36px rgba(17,40,70,0.08)", border: "1px solid rgba(24,52,87,0.08)",
      display: "flex", alignItems: "center", gap: "14px"
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
      boxShadow: "0 14px 36px rgba(17,40,70,0.08)", padding: "20px"
    },
    chartTitle: { fontSize: "16px", fontWeight: "600", margin: 0, fontFamily: "Sora, sans-serif", color: "#15304f" },
    quickGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px", marginBottom: "24px" },
    quickCard: {
      background: "#ffffff", border: "1px solid rgba(24,52,87,0.08)", borderRadius: "16px",
      padding: "16px", display: "flex", alignItems: "center", gap: "12px",
      textDecoration: "none", color: "#15304f",
      boxShadow: "0 14px 36px rgba(17,40,70,0.08)", transition: "transform 140ms ease"
    },
    quickIcon: {
      width: "40px", height: "40px", borderRadius: "12px",
      background: "#eff6ff", color: "#2563eb",
      display: "flex", alignItems: "center", justifyContent: "center"
    },
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
      textTransform: "capitalize", ...statusStyle
    }),
    actionBtn: {
      background: "white", color: "#15304f", border: "1px solid rgba(24,52,87,0.1)",
      padding: "5px 14px", borderRadius: "10px", fontSize: "12px",
      fontWeight: "600", cursor: "pointer"
    },
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
            <h1 style={styles.h1}>Welcome back, {displayName}</h1>
            <p style={styles.p}>Loading warehouse operations...</p>
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
            <h1 style={styles.h1}>Warehouse Dashboard</h1>
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

  return (
    <div>
      {/* Header */}
      <div style={styles.titleSection}>
        <div>
          <h1 style={styles.h1}>Welcome back, {displayName}</h1>
          <p style={styles.p}>Here's what's happening in the warehouse today.</p>
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
        </div>
      </div>

      {/* Quick Actions */}
      <div style={styles.quickGrid}>
        {quickActions.map((action) => (
          <Link key={action.label} to={action.to} style={styles.quickCard}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "none"}>
            <div style={styles.quickIcon}>
              <action.icon size={18} />
            </div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{action.label}</div>
            <PlusCircle size={16} style={{ marginLeft: "auto", color: "#9ca3af" }} />
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
        {/* Workload by Type */}
        <div style={styles.chartCard}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 style={styles.chartTitle}>Workload by Type</h3>
            <Activity size={18} style={{ color: "#527196" }} />
          </div>
          {workloadByType.some((d) => d.total > 0 || d.pending > 0) ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={workloadByType} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(24,52,87,0.06)" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#527196" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#527196" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" iconType="circle" iconSize={8}
                  formatter={(v) => <span style={{ color: "#527196", fontSize: 12 }}>{v}</span>} />
                <Bar dataKey="total" name="Total" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="pending" name="Pending" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 260, display: "flex", alignItems: "center", justifyContent: "center", color: "#527196", fontSize: 14 }}>
              No operations data yet
            </div>
          )}
        </div>

        {/* Operations by Status */}
        <div style={styles.chartCard}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 style={styles.chartTitle}>Operations by Status</h3>
            <Activity size={18} style={{ color: "#527196" }} />
          </div>
          {opsByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={opsByStatus} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3} dataKey="value">
                  {opsByStatus.map((_, i) => (
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
              No operations data yet
            </div>
          )}
        </div>
      </div>

      {/* Recent Operations Table */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>Recent Operations</h2>
          <MoreVertical size={18} style={{ color: "#527196", cursor: "pointer" }} />
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Document</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Product</th>
                <th style={styles.th}>Qty</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.operations.recent.length === 0 ? (
                <tr>
                  <td style={styles.td} colSpan={6}>No operations found yet.</td>
                </tr>
              ) : (
                stats.operations.recent.map((op) => (
                  <tr key={op._id}>
                    <td style={{ ...styles.td, fontWeight: "600", fontFamily: "Consolas, Monaco, monospace", fontSize: 13 }}>{op.documentNo}</td>
                    <td style={{ ...styles.td, fontWeight: "600", textTransform: "capitalize" }}>{op.type}</td>
                    <td style={styles.td}>{op.productName}</td>
                    <td style={styles.td}>{op.totalQty} units</td>
                    <td style={styles.td}>
                      <span style={styles.statusBadge(getStatusStyle(op.status))}>
                        {op.status}
                      </span>
                    </td>
                    <td style={{ ...styles.td, color: "#527196" }}>
                      {new Date(op.createdAt).toLocaleDateString()}
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
