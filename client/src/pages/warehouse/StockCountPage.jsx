import { useState } from "react";
import { Save, RefreshCw, AlertTriangle } from "lucide-react";

export default function StockCountPage() {
  const [counts, setCounts] = useState([
    { id: 1, product: "Steel Rods", sku: "STR-001", systemQty: 50, countedQty: 47, location: "Aisle 1" },
    { id: 2, product: "Power Drills", sku: "PWR-202", systemQty: 120, countedQty: 120, location: "Shelf B4" },
    { id: 3, product: "Brake Pads", sku: "BRK-500", systemQty: 85, countedQty: 88, location: "Aisle 2" },
  ]);

  const handleQtyChange = (id, val) => {
    setCounts(counts.map(c => c.id === id ? { ...c, countedQty: parseInt(val) || 0 } : c));
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
    alert: { padding: "16px", backgroundColor: "#fffbeb", borderRadius: "12px", border: "1px solid #fef3c7", marginBottom: "24px", display: "flex", alignItems: "center", gap: "12px" },
    input: { padding: "8px 12px", borderRadius: "6px", border: "1px solid #e5e7eb", width: "100px", outline: "none" }
  };

  return (
    <div>
      <div style={commonStyles.titleSection}>
        <h1 style={commonStyles.h1}>Stock Verification</h1>
        <div style={{ display: "flex", gap: "12px" }}>
            <button style={commonStyles.btnSecondary}><RefreshCw size={18} /> Reset</button>
            <button style={commonStyles.btnPrimary}><Save size={18} /> Submit Adjustments</button>
        </div>
      </div>

      <div style={commonStyles.alert}>
        <AlertTriangle size={20} color="#92400e" />
        <p style={{ margin: 0, fontSize: "14px", color: "#92400e", fontWeight: "600" }}>Physical adjustments will update system stock levels immediately.</p>
      </div>

      <div style={commonStyles.card}>
        <table style={commonStyles.table}>
          <thead>
            <tr>
              <th style={commonStyles.th}>Product Details</th>
              <th style={commonStyles.th}>Location</th>
              <th style={commonStyles.th}>System Qty</th>
              <th style={commonStyles.th}>Counted Qty</th>
              <th style={commonStyles.th}>Diff</th>
              <th style={commonStyles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {counts.map((item) => {
              const diff = item.countedQty - item.systemQty;
              return (
                <tr key={item.id}>
                  <td style={commonStyles.td}>
                    <div style={{ fontWeight: "700" }}>{item.product}</div>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>SKU: {item.sku}</div>
                  </td>
                  <td style={commonStyles.td}>{item.location}</td>
                  <td style={commonStyles.td}>{item.systemQty}</td>
                  <td style={commonStyles.td}>
                    <input 
                      type="number" 
                      value={item.countedQty} 
                      onChange={(e) => handleQtyChange(item.id, e.target.value)}
                      style={commonStyles.input}
                    />
                  </td>
                  <td style={{ ...commonStyles.td, fontWeight: "700", color: diff === 0 ? "#6b7280" : diff > 0 ? "#10b981" : "#ef4444" }}>
                    {diff > 0 ? `+${diff}` : diff}
                  </td>
                  <td style={commonStyles.td}>
                    <span style={{ 
                        padding: "4px 10px", 
                        borderRadius: "999px", 
                        fontSize: "12px", 
                        fontWeight: "600",
                        background: diff === 0 ? "#d1fae5" : "#fef3c7",
                        color: diff === 0 ? "#065f46" : "#92400e"
                    }}>
                      {diff === 0 ? 'Matched' : 'Discrepancy'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
