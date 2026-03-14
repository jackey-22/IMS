import { Truck, Search, Filter } from "lucide-react";

export default function DeliveriesPage() {
  const deliveries = [
    { id: "DEL-042", customer: "ABC Furniture", product: "Chairs", quantity: 10, status: "Pending", date: "2024-03-14" },
    { id: "DEL-043", customer: "Home Decor Co", product: "Lamps", quantity: 45, status: "Picking", date: "2024-03-14" },
    { id: "DEL-044", customer: "Industrial Solutions", product: "Toolbox", quantity: 5, status: "Done", date: "2024-03-13" },
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
    btnAction: { background: "white", color: "#111827", border: "1px solid #e5e7eb", padding: "4px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }
  };

  return (
    <div>
      <div style={commonStyles.titleSection}>
        <h1 style={commonStyles.h1}>Delivery Orders</h1>
        <button style={commonStyles.btnPrimary}><Truck size={18} /> Dispatch All</button>
      </div>

      <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
        <div style={{ flex: 1, display: "flex", background: "white", padding: "8px 16px", borderRadius: "8px", border: "1px solid #e5e7eb", alignItems: "center", gap: "8px" }}>
          <Search size={18} color="#6b7280" />
          <input placeholder="Search orders..." style={{ border: "none", outline: "none", width: "100%", fontSize: "14px" }} />
        </div>
        <button style={{ ...commonStyles.btnAction, height: "40px" }}><Filter size={18} /> Filters</button>
      </div>

      <div style={commonStyles.card}>
        <table style={commonStyles.table}>
          <thead>
            <tr>
              <th style={commonStyles.th}>Order ID</th>
              <th style={commonStyles.th}>Customer</th>
              <th style={commonStyles.th}>Product</th>
              <th style={commonStyles.th}>Quantity</th>
              <th style={commonStyles.th}>Status</th>
              <th style={commonStyles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.map((d) => (
              <tr key={d.id}>
                <td style={{ ...commonStyles.td, fontWeight: "600" }}>{d.id}</td>
                <td style={commonStyles.td}>{d.customer}</td>
                <td style={commonStyles.td}>{d.product}</td>
                <td style={commonStyles.td}>{d.quantity} units</td>
                <td style={commonStyles.td}>
                  <span style={commonStyles.statusBadge(d.status === 'Done' ? '#d1fae5' : '#fef3c7', d.status === 'Done' ? '#065f46' : '#92400e')}>
                    {d.status}
                  </span>
                </td>
                <td style={commonStyles.td}>
                   <button style={commonStyles.btnAction}>
                     {d.status === 'Done' ? 'View Details' : 'Process'}
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
