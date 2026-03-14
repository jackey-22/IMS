import { Search, ChevronRight, Map, Edit, Check, X, Filter } from "lucide-react";
import { useState } from "react";

export default function ProductsSearchPage() {
  const [products, setProducts] = useState([
    { name: "Steel Rods", sku: "STR-001", category: "Raw Material", stock: 1250, warehouse: "Main", location: "Aisle 1, Shelf A" },
    { name: "Power Drills", sku: "PWR-202", category: "Tools", stock: 45, warehouse: "Main", location: "Aisle 4, Shelf B" },
    { name: "Brake Pads", sku: "BRK-500", category: "Auto Parts", stock: 850, warehouse: "North", location: "Aisle 2, Bin 12" },
    { name: "Office Chairs", sku: "OFC-101", category: "Furniture", stock: 12, warehouse: "Main", location: "Aisle 8" },
    { name: "Duct Tape", sku: "MISC-99", category: "Consumables", stock: 500, warehouse: "Main", location: "Dispatch Bay" },
  ]);

  const [editingSku, setEditingSku] = useState(null);
  const [draftStock, setDraftStock] = useState('');

  const startStockEdit = (product) => {
    setEditingSku(product.sku);
    setDraftStock(String(product.stock));
  };

  const cancelStockEdit = () => {
    setEditingSku(null);
    setDraftStock('');
  };

  const saveStockEdit = (product) => {
    const nextStock = Number(draftStock);
    if (Number.isNaN(nextStock) || nextStock < 0) return;
    setProducts(products.map((p) => (p.sku === product.sku ? { ...p, stock: nextStock } : p)));
    cancelStockEdit();
  };

  const commonStyles = {
    titleSection: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" },
    h1: { fontSize: "24px", fontWeight: "700", color: "#111827", margin: 0 },
    card: { background: "#ffffff", borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)", overflow: "hidden" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: { textAlign: "left", padding: "16px 24px", background: "#f9fafb", color: "#6b7280", fontWeight: "600", fontSize: "13px", textTransform: "uppercase" },
    td: { padding: "16px 24px", borderBottom: "1px solid #e5e7eb", fontSize: "14px", color: "#111827" },
    btnPrimary: { background: "#3b82f6", color: "white", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: "600", fontSize: "14px", cursor: "pointer" },
    btnSecondary: { background: "white", color: "#111827", border: "1px solid #e5e7eb", padding: "8px 16px", borderRadius: "8px", fontWeight: "600", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" },
    filterGroup: { display: "flex", flexDirection: "column", gap: "6px" },
    label: { fontSize: "12px", fontWeight: "600", color: "#6b7280" },
    select: { padding: "8px 12px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "14px", outline: "none", background: "white" }
  };

  return (
    <div>
      <div style={commonStyles.titleSection}>
        <h1 style={commonStyles.h1}>Warehouse Inventory Catalog</h1>
        <button style={commonStyles.btnSecondary}><Map size={18} /> View Map</button>
      </div>

      <div style={{ ...commonStyles.card, marginBottom: "24px", padding: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: "16px", alignItems: "end" }}>
          <div style={commonStyles.filterGroup}>
            <label style={commonStyles.label}>Product Search</label>
            <div style={{ display: "flex", background: "#f3f4f6", padding: "8px 16px", borderRadius: "8px", border: "none", alignItems: "center", gap: "8px" }}>
              <Search size={18} color="#6b7280" />
              <input placeholder="Search by SKU or Name..." style={{ background: "transparent", border: "none", outline: "none", width: "100%", fontSize: "14px" }} />
            </div>
          </div>
          
          <div style={commonStyles.filterGroup}>
            <label style={commonStyles.label}>Category</label>
            <select style={commonStyles.select}>
              <option>All Categories</option>
              <option>Raw Material</option>
              <option>Tools</option>
            </select>
          </div>

          <div style={commonStyles.filterGroup}>
            <label style={commonStyles.label}>Storage Zone</label>
            <select style={commonStyles.select}>
              <option>All Zones</option>
              <option>Main Warehouse</option>
              <option>North Depot</option>
            </select>
          </div>

          <button style={{ ...commonStyles.btnPrimary, height: "40px", display: "flex", alignItems: "center", gap: "8px" }}><Filter size={16} /> Filter</button>
        </div>
      </div>

      <div style={commonStyles.card}>
        <table style={commonStyles.table}>
          <thead>
            <tr>
              <th style={commonStyles.th}>Product Details</th>
              <th style={commonStyles.th}>SKU</th>
              <th style={commonStyles.th}>Stock</th>
              <th style={commonStyles.th}>Location</th>
              <th style={commonStyles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => (
              <tr key={i}>
                <td style={{ ...commonStyles.td, fontWeight: "700" }}>{p.name}</td>
                <td style={{ ...commonStyles.td, color: "#6b7280", fontMono: "true", fontSize: "13px" }}>{p.sku}</td>
                <td style={{ ...commonStyles.td, fontWeight: "800" }}>
                  {editingSku === p.sku ? (
                    <input
                      type="number"
                      value={draftStock}
                      onChange={(e) => setDraftStock(e.target.value)}
                      style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #3b82f6", width: "90px", outline: "none" }}
                    />
                  ) : (
                    p.stock
                  )}
                </td>
                <td style={commonStyles.td}>
                   <div style={{ fontSize: "13px", fontWeight: "600" }}>{p.warehouse}</div>
                   <div style={{ fontSize: "12px", color: "#6b7280" }}>{p.location}</div>
                </td>
                <td style={commonStyles.td}>
                  {editingSku === p.sku ? (
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <button
                        onClick={() => saveStockEdit(p)}
                        style={{ background: "#10b981", border: "none", color: "white", borderRadius: "6px", padding: "4px" }}
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={cancelStockEdit}
                        style={{ background: "#ef4444", border: "none", color: "white", borderRadius: "6px", padding: "4px" }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      <button
                        onClick={() => startStockEdit(p)}
                        style={{ background: "transparent", border: "none", cursor: "pointer", color: "#3b82f6" }}
                      >
                        <Edit size={18} />
                      </button>
                      <ChevronRight size={18} color="#9ca3af" />
                    </div>
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
