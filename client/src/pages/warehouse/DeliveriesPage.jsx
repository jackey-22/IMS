import { Truck, Search, Filter } from "lucide-react";
import { useState } from "react";

export default function DeliveriesPage() {
  const [view, setView] = useState("list");
  const [search, setSearch] = useState("");
  const deliveries = [
    { id: "DEL-042", customer: "ABC Furniture", product: "Chairs", quantity: 10, status: "Pending", date: "2024-03-14" },
    { id: "DEL-043", customer: "Home Decor Co", product: "Lamps", quantity: 45, status: "Picking", date: "2024-03-14" },
    { id: "DEL-044", customer: "Industrial Solutions", product: "Toolbox", quantity: 5, status: "Done", date: "2024-03-13" },
  ];

  const filteredDeliveries = deliveries.filter((delivery) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return (
      delivery.id.toLowerCase().includes(query) ||
      delivery.customer.toLowerCase().includes(query) ||
      delivery.product.toLowerCase().includes(query)
    );
  });

  const kanbanColumns = ["Pending", "Picking", "Done"];
  const groupedDeliveries = kanbanColumns.reduce((acc, status) => {
    acc[status] = filteredDeliveries.filter((delivery) => delivery.status === status);
    return acc;
  }, {});

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

      <div style={{ display: "flex", gap: "16px", marginBottom: "20px", flexWrap: "wrap" }}>
        <div style={{ flex: 1, display: "flex", background: "white", padding: "8px 16px", borderRadius: "8px", border: "1px solid #e5e7eb", alignItems: "center", gap: "8px", minWidth: "240px" }}>
          <Search size={18} color="#6b7280" />
          <input
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: "none", outline: "none", width: "100%", fontSize: "14px" }}
          />
        </div>
        <button style={{ ...commonStyles.btnAction, height: "40px" }}><Filter size={18} /> Filters</button>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            style={{
              ...commonStyles.btnAction,
              background: view === "list" ? "#eff6ff" : "white",
              borderColor: view === "list" ? "#bfdbfe" : "#e5e7eb",
              color: "#1e3a8a"
            }}
            onClick={() => setView("list")}
          >
            List
          </button>
          <button
            style={{
              ...commonStyles.btnAction,
              background: view === "kanban" ? "#eff6ff" : "white",
              borderColor: view === "kanban" ? "#bfdbfe" : "#e5e7eb",
              color: "#1e3a8a"
            }}
            onClick={() => setView("kanban")}
          >
            Kanban
          </button>
        </div>
      </div>
      {view === "list" ? (
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
              {filteredDeliveries.map((d) => (
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
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
          {kanbanColumns.map((status) => (
            <div key={status} style={{ background: "#ffffff", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "16px" }}>
              <div style={{ fontWeight: "700", marginBottom: "12px", color: "#111827" }}>{status}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {groupedDeliveries[status].map((delivery) => (
                  <div key={delivery.id} style={{ border: "1px solid #e5e7eb", borderRadius: "10px", padding: "12px" }}>
                    <div style={{ fontWeight: "600", marginBottom: "6px" }}>{delivery.id}</div>
                    <div style={{ fontSize: "13px", color: "#6b7280" }}>{delivery.customer}</div>
                    <div style={{ fontSize: "13px", color: "#111827" }}>{delivery.product}</div>
                    <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "6px" }}>Qty: {delivery.quantity}</div>
                    <button style={{ ...commonStyles.btnAction, padding: "4px 10px", fontSize: "12px", marginTop: "10px" }}>
                      {delivery.status === "Done" ? "View Details" : "Process"}
                    </button>
                  </div>
                ))}
                {groupedDeliveries[status].length === 0 && (
                  <div style={{ fontSize: "12px", color: "#9ca3af" }}>No deliveries</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
