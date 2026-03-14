import { useState } from 'react';
import { Plus, Search, Edit, Trash2, X, Star } from 'lucide-react';

// Rating Component
function RatingStars({ rating, onRate = null }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onRate && onRate(star)}
          className={`transition-colors ${
            star <= Math.round(rating)
              ? 'text-yellow-400'
              : 'text-gray-300'
          }`}
        >
          <Star className="w-4 h-4 fill-current" />
        </button>
      ))}
    </div>
  );
}

// Supplier Modal Component
function SupplierModal({ isOpen, onClose, onSave, supplier = null }) {
  const [formData, setFormData] = useState(supplier || {
    name: '',
    contact: '',
    email: '',
    phone: '',
    address: '',
    rating: 4
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
          <h2 className="text-xl font-heading font-bold text-ink">{supplier ? 'Edit Supplier' : 'Add Supplier'}</h2>
          <button onClick={onClose} className="text-ink-soft hover:text-ink">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Supplier Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-line rounded-lg bg-surface-soft text-ink text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Contact Person</label>
            <input
              type="text"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              className="w-full px-3 py-2 border border-line rounded-lg bg-surface-soft text-ink text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-line rounded-lg bg-surface-soft text-ink text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-line rounded-lg bg-surface-soft text-ink text-sm"
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
            <label className="block text-sm font-medium text-ink mb-2">Rating</label>
            <RatingStars rating={formData.rating} onRate={(r) => setFormData({ ...formData, rating: r })} />
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
              {supplier ? 'Save Changes' : 'Add Supplier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Suppliers() {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [suppliers, setSuppliers] = useState([
    { id: 1, name: 'Tata Steel', contact: 'Rajesh Kumar', email: 'rajesh@tatasteel.com', phone: '+91-22-1234-5678', address: 'Mumbai, India', rating: 4.8, receipts: 85, lastDelivery: '2026-03-14' },
    { id: 2, name: 'Global Metals', contact: 'Sarah Chen', email: 'sarah@globalmetals.com', phone: '+86-21-9876-5432', address: 'Shanghai, China', rating: 4.5, receipts: 62, lastDelivery: '2026-03-13' },
    { id: 3, name: 'TechParts Inc.', contact: 'Mike Johnson', email: 'mike@techparts.com', phone: '+1-408-555-0123', address: 'San Jose, CA', rating: 4.2, receipts: 45, lastDelivery: '2026-03-12' },
    { id: 4, name: 'WoodCraft Supplies', contact: 'Hans Mueller', email: 'hans@woodcraft.de', phone: '+49-30-1234-5678', address: 'Berlin, Germany', rating: 3.9, receipts: 28, lastDelivery: '2026-03-10' },
  ]);

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.contact.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddSupplier = (formData) => {
    if (editingSupplier) {
      setSuppliers(suppliers.map(s => s.id === editingSupplier.id ? { ...editingSupplier, ...formData } : s));
      setEditingSupplier(null);
    } else {
      setSuppliers([...suppliers, { ...formData, id: Math.max(...suppliers.map(s => s.id), 0) + 1, receipts: 0, lastDelivery: new Date().toISOString().split('T')[0] }]);
    }
  };

  const handleDeleteSupplier = (id) => {
    setSuppliers(suppliers.filter(s => s.id !== id));
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-ink">Suppliers</h1>
          <p className="text-ink-soft text-sm mt-1">{suppliers.length} active suppliers</p>
        </div>
        <button
          onClick={() => {
            setEditingSupplier(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Supplier
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft" />
          <input
            type="text"
            placeholder="Search supplier name or contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-line rounded-lg bg-surface text-ink text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface border border-line rounded-lg overflow-hidden" style={{ boxShadow: 'var(--shadow-md)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-surface-soft">
                <th className="text-left px-6 py-3 font-medium text-ink-soft text-xs uppercase tracking-wider">Supplier</th>
                <th className="text-left px-6 py-3 font-medium text-ink-soft text-xs uppercase tracking-wider">Contact</th>
                <th className="text-left px-6 py-3 font-medium text-ink-soft text-xs uppercase tracking-wider">Email</th>
                <th className="text-left px-6 py-3 font-medium text-ink-soft text-xs uppercase tracking-wider">Phone</th>
                <th className="text-center px-6 py-3 font-medium text-ink-soft text-xs uppercase tracking-wider">Rating</th>
                <th className="text-right px-6 py-3 font-medium text-ink-soft text-xs uppercase tracking-wider">Receipts</th>
                <th className="text-left px-6 py-3 font-medium text-ink-soft text-xs uppercase tracking-wider">Last Delivery</th>
                <th className="text-center px-6 py-3 font-medium text-ink-soft text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((supplier) => (
                <tr key={supplier.id} className="border-b border-line hover:bg-surface-soft transition-colors">
                  <td className="px-6 py-3 font-medium text-ink">{supplier.name}</td>
                  <td className="px-6 py-3 text-ink">{supplier.contact}</td>
                  <td className="px-6 py-3 text-ink-soft text-sm">{supplier.email}</td>
                  <td className="px-6 py-3 text-ink-soft text-sm">{supplier.phone}</td>
                  <td className="px-6 py-3 text-center">
                    <div className="flex justify-center">
                      <RatingStars rating={supplier.rating} />
                    </div>
                  </td>
                  <td className="px-6 py-3 text-right font-medium text-ink">{supplier.receipts}</td>
                  <td className="px-6 py-3 text-ink-soft text-sm">{supplier.lastDelivery}</td>
                  <td className="px-6 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          setEditingSupplier(supplier);
                          setModalOpen(true);
                        }}
                        className="p-1 text-ink-soft hover:text-blue-600 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSupplier(supplier.id)}
                        className="p-1 text-ink-soft hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-ink-soft mb-4">No suppliers found</p>
        </div>
      )}

      <SupplierModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingSupplier(null);
        }}
        onSave={handleAddSupplier}
        supplier={editingSupplier}
      />
    </div>
  );
}
