import { Search, ChevronRight, Map, Edit, Check, X, Filter, Loader2, RefreshCw } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useInventoryOps } from "../../context/InventoryOpsContext.jsx";

export default function ProductsSearchPage() {
  const { stock, loading, refresh, warehouses } = useInventoryOps();
  const [search, setSearch] = useState("");
  const [selectedWarehouseId, setSelectedWarehouseId] = useState("");
  
  const [editingId, setEditingId] = useState(null);
  const [draftStock, setDraftStock] = useState('');

  // Flatten stock so each location is a row
  const flattenedStock = useMemo(() => {
    return stock.flatMap(item => {
      if (!item.warehouses || item.warehouses.length === 0) {
        return [{
          rowId: `${item.id}-none`,
          id: item.id,
          name: item.product,
          sku: item.sku,
          onHand: item.onHand,
          warehouseName: "N/A",
          locationName: "N/A",
          warehouseId: null
        }];
      }
      return item.warehouses.map((wh, idx) => ({
        rowId: `${item.id}-${wh.warehouseId}-${wh.locationId || idx}`,
        id: item.id,
        name: item.product,
        sku: item.sku,
        onHand: wh.onHand,
        warehouseName: wh.warehouseName,
        locationName: wh.locationName || "General Area",
        warehouseId: wh.warehouseId
      }));
    });
  }, [stock]);

  const filtered = useMemo(() => {
    let result = flattenedStock;
    
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.sku.toLowerCase().includes(q)
      );
    }

    if (selectedWarehouseId) {
      result = result.filter(p => p.warehouseId === selectedWarehouseId);
    }

    return result;
  }, [flattenedStock, search, selectedWarehouseId]);

  const startStockEdit = (item) => {
    setEditingId(item.rowId);
    setDraftStock(String(item.onHand));
  };

  const cancelStockEdit = () => {
    setEditingId(null);
    setDraftStock('');
  };

  const saveStockEdit = (item) => {
    // Note: In a real app, this would call an API like /api/operations/adjust
    // For now, we'll just close it as updateStockQuantity is optimistic
    console.log("Saving stock adjustment:", item.id, draftStock);
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
    select: { padding: "8px 12px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "14px", outline: "none", background: "white", minWidth: "160px" }
  };

  return (
    <div>
      <div style={commonStyles.titleSection}>
        <h1 style={commonStyles.h1}>Warehouse Inventory Catalog</h1>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={refresh} style={commonStyles.btnSecondary} disabled={loading}>
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> 
            {loading ? "Syncing..." : "Sync"}
          </button>
          <button style={commonStyles.btnSecondary}><Map size={18} /> View Map</button>
        </div>
      </div>

      <div style={{ ...commonStyles.card, marginBottom: "24px", padding: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "16px", alignItems: "end" }}>
          <div style={commonStyles.filterGroup}>
            <label style={commonStyles.label}>Product Search</label>
            <div style={{ display: "flex", background: "#f3f4f6", padding: "8px 16px", borderRadius: "8px", border: "none", alignItems: "center", gap: "8px" }}>
              <Search size={18} color="#6b7280" />
              <input 
                placeholder="Search by SKU or Name..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ background: "transparent", border: "none", outline: "none", width: "100%", fontSize: "14px" }} 
              />
            </div>
          </div>
          
          <div style={commonStyles.filterGroup}>
            <label style={commonStyles.label}>Warehouse Filter</label>
            <select 
              style={commonStyles.select}
              value={selectedWarehouseId}
              onChange={(e) => setSelectedWarehouseId(e.target.value)}
            >
              <option value="">All Warehouses</option>
              {warehouses.map(w => (
                <option key={w._id} value={w._id}>{w.name}</option>
              ))}
            </select>
          </div>

          <button style={{ ...commonStyles.btnPrimary, height: "40px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Filter size={16} /> Apply
          </button>
        </div>
      </div>

      <div style={commonStyles.card}>
        {loading && !filtered.length ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#6b7280" }}>
            <Loader2 className="animate-spin" style={{ margin: "0 auto 12px auto" }} />
            Retrieving inventory data...
          </div>
        ) : (
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
              {filtered.map((p) => (
                <tr key={p.rowId}>
                  <td style={{ ...commonStyles.td, fontWeight: "700" }}>{p.name}</td>
                  <td style={{ ...commonStyles.td, color: "#6b7280", fontFamily: "monospace", fontSize: "13px" }}>{p.sku}</td>
                  <td style={{ ...commonStyles.td, fontWeight: "800" }}>
                    {editingId === p.rowId ? (
                      <input
                        type="number"
                        value={draftStock}
                        onChange={(e) => setDraftStock(e.target.value)}
                        autoFocus
                        style={{ padding: "6px 10px", borderRadius: "6px", border: "2px solid #3b82f6", width: "90px", outline: "none" }}
                      />
                    ) : (
                      <span style={{ color: p.onHand === 0 ? "#ef4444" : "#111827" }}>
                        {p.onHand}
                      </span>
                    )}
                  </td>
                  <td style={commonStyles.td}>
                     <div style={{ fontSize: "13px", fontWeight: "600" }}>{p.warehouseName}</div>
                     <div style={{ fontSize: "12px", color: "#6b7280" }}>{p.locationName}</div>
                  </td>
                  <td style={commonStyles.td}>
                    {editingId === p.rowId ? (
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <button
                          onClick={() => saveStockEdit(p)}
                          style={{ background: "#10b981", border: "none", color: "white", borderRadius: "6px", padding: "4px", cursor: "pointer" }}
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={cancelStockEdit}
                          style={{ background: "#ef4444", border: "none", color: "white", borderRadius: "6px", padding: "4px", cursor: "pointer" }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                        <button
                          onClick={() => startStockEdit(p)}
                          style={{ background: "transparent", border: "none", cursor: "pointer", color: "#3b82f6" }}
                          title="Quick Adjustment (Audit)"
                        >
                          <Edit size={18} />
                        </button>
                        <ChevronRight size={18} color="#9ca3af" />
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && !loading && (
                <tr>
                  <td colSpan="5" style={{ padding: "40px", textAlign: "center", color: "#9ca3af" }}>
                    No products found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
