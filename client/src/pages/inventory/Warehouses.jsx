import { useEffect, useMemo, useState } from "react";
import { Plus, Edit, Trash2, X, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  listWarehouses,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse
} from "../../services/warehousesApi.js";

const EMPTY_FORM = {
  name: "",
  code: "",
  address: "",
  locationsTree: []
};

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
  isActive: true,
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
      isActive: node.isActive ?? true,
      parentCode
    });

    flattenHierarchy(node.children || [], code, collector);
  });

  return collector;
};

const buildTreeFromLocations = (locations = []) => {
  if (!locations.length) return [];

  const map = new Map();
  const roots = [];

  locations.forEach((loc) => {
    map.set(loc.code, {
      nodeId: loc._id || makeNodeId(),
      name: loc.name || "",
      code: loc.code || "",
      type: loc.type || "location",
      isActive: loc.isActive ?? true,
      children: [],
      parentCode: loc.parentCode || null
    });
  });

  map.forEach((node) => {
    const parentCode = node.parentCode;
    if (parentCode && map.has(parentCode)) {
      map.get(parentCode).children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
};

const countNodes = (nodes) =>
  nodes.reduce((sum, node) => sum + 1 + countNodes(node.children || []), 0);

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
            style={{ marginLeft: `${depth * 18}px` }}
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

function LocationCard({ warehouse, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  const tree = useMemo(() => buildTreeFromLocations(warehouse.locations || []), [warehouse.locations]);

  return (
    <div className="bg-surface border border-line rounded-lg overflow-hidden hover:shadow-md transition-shadow" style={{ boxShadow: "var(--shadow-sm)" }}>
      <div className="p-6 border-b border-line flex items-center justify-between">
        <div>
          <h3 className="font-heading font-semibold text-ink text-lg">{warehouse.name}</h3>
          <p className="text-sm text-ink-soft mt-1">{warehouse.locations?.length || 0} locations</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(warehouse)}
            className="p-2 text-ink-soft hover:text-blue-600 transition-colors hover:bg-surface-soft rounded"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(warehouse._id)}
            className="p-2 text-ink-soft hover:text-red-600 transition-colors hover:bg-surface-soft rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm text-ink hover:bg-surface-soft"
      >
        <span className="font-medium">Hierarchy</span>
        {expanded ? <ChevronUp className="w-4 h-4 text-ink-soft" /> : <ChevronDown className="w-4 h-4 text-ink-soft" />}
      </button>

      {expanded && (
        <div className="p-4 border-t border-line">
          {!tree.length ? (
            <p className="text-sm text-ink-soft">No hierarchy configured.</p>
          ) : (
            <LocationTreeView nodes={tree} />
          )}
        </div>
      )}
    </div>
  );
}

function WarehouseModal({ isOpen, onClose, onSave, warehouse = null, submitting = false }) {
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    if (!warehouse) {
      setFormData(EMPTY_FORM);
      return;
    }

    setFormData({
      name: warehouse.name || "",
      code: warehouse.code || "",
      address: warehouse.address || "",
      locationsTree: buildTreeFromLocations(warehouse.locations || [])
    });
  }, [warehouse]);

  const applyNodeChange = (nodeId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      locationsTree: updateNodeById(prev.locationsTree, nodeId, (node) => ({
        ...node,
        [field]: value
      }))
    }));
  };

  const addRootNode = () => {
    setFormData((prev) => ({
      ...prev,
      locationsTree: [...prev.locationsTree, createLocationNode()]
    }));
  };

  const addChildNode = (nodeId) => {
    setFormData((prev) => ({
      ...prev,
      locationsTree: addChildNodeById(prev.locationsTree, nodeId)
    }));
  };

  const removeNode = (nodeId) => {
    setFormData((prev) => ({
      ...prev,
      locationsTree: removeNodeById(prev.locationsTree, nodeId)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const flatLocations = flattenHierarchy(formData.locationsTree);
    const missingFields = flatLocations.find((loc) => !loc.name || !loc.code);
    if (missingFields) {
      window.alert("Each hierarchy item must have both Name and Code.");
      return;
    }

    const codeSet = new Set();
    for (const loc of flatLocations) {
      const key = loc.code.toLowerCase();
      if (codeSet.has(key)) {
        window.alert(`Duplicate location code found: ${loc.code}`);
        return;
      }
      codeSet.add(key);
    }

    onSave({
      name: formData.name,
      code: formData.code,
      address: formData.address,
      locations: flatLocations
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-line rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto" style={{ boxShadow: "var(--shadow-lg)" }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-heading font-bold text-ink">{warehouse ? "Edit Warehouse" : "Add Warehouse"}</h2>
          <button onClick={onClose} className="text-ink-soft hover:text-ink">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Warehouse Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-line rounded-lg bg-surface-soft text-ink text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1">Warehouse Code</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 border border-line rounded-lg bg-surface-soft text-ink text-sm"
                placeholder="WH-MAIN"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-line rounded-lg bg-surface-soft text-ink text-sm resize-none"
              rows="2"
            />
          </div>

          <div className="rounded-lg border border-line p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-ink">Location Hierarchy</p>
                <p className="text-xs text-ink-soft">Add any number of zones, racks, bins, or custom levels.</p>
              </div>
              <button
                type="button"
                onClick={addRootNode}
                className="px-3 py-1.5 border border-line rounded text-sm hover:bg-surface-soft"
              >
                + Add Root
              </button>
            </div>

            {!formData.locationsTree.length ? (
              <div className="text-sm text-ink-soft border border-dashed border-line rounded p-3">
                Start by adding a root level node (example: Zone A, Zone B).
              </div>
            ) : (
              <HierarchyRows
                nodes={formData.locationsTree}
                depth={0}
                onChange={applyNodeChange}
                onAddChild={addChildNode}
                onRemove={removeNode}
              />
            )}

            <p className="text-xs text-ink-soft">Current nodes: {countNodes(formData.locationsTree)}</p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-4 py-2 border border-line rounded-lg text-ink hover:bg-surface-soft transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {submitting ? "Saving..." : warehouse ? "Save Changes" : "Add Warehouse"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Warehouses() {
  const { session } = useAuth();
  const token = session?.token;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [saving, setSaving] = useState(false);

  const totalLocations = useMemo(
    () => warehouses.reduce((acc, w) => acc + (w.locations?.length || 0), 0),
    [warehouses]
  );

  const showFlash = (type, text) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 2800);
  };

  const loadWarehouses = async () => {
    if (!token) return;

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
  }, [token]);

  const handleAddWarehouse = async (formData) => {
    const payload = {
      name: formData.name.trim(),
      code: formData.code.trim(),
      address: formData.address.trim(),
      locations: Array.isArray(formData.locations) ? formData.locations : []
    };

    if (!payload.name || !payload.code) {
      showFlash("error", "Warehouse name and code are required.");
      return;
    }

    setSaving(true);
    if (editingWarehouse) {
      try {
        const updated = await updateWarehouse(token, editingWarehouse._id, payload);
        setWarehouses((prev) => prev.map((w) => (w._id === updated._id ? updated : w)));
        showFlash("success", "Warehouse updated.");
        setEditingWarehouse(null);
        setModalOpen(false);
      } catch (err) {
        showFlash("error", err.message || "Failed to update warehouse.");
      } finally {
        setSaving(false);
      }
    } else {
      try {
        const created = await createWarehouse(token, payload);
        setWarehouses((prev) => [created, ...prev]);
        showFlash("success", "Warehouse created.");
        setModalOpen(false);
      } catch (err) {
        showFlash("error", err.message || "Failed to create warehouse.");
      } finally {
        setSaving(false);
      }
    }
  };

  const handleDeleteWarehouse = async (id) => {
    const warehouse = warehouses.find((w) => w._id === id);
    if (!warehouse) return;
    if (!window.confirm(`Delete warehouse "${warehouse.name}" and all its locations?`)) return;

    try {
      await deleteWarehouse(token, id);
      setWarehouses((prev) => prev.filter((w) => w._id !== id));
      showFlash("success", "Warehouse deleted.");
    } catch (err) {
      showFlash("error", err.message || "Failed to delete warehouse.");
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-ink">Warehouses</h1>
          <p className="text-ink-soft text-sm mt-1">
            {warehouses.length} warehouses · {totalLocations} locations
          </p>
        </div>
        <button
          onClick={() => {
            setEditingWarehouse(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Warehouse
        </button>
      </div>

      {feedback && (
        <div
          className={`mb-5 rounded-lg border px-4 py-3 text-sm ${
            feedback.type === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {feedback.text}
        </div>
      )}

      {error && <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {loading && <p className="text-sm text-ink-soft mb-5">Loading warehouses...</p>}

      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {warehouses.map((warehouse) => (
            <LocationCard
              key={warehouse._id}
              warehouse={warehouse}
              onEdit={(w) => {
                setEditingWarehouse(w);
                setModalOpen(true);
              }}
              onDelete={handleDeleteWarehouse}
            />
          ))}
        </div>
      )}

      {!loading && warehouses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-ink-soft mb-4">No warehouses found</p>
          <button
            onClick={() => {
              setEditingWarehouse(null);
              setModalOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create First Warehouse
          </button>
        </div>
      )}

      <WarehouseModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingWarehouse(null);
        }}
        onSave={handleAddWarehouse}
        warehouse={editingWarehouse}
        submitting={saving}
      />
    </div>
  );
}
