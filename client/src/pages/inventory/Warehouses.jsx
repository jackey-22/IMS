import { useState } from 'react';
import { Plus, Edit, Trash2, X, ChevronDown, ChevronUp } from 'lucide-react';

// Location Card Component
function LocationCard({ warehouse, onEdit, onDelete, onToggle, isExpanded }) {
  const [expandedLocations, setExpandedLocations] = useState({});

  const toggleLocation = (locationId) => {
    setExpandedLocations(prev => ({
      ...prev,
      [locationId]: !prev[locationId]
    }));
  };

  return (
    <div className="bg-surface border border-line rounded-lg overflow-hidden hover:shadow-md transition-shadow" style={{ boxShadow: 'var(--shadow-sm)' }}>
      <div className="p-6 border-b border-line flex items-center justify-between">
        <div>
          <h3 className="font-heading font-semibold text-ink text-lg">{warehouse.name}</h3>
          <p className="text-sm text-ink-soft mt-1">{warehouse.locations.length} locations</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(warehouse)}
            className="p-2 text-ink-soft hover:text-blue-600 transition-colors hover:bg-surface-soft rounded"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(warehouse.id)}
            className="p-2 text-ink-soft hover:text-red-600 transition-colors hover:bg-surface-soft rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-2">
        {warehouse.locations.map(location => (
          <div key={location.id}>
            <div
              onClick={() => toggleLocation(location.id)}
              className="flex items-center justify-between p-3 bg-surface-soft rounded hover:bg-surface-soft/80 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded">
                  {location.type}
                </span>
                <span className="text-sm font-medium text-ink">{location.name}</span>
              </div>
              {expandedLocations[location.id] ? (
                <ChevronUp className="w-4 h-4 text-ink-soft" />
              ) : (
                <ChevronDown className="w-4 h-4 text-ink-soft" />
              )}
            </div>

            {expandedLocations[location.id] && (
              <div className="ml-4 mt-2 p-3 bg-surface border border-line rounded text-sm text-ink-soft">
                <div className="space-y-1">
                  <p><span className="font-medium text-ink">Location ID:</span> {location.id}</p>
                  <p><span className="font-medium text-ink">Type:</span> {location.type}</p>
                  {location.parentId && <p><span className="font-medium text-ink">Parent:</span> {location.parentId}</p>}
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
function WarehouseModal({ isOpen, onClose, onSave, warehouse = null }) {
  const [formData, setFormData] = useState(warehouse || {
    name: '',
    address: '',
    capacity: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-line rounded-lg max-w-md w-full p-6" style={{ boxShadow: 'var(--shadow-lg)' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-heading font-bold text-ink">{warehouse ? 'Edit Warehouse' : 'Add Warehouse'}</h2>
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
            <label className="block text-sm font-medium text-ink mb-1">Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-line rounded-lg bg-surface-soft text-ink text-sm resize-none"
              rows="2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Storage Capacity (units)</label>
            <input
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              className="w-full px-3 py-2 border border-line rounded-lg bg-surface-soft text-ink text-sm"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-line rounded-lg text-ink hover:bg-surface-soft transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {warehouse ? 'Save Changes' : 'Add Warehouse'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Warehouses() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [warehouses, setWarehouses] = useState([
    {
      id: 1,
      name: 'Main Warehouse',
      address: '123 Industrial Ave, Mumbai',
      capacity: 50000,
      locations: [
        { id: 'z1', name: 'Zone A', type: 'zone' },
        { id: 'r1', name: 'Rack A1', type: 'rack', parentId: 'z1' },
        { id: 'r2', name: 'Rack A2', type: 'rack', parentId: 'z1' },
        { id: 'z2', name: 'Zone B', type: 'zone' },
        { id: 'r3', name: 'Rack B1', type: 'rack', parentId: 'z2' },
      ]
    },
    {
      id: 2,
      name: 'Secondary Depot',
      address: '456 Trade Center, Pune',
      capacity: 25000,
      locations: [
        { id: 'z3', name: 'Storage Area', type: 'zone' },
        { id: 'b1', name: 'Bin S1', type: 'bin', parentId: 'z3' },
      ]
    },
    {
      id: 3,
      name: 'Regional Hub',
      address: '789 Logistics Park, Bangalore',
      capacity: 35000,
      locations: [
        { id: 'z4', name: 'North Section', type: 'zone' },
        { id: 'r4', name: 'Rack N1', type: 'rack', parentId: 'z4' },
      ]
    },
  ]);

  const handleAddWarehouse = (formData) => {
    if (editingWarehouse) {
      setWarehouses(warehouses.map(w => w.id === editingWarehouse.id ? { ...editingWarehouse, ...formData } : w));
      setEditingWarehouse(null);
    } else {
      setWarehouses([...warehouses, { ...formData, id: Math.max(...warehouses.map(w => w.id), 0) + 1, locations: [] }]);
    }
  };

  const handleDeleteWarehouse = (id) => {
    setWarehouses(warehouses.filter(w => w.id !== id));
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-ink">Warehouses</h1>
          <p className="text-ink-soft text-sm mt-1">{warehouses.length} warehouses · {warehouses.reduce((acc, w) => acc + w.locations.length, 0)} locations</p>
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

      {/* Warehouses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {warehouses.map((warehouse) => (
          <LocationCard
            key={warehouse.id}
            warehouse={warehouse}
            onEdit={(w) => {
              setEditingWarehouse(w);
              setModalOpen(true);
            }}
            onDelete={handleDeleteWarehouse}
          />
        ))}
      </div>

      {warehouses.length === 0 && (
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
      />
    </div>
  );
}
