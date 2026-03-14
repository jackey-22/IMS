import { useState } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowLeft,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export default function ReceiptsPage() {
  const [view, setView] = useState("list");
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [receivedQty, setReceivedQty] = useState("");

  const receipts = [
    { id: "REC-001", supplier: "Tata Steel", product: "Steel Rods", expected: 100, received: 0, status: "Waiting", date: "2024-03-14" },
    { id: "REC-002", supplier: "Global Logistics", product: "Engines", expected: 10, received: 5, status: "In Progress", date: "2024-03-14" },
    { id: "REC-003", supplier: "Office Supplies Inc", product: "Folders", expected: 500, received: 500, status: "Done", date: "2024-03-13" },
  ];

  const handleOpenReceipt = (receipt) => {
    setSelectedReceipt(receipt);
    setReceivedQty(receipt.received.toString());
    setView("details");
  };

  const commonStyles = {
    titleSection: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" },
    h1: { fontSize: "24px", fontWeight: "700", color: "#111827", margin: 0 },
    btnPrimary: { background: "#3b82f6", color: "white", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: "600", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" },
    btnSecondary: { background: "white", color: "#111827", border: "1px solid #e5e7eb", padding: "8px 16px", borderRadius: "8px", fontWeight: "600", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" },
    card: { background: "#ffffff", borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)", overflow: "hidden" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: { textAlign: "left", padding: "16px 24px", background: "#f9fafb", color: "#6b7280", fontWeight: "600", fontSize: "13px", textTransform: "uppercase" },
    td: { padding: "16px 24px", borderBottom: "1px solid #e5e7eb", fontSize: "14px", color: "#111827" },
    statusBadge: (bg, color) => ({ padding: "4px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: "600", background: bg, color: color }),
    input: { padding: "8px 12px", borderRadius: "6px", border: "1px solid #e5e7eb", outline: "none" }
  };

  if (view === "details") {
    return (
      <div>
        <div style={commonStyles.titleSection}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button onClick={() => setView("list")} style={{ ...commonStyles.btnSecondary, padding: "8px" }}>
              <ArrowLeft size={20} />
            </button>
            <h1 style={commonStyles.h1}>Receipt {selectedReceipt.id}</h1>
          </div>
          <button onClick={() => setView("list")} style={commonStyles.btnPrimary}>
            <CheckCircle size={18} />
            <span>Validate Receipt</span>
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px" }}>
          <div style={commonStyles.card}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #e5e7eb" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>Verify Items</h2>
            </div>
            <table>
              <thead>
                <tr>
                  <th style={commonStyles.th}>Product</th>
                  <th style={commonStyles.th}>Expected</th>
                  <th style={commonStyles.th}>Received</th>
                  <th style={commonStyles.th}>Current Count</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ ...commonStyles.td, fontWeight: "600" }}>{selectedReceipt.product}</td>
                  <td style={commonStyles.td}>{selectedReceipt.expected}</td>
                  <td style={commonStyles.td}>{selectedReceipt.received}</td>
                  <td style={commonStyles.td}>
                    <input 
                      type="number" 
                      value={receivedQty} 
                      onChange={(e) => setReceivedQty(e.target.value)}
                      style={{ ...commonStyles.input, width: "100px" }}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ ...commonStyles.card, padding: "24px" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "16px" }}>Receipt Info</h3>
            <div style={{ display: "grid", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "12px", color: "#6b7280", display: "block" }}>Supplier</label>
                <div style={{ fontWeight: "600" }}>{selectedReceipt.supplier}</div>
              </div>
              <div style={{ padding: "12px", background: "#fffbeb", border: "1px solid #fef3c7", borderRadius: "8px", display: "flex", gap: "10px" }}>
                <AlertCircle size={20} color="#92400e" />
                <p style={{ margin: 0, fontSize: "13px", color: "#92400e" }}>Double-check physical items.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={commonStyles.titleSection}>
        <h1 style={commonStyles.h1}>Receipts from Suppliers</h1>
        <button style={commonStyles.btnPrimary}><Plus size={18} /> New Receipt</button>
      </div>

      <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
        <div style={{ flex: 1, display: "flex", background: "white", padding: "8px 16px", borderRadius: "8px", border: "1px solid #e5e7eb", alignItems: "center", gap: "8px" }}>
          <Search size={18} color="#6b7280" />
          <input placeholder="Search..." style={{ border: "none", outline: "none", width: "100%", fontSize: "14px" }} />
        </div>
        <button style={commonStyles.btnSecondary}><Filter size={18} /> Filters</button>
      </div>

      <div style={commonStyles.card}>
        <table style={commonStyles.table}>
          <thead>
            <tr>
              <th style={commonStyles.th}>ID</th>
              <th style={commonStyles.th}>Supplier</th>
              <th style={commonStyles.th}>Product</th>
              <th style={commonStyles.th}>Expected</th>
              <th style={commonStyles.th}>Status</th>
              <th style={commonStyles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {receipts.map((r) => (
              <tr key={r.id}>
                <td style={{ ...commonStyles.td, fontWeight: "600" }}>{r.id}</td>
                <td style={commonStyles.td}>{r.supplier}</td>
                <td style={commonStyles.td}>{r.product}</td>
                <td style={commonStyles.td}>{r.expected}</td>
                <td style={commonStyles.td}>
                  <span style={commonStyles.statusBadge(r.status === 'Done' ? '#d1fae5' : '#e0f2fe', r.status === 'Done' ? '#065f46' : '#075985')}>
                    {r.status}
                  </span>
                </td>
                <td style={commonStyles.td}>
                  <button onClick={() => handleOpenReceipt(r)} style={{ ...commonStyles.btnSecondary, padding: "4px 12px", fontSize: "12px" }}>Open</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
