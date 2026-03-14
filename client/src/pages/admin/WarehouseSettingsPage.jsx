import { useEffect, useMemo, useState } from "react";
import { Building2, MapPin, Plus } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  listWarehouses,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  createLocation,
  updateLocation,
  deleteLocation
} from "../../services/warehousesApi.js";

const LOCATION_TYPES = ["rack", "bin", "zone"];

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

  const [selectedWarehouseId, setSelectedWarehouseId] = useState("");
  const [locationForm, setLocationForm] = useState({
    name: "",
    code: "",
    type: "rack"
  });
  const [creatingLocation, setCreatingLocation] = useState(false);

  const [feedback, setFeedback] = useState(null);

  const selectedWarehouse = useMemo(
    () => warehouses.find((w) => w._id === selectedWarehouseId) || null,
    [selectedWarehouseId, warehouses]
  );

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
      if (!selectedWarehouseId && data.length) {
        setSelectedWarehouseId(data[0]._id);
      }
    } catch (err) {
      setError(err.message || "Failed to load warehouses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWarehouses();
  }, []);

  useEffect(() => {
    if (selectedWarehouseId && !warehouses.some((w) => w._id === selectedWarehouseId)) {
      setSelectedWarehouseId(warehouses[0]?._id || "");
    }
  }, [warehouses, selectedWarehouseId]);

  const onWarehouseInput = (e) => {
    const { name, value } = e.target;
    setWarehouseForm((p) => ({ ...p, [name]: value }));
  };

  const onLocationInput = (e) => {
    const { name, value } = e.target;
    setLocationForm((p) => ({ ...p, [name]: value }));
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
      setSelectedWarehouseId(created._id);
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

  const handleCreateLocation = async (e) => {
    e.preventDefault();
    if (!selectedWarehouseId) {
      setFlash("error", "Select a warehouse first.");
      return;
    }
    if (!locationForm.name.trim() || !locationForm.code.trim()) {
      setFlash("error", "Location name and code are required.");
      return;
    }

    setCreatingLocation(true);
    try {
      const updatedWarehouse = await createLocation(token, selectedWarehouseId, {
        name: locationForm.name.trim(),
        code: locationForm.code.trim(),
        type: locationForm.type
      });
      setWarehouses((prev) => prev.map((w) => (w._id === updatedWarehouse._id ? updatedWarehouse : w)));
      setLocationForm({ name: "", code: "", type: "rack" });
      setFlash("success", "Location added.");
    } catch (err) {
      setFlash("error", err.message || "Failed to create location.");
    } finally {
      setCreatingLocation(false);
    }
  };

  const toggleLocationStatus = async (location) => {
    if (!selectedWarehouse) return;
    try {
      const updatedWarehouse = await updateLocation(token, selectedWarehouse._id, location._id, {
        isActive: !location.isActive
      });
      setWarehouses((prev) => prev.map((w) => (w._id === updatedWarehouse._id ? updatedWarehouse : w)));
      setFlash("success", !location.isActive ? "Location enabled." : "Location disabled.");
    } catch (err) {
      setFlash("error", err.message || "Failed to update location.");
    }
  };

  const handleDeleteLocation = async (location) => {
    if (!selectedWarehouse) return;
    if (!window.confirm(`Delete location "${location.name}"?`)) return;
    try {
      const updatedWarehouse = await deleteLocation(token, selectedWarehouse._id, location._id);
      setWarehouses((prev) => prev.map((w) => (w._id === updatedWarehouse._id ? updatedWarehouse : w)));
      setFlash("success", "Location deleted.");
    } catch (err) {
      setFlash("error", err.message || "Failed to delete location.");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "24px", color: "#111827", fontWeight: 700 }}>Settings · Warehouse</h1>
          <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: "14px" }}>
            Manage warehouses and their locations from one admin page.
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        <section className="dashboard-card" style={{ padding: "18px" }}>
          <h2 style={{ margin: "0 0 14px", fontSize: "18px", color: "#111827" }}>Create Warehouse</h2>
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
          <h2 style={{ margin: "0 0 14px", fontSize: "18px", color: "#111827" }}>Add Location</h2>
          <form className="form" onSubmit={handleCreateLocation}>
            <div className="field">
              <label htmlFor="warehouse-select">Warehouse</label>
              <select
                id="warehouse-select"
                className="admin-input-select"
                value={selectedWarehouseId}
                onChange={(e) => setSelectedWarehouseId(e.target.value)}
              >
                <option value="">Select warehouse</option>
                {warehouses.map((w) => (
                  <option key={w._id} value={w._id}>{w.name} ({w.code})</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="l-name">Location Name</label>
              <input id="l-name" name="name" value={locationForm.name} onChange={onLocationInput} placeholder="Aisle A" />
            </div>
            <div className="field">
              <label htmlFor="l-code">Short Code</label>
              <input id="l-code" name="code" value={locationForm.code} onChange={onLocationInput} placeholder="A-01" />
            </div>
            <div className="field">
              <label htmlFor="l-type">Type</label>
              <select id="l-type" className="admin-input-select" name="type" value={locationForm.type} onChange={onLocationInput}>
                {LOCATION_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <button className="button" type="submit" disabled={creatingLocation || !selectedWarehouseId}>
              <MapPin size={16} />
              <span style={{ marginLeft: "6px" }}>{creatingLocation ? "Creating..." : "Add Location"}</span>
            </button>
          </form>
        </section>
      </div>

      <section className="dashboard-card" style={{ padding: "18px", marginBottom: "16px" }}>
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

      <section className="dashboard-card" style={{ padding: "18px" }}>
        <h2 style={{ margin: "0 0 12px", fontSize: "18px", color: "#111827" }}>Locations</h2>
        {!selectedWarehouse ? (
          <p className="muted">Select a warehouse to view locations.</p>
        ) : !selectedWarehouse.locations?.length ? (
          <p className="muted">No locations found for {selectedWarehouse.name}.</p>
        ) : (
          <div className="users-table-wrap">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Code</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {selectedWarehouse.locations.map((loc) => (
                  <tr key={loc._id}>
                    <td className="user-primary">{loc.name}</td>
                    <td className="user-login-id">{loc.code}</td>
                    <td>{loc.type}</td>
                    <td>
                      <span className={`status-pill ${loc.isActive ? "active" : "disabled"}`}>
                        {loc.isActive ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button className="ghost-button admin-action-btn" type="button" onClick={() => toggleLocationStatus(loc)}>
                          {loc.isActive ? "Disable" : "Enable"}
                        </button>
                        <button className="admin-danger-btn" type="button" onClick={() => handleDeleteLocation(loc)}>
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
