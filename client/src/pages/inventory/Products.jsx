import { useState } from 'react';
import { Plus, Search, Edit, Trash2, X, Check } from 'lucide-react';

// Status Badge Component
function StatusBadge({ status }) {
  const styles = {
    'in-stock': 'bg-green-100 text-green-800',
    'low-stock': 'bg-yellow-100 text-yellow-800',
    'critical': 'bg-red-100 text-red-800',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || styles['in-stock']}`}>
      {status === 'in-stock' ? 'In Stock' : status === 'low-stock' ? 'Low Stock' : 'Critical'}
    </span>
  );
}

// Modal Component
function ProductModal({ isOpen, onClose, onSave, product = null, isNew = true }) {
  const [formData, setFormData] = useState(product || {
    name: '',
    sku: '',
    category: '',
    uom: 'pcs',
    reorderPoint: '',
    status: 'in-stock'
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
          <h2 className="text-xl font-heading font-bold text-ink">{isNew ? 'Add Product' : 'Edit Product'}</h2>
          <button onClick={onClose} className="text-ink-soft hover:text-ink">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Product Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-line rounded-lg bg-surface-soft text-ink text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">SKU</label>
            <input
              type="text"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              className="w-full px-3 py-2 border border-line rounded-lg bg-surface-soft text-ink text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-line rounded-lg bg-surface-soft text-ink text-sm"
              required
            >
              <option value="">Select Category</option>
              <option value="raw-materials">Raw Materials</option>
              <option value="electronics">Electronics</option>
              <option value="tools">Tools</option>
              <option value="furniture">Furniture</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">UoM</label>
              <select
                value={formData.uom}
                onChange={(e) => setFormData({ ...formData, uom: e.target.value })}
                className="w-full px-3 py-2 border border-line rounded-lg bg-surface-soft text-ink text-sm"
              >
                <option value="pcs">Pieces</option>
                <option value="kg">Kg</option>
                <option value="meters">Meters</option>
                <option value="sheets">Sheets</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1">Reorder Point</label>
              <input
                type="number"
                value={formData.reorderPoint}
                onChange={(e) => setFormData({ ...formData, reorderPoint: e.target.value })}
                className="w-full px-3 py-2 border border-line rounded-lg bg-surface-soft text-ink text-sm"
                required
              />
            </div>
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
              {isNew ? 'Add Product' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Products() {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingStockId, setEditingStockId] = useState(null);
  const [draftStock, setDraftStock] = useState('');

  // Sample products data
  const [products, setProducts] = useState([
    { id: 1, name: 'Steel Rods (10mm)', sku: 'SR-2024-X', category: 'Raw Materials', uom: 'pcs', reorderPoint: 50, stock: 1240, status: 'in-stock' },
    { id: 2, name: 'Copper Wire (2.5mm)', sku: 'CW-2024-A', category: 'Raw Materials', uom: 'meters', reorderPoint: 100, stock: 3200, status: 'in-stock' },
    { id: 3, name: 'Circuit Board v3', sku: 'CB-2024-V3', category: 'Electronics', uom: 'pcs', reorderPoint: 25, stock: 18, status: 'low-stock' },
    { id: 4, name: 'Industrial Motor 5HP', sku: 'IM-5HP-01', category: 'Electronics', uom: 'pcs', reorderPoint: 5, stock: 12, status: 'in-stock' },
    { id: 5, name: 'Oak Plywood Sheet', sku: 'OP-48-01', category: 'Raw Materials', uom: 'sheets', reorderPoint: 30, stock: 0, status: 'critical' },
    { id: 6, name: 'Hex Bolt M8x40', sku: 'HB-M8-40', category: 'Tools', uom: 'pcs', reorderPoint: 200, stock: 4500, status: 'in-stock' },
  ]);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddProduct = (formData) => {
    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? { ...formData, id: p.id } : p));
      setEditingProduct(null);
    } else {
      setProducts([...products, { ...formData, id: Math.max(...products.map(p => p.id), 0) + 1, stock: 0 }]);
    }
  };

  const handleDeleteProduct = (id) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const startStockEdit = (product) => {
    setEditingStockId(product.id);
    setDraftStock(String(product.stock));
  };

  const cancelStockEdit = () => {
    setEditingStockId(null);
    setDraftStock('');
  };

  const saveStockEdit = (product) => {
    const nextStock = Number(draftStock);
    if (Number.isNaN(nextStock) || nextStock < 0) return;
    setProducts(products.map((p) => (p.id === product.id ? { ...p, stock: nextStock } : p)));
    cancelStockEdit();
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-ink">Products</h1>
          <p className="text-ink-soft text-sm mt-1">{products.length} products in inventory</p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft" />
          <input
            type="text"
            placeholder="Search by name or SKU..."
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
                <th className="text-left px-6 py-3 font-medium text-ink-soft text-xs uppercase tracking-wider">Product</th>
                <th className="text-left px-6 py-3 font-medium text-ink-soft text-xs uppercase tracking-wider">SKU</th>
                <th className="text-left px-6 py-3 font-medium text-ink-soft text-xs uppercase tracking-wider">Category</th>
                <th className="text-center px-6 py-3 font-medium text-ink-soft text-xs uppercase tracking-wider">UoM</th>
                <th className="text-right px-6 py-3 font-medium text-ink-soft text-xs uppercase tracking-wider">Stock</th>
                <th className="text-right px-6 py-3 font-medium text-ink-soft text-xs uppercase tracking-wider">Reorder Point</th>
                <th className="text-left px-6 py-3 font-medium text-ink-soft text-xs uppercase tracking-wider">Status</th>
                <th className="text-center px-6 py-3 font-medium text-ink-soft text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id} className="border-b border-line hover:bg-surface-soft transition-colors">
                  <td className="px-6 py-3 font-medium text-ink">{product.name}</td>
                  <td className="px-6 py-3 font-mono text-xs font-medium text-ink-soft">{product.sku}</td>
                  <td className="px-6 py-3 text-ink">{product.category}</td>
                  <td className="px-6 py-3 text-center text-ink">{product.uom}</td>
                  <td className="px-6 py-3 text-right">
                    {editingStockId === product.id ? (
                      <input
                        type="number"
                        value={draftStock}
                        onChange={(e) => setDraftStock(e.target.value)}
                        className="w-24 px-2 py-1 border border-line rounded-md bg-surface text-ink text-sm text-right"
                      />
                    ) : (
                      <span className="font-medium text-ink">{product.stock.toLocaleString()}</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-right text-ink-soft">{product.reorderPoint}</td>
                  <td className="px-6 py-3">
                    <StatusBadge status={product.status} />
                  </td>
                  <td className="px-6 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {editingStockId === product.id ? (
                        <>
                          <button
                            onClick={() => saveStockEdit(product)}
                            className="p-1 text-ink-soft hover:text-green-600 transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelStockEdit}
                            className="p-1 text-ink-soft hover:text-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => startStockEdit(product)}
                          title="Update stock"
                          className="p-1 text-ink-soft hover:text-blue-600 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setEditingProduct(product);
                          setModalOpen(true);
                        }}
                        title="Edit product"
                        className="p-1 text-ink-soft hover:text-blue-600 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
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

      <ProductModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleAddProduct}
        product={editingProduct}
        isNew={!editingProduct}
      />
    </div>
  );
}
