import { ArrowLeftRight, Search, Filter, CheckCircle, PlusCircle } from "lucide-react";

export default function TransfersPage() {
  const transfers = [
    { id: "TRA-015", from: "Main Warehouse", to: "Production Line A", product: "Steel Rods", quantity: 30, status: "Scheduled", date: "2024-03-14" },
    { id: "TRA-016", from: "Receiving Bay", to: "Aisle 4, Shelf B", product: "Power Drills", quantity: 50, status: "Pending", date: "2024-03-14" },
    { id: "TRA-017", from: "Aisle 2", to: "QC Station", product: "Brake Pads", quantity: 100, status: "Done", date: "2024-03-13" },
  ];

  const commonStyles = {
    titleSection: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" },
    h1: { fontSize: "24px", fontWeight: "700", color: "#111827", margin: 0 },
    btnPrimary: { background: "#3b82f6", color: "white", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: "600", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" },
    card: { background: "#ffffff", borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)", overflow: "hidden" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: { textAlign: "left", padding: "16px 24px", background: "#f9fafb", color: "#6b7280", fontWeight: "600", fontSize: "13px", textTransform: "uppercase" },
    td: { padding: "16px 24px", borderBottom: "1px solid #e5e7eb", fontSize: "14px", color: "#111827" },
    statusBadge: (bg, color) => ({ padding: "4px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: "600", background: bg, color: color }),
    btnAction: { background: "white", color: "#111827", border: "1px solid #e5e7eb", padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }
  };

  return (
    <div>
      <div style={commonStyles.titleSection}>
        <h1 style={commonStyles.h1}>Internal Transfers</h1>
        <button style={commonStyles.btnPrimary}><PlusCircle size={18} /> Plan Transfer</button>
      </div>

      <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
        <div style={{ flex: 1, display: "flex", background: "white", padding: "8px 16px", borderRadius: "8px", border: "1px solid #e5e7eb", alignItems: "center", gap: "8px" }}>
          <Search size={18} color="#6b7280" />
          <input placeholder="Search route..." style={{ border: "none", outline: "none", width: "100%", fontSize: "14px" }} />
        </div>
        <button style={{ ...commonStyles.btnAction, height: "40px" }}><Filter size={18} /> Filters</button>
      </div>

      <div style={commonStyles.card}>
        <table style={commonStyles.table}>
          <thead>
            <tr>
              <th style={commonStyles.th}>ID</th>
              <th style={commonStyles.th}>Route</th>
              <th style={commonStyles.th}>Product</th>
              <th style={commonStyles.th}>Qty</th>
              <th style={commonStyles.th}>Status</th>
              <th style={commonStyles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {transfers.map((t) => (
              <tr key={t.id}>
                <td style={{ ...commonStyles.td, fontWeight: "600" }}>{t.id}</td>
                <td style={commonStyles.td}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>{t.from}</span>
                    <ArrowLeftRight size={14} color="#6b7280" />
                    <span style={{ fontWeight: "600" }}>{t.to}</span>
                  </div>
                </td>
                <td style={commonStyles.td}>{t.product}</td>
                <td style={commonStyles.td}>{t.quantity}</td>
                <td style={commonStyles.td}>
                  <span style={commonStyles.statusBadge(t.status === 'Done' ? '#d1fae5' : t.status === 'Scheduled' ? '#ede9fe' : '#e0f2fe', t.status === 'Done' ? '#065f46' : t.status === 'Scheduled' ? '#5b21b6' : '#075985')}>
                    {t.status}
                  </span>
                </td>
                <td style={commonStyles.td}>
                   {t.status !== 'Done' && (
                     <button style={{ ...commonStyles.btnPrimary, padding: "4px 12px", fontSize: "12px" }}>
                       Confirm
                     </button>
                   )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
