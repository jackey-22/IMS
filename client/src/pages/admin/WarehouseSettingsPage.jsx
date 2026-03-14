import { useEffect, useState } from "react";
import { Building2, Plus } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  listWarehouses,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse
} from "../../services/warehousesApi.js";

export default function WarehouseSettingsPage() {
  const { session } = useAuth();
  const token = session?.token;

  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [warehouseForm, setWarehouseForm] = useState({
    name: "",
    code: "",
    address: ""
  });
  const [creatingWarehouse, setCreatingWarehouse] = useState(false);

  const [feedback, setFeedback] = useState(null);

  const activeWarehouseCount = warehouses.filter((w) => w.isActive).length;
  const totalLocationCount = warehouses.reduce((sum, w) => sum + (w.locations?.length || 0), 0);

  const setFlash = (type, text) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 2600);
  };

  const loadWarehouses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listWarehouses(token);
      setWarehouses(data);
    } catch (err) {
      setError(err.message || "Failed to load warehouses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWarehouses();
  }, []);

  const onWarehouseInput = (e) => {
    const { name, value } = e.target;
    setWarehouseForm((p) => ({ ...p, [name]: value }));
  };

  const handleCreateWarehouse = async (e) => {
    e.preventDefault();
    if (!warehouseForm.name.trim() || !warehouseForm.code.trim()) {
      setFlash("error", "Warehouse name and code are required.");
      return;
    }

    setCreatingWarehouse(true);
    try {
      const created = await createWarehouse(token, {
        name: warehouseForm.name.trim(),
        code: warehouseForm.code.trim(),
        address: warehouseForm.address.trim()
      });
      setWarehouses((prev) => [created, ...prev]);
      setWarehouseForm({ name: "", code: "", address: "" });
      setFlash("success", "Warehouse created.");
    } catch (err) {
      setFlash("error", err.message || "Failed to create warehouse.");
    } finally {
      setCreatingWarehouse(false);
    }
  };

  const toggleWarehouseStatus = async (warehouse) => {
    try {
      const updated = await updateWarehouse(token, warehouse._id, { isActive: !warehouse.isActive });
      setWarehouses((prev) => prev.map((w) => (w._id === updated._id ? updated : w)));
      setFlash("success", updated.isActive ? "Warehouse enabled." : "Warehouse disabled.");
    } catch (err) {
      setFlash("error", err.message || "Failed to update warehouse.");
    }
  };

  const handleDeleteWarehouse = async (warehouse) => {
    if (!window.confirm(`Delete warehouse "${warehouse.name}" and all its locations?`)) return;
    try {
      await deleteWarehouse(token, warehouse._id);
      setWarehouses((prev) => prev.filter((w) => w._id !== warehouse._id));
      setFlash("success", "Warehouse deleted.");
    } catch (err) {
      setFlash("error", err.message || "Failed to delete warehouse.");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "24px", color: "#111827", fontWeight: 700 }}>Settings · Warehouses</h1>
          <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: "14px" }}>
            Create and manage warehouse masters. Use the Locations page to manage hierarchy.
          </p>
        </div>
      </div>

      {feedback && (
        <div className={`feedback ${feedback.type}`} style={{ marginBottom: "14px" }}>
          {feedback.text}
        </div>
      )}
      {error && (
        <div className="feedback error" style={{ marginBottom: "14px" }}>
          {error}
        </div>
      )}

      <section className="admin-kpi-grid" style={{ marginBottom: "20px" }}>
        <article className="admin-kpi-card">
          <span className="admin-kpi-label">Total Warehouses</span>
          <strong className="admin-kpi-value">{warehouses.length}</strong>
        </article>
        <article className="admin-kpi-card">
          <span className="admin-kpi-label">Active Warehouses</span>
          <strong className="admin-kpi-value">{activeWarehouseCount}</strong>
        </article>
        <article className="admin-kpi-card">
          <span className="admin-kpi-label">Total Locations</span>
          <strong className="admin-kpi-value">{totalLocationCount}</strong>
        </article>
      </section>

      <section className="dashboard-card" style={{ padding: "18px", marginBottom: "16px" }}>
        <h2 style={{ margin: "0 0 14px", fontSize: "18px", color: "#111827" }}>Add Warehouse</h2>
        <form className="form" onSubmit={handleCreateWarehouse}>
          <div className="field">
            <label htmlFor="w-name">Name</label>
            <input id="w-name" name="name" value={warehouseForm.name} onChange={onWarehouseInput} placeholder="Main Warehouse" />
          </div>
          <div className="field">
            <label htmlFor="w-code">Short Code</label>
            <input id="w-code" name="code" value={warehouseForm.code} onChange={onWarehouseInput} placeholder="WH-MAIN" />
          </div>
          <div className="field">
            <label htmlFor="w-address">Address</label>
            <input id="w-address" name="address" value={warehouseForm.address} onChange={onWarehouseInput} placeholder="Address" />
          </div>
          <button className="button" type="submit" disabled={creatingWarehouse}>
            <Plus size={16} />
            <span style={{ marginLeft: "6px" }}>{creatingWarehouse ? "Creating..." : "Add Warehouse"}</span>
          </button>
        </form>
      </section>

      <section className="dashboard-card" style={{ padding: "18px" }}>
        <h2 style={{ margin: "0 0 12px", fontSize: "18px", color: "#111827", display: "flex", alignItems: "center", gap: "8px" }}>
          <Building2 size={18} /> Warehouses
        </h2>
        {loading ? (
          <p className="muted">Loading warehouses...</p>
        ) : warehouses.length === 0 ? (
          <p className="muted">No warehouses added yet.</p>
        ) : (
          <div className="users-table-wrap">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Code</th>
                  <th>Address</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {warehouses.map((w) => (
                  <tr key={w._id}>
                    <td className="user-primary">{w.name}</td>
                    <td className="user-login-id">{w.code}</td>
                    <td>{w.address || "-"}</td>
                    <td>
                      <span className={`status-pill ${w.isActive ? "active" : "disabled"}`}>
                        {w.isActive ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button className="ghost-button admin-action-btn" type="button" onClick={() => toggleWarehouseStatus(w)}>
                          {w.isActive ? "Disable" : "Enable"}
                        </button>
                        <button className="admin-danger-btn" type="button" onClick={() => handleDeleteWarehouse(w)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
