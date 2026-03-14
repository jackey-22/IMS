import { useEffect, useMemo, useState } from "react";
import { Plus, Edit, Trash2, X, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  listWarehouses,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse
} from "../../services/warehousesApi.js";

// Location Card Component
function LocationCard({ warehouse, onEdit, onDelete }) {
  const [expandedLocations, setExpandedLocations] = useState({});

  const toggleLocation = (locationId) => {
    setExpandedLocations((prev) => ({
      ...prev,
      [locationId]: !prev[locationId]
    }));
  };

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

      <div className="p-4 space-y-2">
        {(warehouse.locations || []).map((location) => (
          <div key={location._id}>
            <div
              onClick={() => toggleLocation(location._id)}
              className="flex items-center justify-between p-3 bg-surface-soft rounded hover:bg-surface-soft/80 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded">
                  {location.type}
                </span>
                <span className="text-sm font-medium text-ink">
                  {location.name}
                  {location.code ? ` (${location.code})` : ""}
                </span>
              </div>
              {expandedLocations[location._id] ? (
                <ChevronUp className="w-4 h-4 text-ink-soft" />
              ) : (
                <ChevronDown className="w-4 h-4 text-ink-soft" />
              )}
            </div>

            {expandedLocations[location._id] && (
              <div className="ml-4 mt-2 p-3 bg-surface border border-line rounded text-sm text-ink-soft">
                <div className="space-y-1">
                  <p><span className="font-medium text-ink">Location ID:</span> {location._id}</p>
                  <p><span className="font-medium text-ink">Type:</span> {location.type}</p>
                  {location.code && <p><span className="font-medium text-ink">Code:</span> {location.code}</p>}
                  <p><span className="font-medium text-ink">Status:</span> {location.isActive ? "Active" : "Inactive"}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Warehouse Modal Component
const EMPTY_FORM = {
  name: "",
  code: "",
  address: ""
};

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
      address: warehouse.address || ""
    });
  }, [warehouse]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-line rounded-lg max-w-md w-full p-6" style={{ boxShadow: "var(--shadow-lg)" }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-heading font-bold text-ink">{warehouse ? "Edit Warehouse" : "Add Warehouse"}</h2>
          <button onClick={onClose} className="text-ink-soft hover:text-ink">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-line rounded-lg bg-surface-soft text-ink text-sm resize-none"
              rows="2"
            />
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
      address: formData.address.trim()
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
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-ink">Warehouses</h1>
          <p className="text-ink-soft text-sm mt-1">{warehouses.length} warehouses · {totalLocations} locations</p>
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

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && <p className="text-sm text-ink-soft mb-5">Loading warehouses...</p>}

      {/* Warehouses Grid */}
      {!loading && <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
      </div>}

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
