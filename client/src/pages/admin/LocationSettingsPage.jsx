import { useEffect, useMemo, useState } from "react";
import { MapPin, Plus } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  listWarehouses,
  updateWarehouse,
  updateLocation,
  deleteLocation
} from "../../services/warehousesApi.js";

const makeNodeId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const createLocationNode = () => ({
  nodeId: makeNodeId(),
  name: "",
  code: "",
  type: "zone",
  children: []
});

const updateNodeById = (nodes, nodeId, updater) =>
  nodes.map((node) => {
    if (node.nodeId === nodeId) {
      return updater(node);
    }

    if (!node.children?.length) {
      return node;
    }

    return {
      ...node,
      children: updateNodeById(node.children, nodeId, updater)
    };
  });

const removeNodeById = (nodes, nodeId) =>
  nodes
    .filter((node) => node.nodeId !== nodeId)
    .map((node) => ({
      ...node,
      children: removeNodeById(node.children || [], nodeId)
    }));

const addChildNodeById = (nodes, nodeId) =>
  nodes.map((node) => {
    if (node.nodeId === nodeId) {
      return {
        ...node,
        children: [...(node.children || []), createLocationNode()]
      };
    }

    if (!node.children?.length) {
      return node;
    }

    return {
      ...node,
      children: addChildNodeById(node.children, nodeId)
    };
  });

const flattenHierarchy = (nodes, parentCode = null, collector = []) => {
  nodes.forEach((node) => {
    const code = node.code.trim();
    collector.push({
      name: node.name.trim(),
      code,
      type: node.type.trim() || "location",
      isActive: true,
      parentCode
    });

    flattenHierarchy(node.children || [], code, collector);
  });

  return collector;
};

const countNodes = (nodes) =>
  nodes.reduce((sum, node) => sum + 1 + countNodes(node.children || []), 0);

