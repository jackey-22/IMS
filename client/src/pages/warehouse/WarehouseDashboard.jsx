import {
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowLeftRight,
  Calendar,
  MoreVertical,
  PlusCircle,
  ClipboardCheck
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function WarehouseDashboard() {
  const { session } = useAuth();
  const displayName = session?.user?.name || "Warehouse Team";
  const kpis = [
    { label: "Pending Receipts", value: "3 Receipts Waiting", icon: ArrowDownCircle, color: "#3b82f6", bg: "#eff6ff" },
    { label: "Pending Deliveries", value: "2 Deliveries Pending", icon: ArrowUpCircle, color: "#10b981", bg: "#ecfdf5" },
    { label: "Transfers to Perform", value: "1 Transfer Scheduled", icon: ArrowLeftRight, color: "#8b5cf6", bg: "#f5f3ff" },
  ];

  const recentOperations = [
    { type: "Receipt", product: "Steel Rods", quantity: 150, status: "Waiting", date: "2024-03-14", id: "REC-001" },
    { type: "Delivery", product: "Office Chairs", quantity: 20, status: "Waiting", date: "2024-03-14", id: "DEL-042" },
    { type: "Transfer", product: "Power Drills", quantity: 30, status: "Scheduled", date: "2024-03-14", id: "TRA-015" },
    { type: "Receipt", product: "Brake Pads", quantity: 500, status: "Done", date: "2024-03-13", id: "REC-002" },
  ];

  const quickActions = [
    { label: "New Receipt", to: "/warehouse/receipts", icon: ArrowDownCircle },
    { label: "New Delivery", to: "/warehouse/deliveries", icon: ArrowUpCircle },
    { label: "Plan Transfer", to: "/warehouse/transfers", icon: ArrowLeftRight },
    { label: "Stock Count", to: "/warehouse/stock-count", icon: ClipboardCheck }
  ];

  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case 'waiting': return { background: '#e0f2fe', color: '#075985' };
      case 'done': return { background: '#d1fae5', color: '#065f46' };
      case 'scheduled': return { background: '#ede9fe', color: '#5b21b6' };
      default: return { background: '#fef3c7', color: '#92400e' };
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
    btnSecondary: {
      background: "white",
      color: "#111827",
      border: "1px solid #e5e7eb",
      padding: "8px 16px",
      borderRadius: "8px",
      fontWeight: "600",
      fontSize: "14px",
      cursor: "pointer",
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
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      textDecoration: "none"
    },
    kpiGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
      gap: "24px",
      marginBottom: "32px"
    },
    kpiCard: {
      background: "#ffffff",
      padding: "24px",
      borderRadius: "12px",
      boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      border: "1px solid #e5e7eb",
      display: "flex",
      alignItems: "center",
      gap: "16px"
    },
    kpiIcon: (bg, color) => ({
      width: "48px",
      height: "48px",
      borderRadius: "12px",
      backgroundColor: bg,
      color: color,
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
    }),
    actionBtn: {
        background: "white",
        color: "#111827",
        border: "1px solid #e5e7eb",
        padding: "4px 12px",
        borderRadius: "8px",
        fontSize: "12px",
        fontWeight: "600",
        cursor: "pointer"
    },
    quickGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      gap: "14px",
      marginBottom: "24px"
    },
    quickCard: {
      background: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: "12px",
      padding: "14px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      textDecoration: "none",
      color: "#111827",
      boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
    },
    quickIcon: {
      width: "36px",
      height: "36px",
      borderRadius: "10px",
      background: "#eff6ff",
      color: "#1d4ed8",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  };

  return (
    <div>
      <div style={styles.titleSection}>
        <div>
          <h1 style={styles.h1}>Welcome back, {displayName}</h1>
          <p style={styles.p}>Here's what's happening in the warehouse today.</p>
        </div>
        <button style={styles.btnSecondary}>
          <Calendar size={18} />
          <span>March 14, 2024</span>
        </button>
      </div>

      <div style={styles.quickGrid}>
        {quickActions.map((action) => (
          <Link key={action.label} to={action.to} style={styles.quickCard}>
            <div style={styles.quickIcon}>
              <action.icon size={18} />
            </div>
            <div style={{ fontWeight: 600 }}>{action.label}</div>
            <PlusCircle size={16} style={{ marginLeft: "auto", color: "#9ca3af" }} />
          </Link>
        ))}
      </div>

      <div style={styles.kpiGrid}>
        {kpis.map((kpi, i) => (
          <div key={i} style={styles.kpiCard}>
            <div style={styles.kpiIcon(kpi.bg, kpi.color)}>
              <kpi.icon size={24} />
            </div>
            <div>
              <h3 style={styles.kpiLabel}>{kpi.label}</h3>
              <p style={styles.kpiValue}>{kpi.value.split(' ')[0]}</p>
              <div style={styles.p}>{kpi.value.split(' ').slice(1).join(' ')}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>Recent Operations</h2>
          <MoreVertical size={18} style={{ color: "#6b7280", cursor: "pointer" }} />
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Operation Type</th>
                <th style={styles.th}>Product</th>
                <th style={styles.th}>Quantity</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentOperations.map((op) => (
                <tr key={op.id}>
                  <td style={{ ...styles.td, fontWeight: "600" }}>{op.type}</td>
                  <td style={styles.td}>{op.product}</td>
                  <td style={styles.td}>{op.quantity} units</td>
                  <td style={styles.td}>
                    <span style={styles.statusBadge(getStatusStyle(op.status))}>
                      {op.status}
                    </span>
                  </td>
                  <td style={{ ...styles.td, color: "#6b7280" }}>{op.date}</td>
                  <td style={styles.td}>
                    <button style={styles.actionBtn}>Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