const buildTreeFromLocations = (locations = []) => {
  if (!locations.length) return [];

  const map = new Map();
  const roots = [];

  locations.forEach((loc) => {
    map.set((loc.code || "").toLowerCase(), {
      _id: loc._id,
      name: loc.name || "",
      code: loc.code || "",
      type: loc.type || "location",
      isActive: loc.isActive ?? true,
      parentCode: loc.parentCode || null,
      children: []
    });
  });

  map.forEach((node) => {
    const parentKey = (node.parentCode || "").toLowerCase();
    if (parentKey && map.has(parentKey)) {
      map.get(parentKey).children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
};

function HierarchyRows({ nodes, depth, onChange, onAddChild, onRemove }) {
  return nodes.map((node) => (
    <div key={node.nodeId} className="space-y-2">
      <div className="rounded-lg border border-line bg-surface-soft p-3" style={{ marginLeft: `${depth * 18}px` }}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
          <div className="md:col-span-4">
            <label className="block text-xs font-medium text-ink-soft mb-1">Name</label>
            <input
              type="text"
              value={node.name}
              onChange={(e) => onChange(node.nodeId, "name", e.target.value)}
              className="w-full px-2 py-2 border border-line rounded bg-surface text-ink text-sm"
              placeholder={depth === 0 ? "Zone A" : "Rack A1"}
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-ink-soft mb-1">Code</label>
            <input
              type="text"
              value={node.code}
              onChange={(e) => onChange(node.nodeId, "code", e.target.value.toUpperCase())}
              className="w-full px-2 py-2 border border-line rounded bg-surface text-ink text-sm"
              placeholder={depth === 0 ? "ZONE-A" : "RACK-A1"}
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-ink-soft mb-1">Type</label>
            <input
              type="text"
              value={node.type}
              onChange={(e) => onChange(node.nodeId, "type", e.target.value)}
              className="w-full px-2 py-2 border border-line rounded bg-surface text-ink text-sm"
              placeholder="zone / rack / bin / shelf"
            />
          </div>

          <div className="md:col-span-2 flex gap-2">
            <button
              type="button"
              onClick={() => onAddChild(node.nodeId)}
              className="flex-1 px-2 py-2 border border-line rounded text-ink text-xs hover:bg-surface"
              title="Add child"
            >
              + Child
            </button>
            <button
              type="button"
              onClick={() => onRemove(node.nodeId)}
              className="px-2 py-2 border border-red-200 text-red-600 rounded text-xs hover:bg-red-50"
              title="Remove"
            >
              Remove
            </button>
          </div>
        </div>
      </div>

      {!!node.children?.length && (
        <HierarchyRows
          nodes={node.children}
          depth={depth + 1}
          onChange={onChange}
          onAddChild={onAddChild}
          onRemove={onRemove}
        />
      )}
    </div>
  ));
}

function LocationTreeView({ nodes, depth = 0 }) {
  return (
    <div className="space-y-2">
      {nodes.map((node) => (
        <div key={`${node.code}-${node.name}-${depth}`}>
          <div
            className="flex items-center gap-2 rounded-md bg-surface-soft border border-line px-3 py-2"
            style={{ marginLeft: `${depth * 18}px`, opacity: node.isActive ? 1 : 0.55 }}
          >
            <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              {node.type || "location"}
            </span>
            <span className="text-sm font-medium text-ink">{node.name}</span>
            {node.code && <span className="text-xs text-ink-soft">({node.code})</span>}
          </div>

          {!!node.children?.length && <LocationTreeView nodes={node.children} depth={depth + 1} />}
        </div>
      ))}
    </div>
  );
}

export default function LocationSettingsPage() {
  const { session } = useAuth();
  const token = session?.token;

  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const [selectedWarehouseId, setSelectedWarehouseId] = useState("");
  const [hierarchyNodes, setHierarchyNodes] = useState([]);
  const [savingHierarchy, setSavingHierarchy] = useState(false);

  const selectedWarehouse = useMemo(
    () => warehouses.find((w) => w._id === selectedWarehouseId) || null,
    [selectedWarehouseId, warehouses]
  );

  const currentTree = useMemo(
    () => buildTreeFromLocations(selectedWarehouse?.locations || []),
    [selectedWarehouse]
  );

  const rootLocationsCount = useMemo(
    () => (selectedWarehouse?.locations || []).filter((loc) => !loc.parentCode).length,
    [selectedWarehouse]
  );

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

  const addRootNode = () => {
    setHierarchyNodes((prev) => [...prev, createLocationNode()]);
  };

  const applyNodeChange = (nodeId, field, value) => {
    setHierarchyNodes((prev) =>
      updateNodeById(prev, nodeId, (node) => ({
        ...node,
        [field]: value
      }))
    );
  };

  const addChildNode = (nodeId) => {
    setHierarchyNodes((prev) => addChildNodeById(prev, nodeId));
  };

  const removeNode = (nodeId) => {
    setHierarchyNodes((prev) => removeNodeById(prev, nodeId));
  };

  const handleSaveHierarchy = async (e) => {
    e.preventDefault();

    if (!selectedWarehouseId) {
      setFlash("error", "Select a warehouse first.");
      return;
    }

    if (!hierarchyNodes.length) {
      setFlash("error", "Add at least one location node.");
      return;
    }

    const newLocations = flattenHierarchy(hierarchyNodes);
    const missing = newLocations.find((loc) => !loc.name || !loc.code);
    if (missing) {
      setFlash("error", "Each node needs both Name and Code.");
      return;
    }

    const existingLocations = selectedWarehouse?.locations || [];
    const existingCodeSet = new Set(existingLocations.map((loc) => String(loc.code || "").toLowerCase()));
    const newCodeSet = new Set();

    for (const loc of newLocations) {
      const key = loc.code.toLowerCase();
      if (newCodeSet.has(key)) {
        setFlash("error", `Duplicate code in new hierarchy: ${loc.code}`);
        return;
      }
      if (existingCodeSet.has(key)) {
        setFlash("error", `Code already exists in warehouse: ${loc.code}`);
        return;
      }
      newCodeSet.add(key);
    }

    setSavingHierarchy(true);
    try {
      const mergedLocations = [...existingLocations, ...newLocations];
      const updatedWarehouse = await updateWarehouse(token, selectedWarehouseId, {
        locations: mergedLocations
      });

      setWarehouses((prev) => prev.map((w) => (w._id === updatedWarehouse._id ? updatedWarehouse : w)));
      setHierarchyNodes([]);
      setFlash("success", "Hierarchy locations added.");
    } catch (err) {
      setFlash("error", err.message || "Failed to save hierarchy.");
    } finally {
      setSavingHierarchy(false);
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
    if (!window.confirm(`Delete location "${location.name}" and its child locations?`)) return;
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
          <h1 style={{ margin: 0, fontSize: "24px", color: "#111827", fontWeight: 700 }}>Settings · Locations</h1>
          <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: "14px" }}>
            Dynamic hierarchy builder for unlimited nested locations.
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
          <span className="admin-kpi-label">Selected Warehouse</span>
          <strong className="admin-kpi-value">{selectedWarehouse?.code || "-"}</strong>
        </article>
        <article className="admin-kpi-card">
          <span className="admin-kpi-label">Locations</span>
          <strong className="admin-kpi-value">{selectedWarehouse?.locations?.length || 0}</strong>
        </article>
        <article className="admin-kpi-card">
          <span className="admin-kpi-label">Root Nodes</span>
          <strong className="admin-kpi-value">{rootLocationsCount}</strong>
        </article>
      </section>

      <section className="dashboard-card" style={{ padding: "18px", marginBottom: "16px" }}>
        <h2 style={{ margin: "0 0 14px", fontSize: "18px", color: "#111827" }}>Add Location Hierarchy</h2>
        <form className="form" onSubmit={handleSaveHierarchy}>
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

          <div className="rounded-lg border border-line p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-ink">Hierarchy Nodes</p>
                <p className="text-xs text-ink-soft">Add any number of levels: Zone -&gt; Rack -&gt; Bin -&gt; Shelf...</p>
              </div>
              <button
                type="button"
                onClick={addRootNode}
                className="px-3 py-1.5 border border-line rounded text-sm hover:bg-surface-soft"
              >
                + Add Root
              </button>
            </div>

            {!hierarchyNodes.length ? (
              <div className="text-sm text-ink-soft border border-dashed border-line rounded p-3">
                Start by adding a root node. Then add children under it.
              </div>
            ) : (
              <HierarchyRows
                nodes={hierarchyNodes}
                depth={0}
                onChange={applyNodeChange}
                onAddChild={addChildNode}
                onRemove={removeNode}
              />
            )}

            <p className="text-xs text-ink-soft">Current nodes: {countNodes(hierarchyNodes)}</p>
          </div>

          <button className="button" type="submit" disabled={savingHierarchy || !selectedWarehouseId}>
            <Plus size={16} />
            <span style={{ marginLeft: "6px" }}>{savingHierarchy ? "Saving..." : "Save Hierarchy"}</span>
          </button>
        </form>
      </section>

      <section className="dashboard-card" style={{ padding: "18px", marginBottom: "16px" }}>
        <h2 style={{ margin: "0 0 12px", fontSize: "18px", color: "#111827", display: "flex", alignItems: "center", gap: "8px" }}>
          <MapPin size={18} /> Current Location Tree
        </h2>
        {loading ? (
          <p className="muted">Loading warehouses...</p>
        ) : !selectedWarehouse ? (
          <p className="muted">Select a warehouse to view hierarchy.</p>
        ) : !selectedWarehouse.locations?.length ? (
          <p className="muted">No locations found for {selectedWarehouse.name}.</p>
        ) : (
          <LocationTreeView nodes={currentTree} />
        )}
      </section>

      <section className="dashboard-card" style={{ padding: "18px" }}>
        <h2 style={{ margin: "0 0 12px", fontSize: "18px", color: "#111827" }}>Locations Table</h2>
        {loading ? (
          <p className="muted">Loading warehouses...</p>
        ) : !selectedWarehouse ? (
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
                  <th>Parent</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {selectedWarehouse.locations.map((loc) => (
                  <tr key={loc._id}>
                    <td className="user-primary">{loc.name}</td>
                    <td className="user-login-id">{loc.code}</td>
                    <td>{loc.type || "location"}</td>
                    <td>{loc.parentCode || "-"}</td>
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
