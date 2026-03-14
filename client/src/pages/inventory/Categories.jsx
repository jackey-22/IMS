import { useState } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';

// Category Card Component
function CategoryCard({ category, onEdit, onDelete }) {
  return (
    <div className="bg-surface border border-line rounded-lg p-6 hover:shadow-md transition-shadow" style={{ boxShadow: 'var(--shadow-md)' }}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-heading font-semibold text-ink text-lg">{category.name}</h3>
          <p className="text-sm text-ink-soft mt-1">{category.productCount} products</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(category)}
            className="p-2 text-ink-soft hover:text-blue-600 transition-colors hover:bg-surface-soft rounded"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(category.id)}
            className="p-2 text-ink-soft hover:text-red-600 transition-colors hover:bg-surface-soft rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      {category.description && (
        <p className="text-sm text-ink-soft line-clamp-2">{category.description}</p>
      )}
      <div className="mt-4 pt-4 border-t border-line">
        <div className="flex justify-between items-center">
          <span className="text-xs text-ink-soft">Last updated</span>
          <span className="text-xs font-medium text-ink">{category.lastUpdated}</span>
        </div>
      </div>
    </div>
  );
}

// Category Modal Component
function CategoryModal({ isOpen, onClose, onSave, category = null }) {
  const [formData, setFormData] = useState(category || {
    name: '',
    description: ''
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
          <h2 className="text-xl font-heading font-bold text-ink">{category ? 'Edit Category' : 'Add Category'}</h2>
          <button onClick={onClose} className="text-ink-soft hover:text-ink">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Category Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-line rounded-lg bg-surface-soft text-ink text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-line rounded-lg bg-surface-soft text-ink text-sm resize-none"
              rows="3"
              placeholder="Category description (optional)"
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
              {category ? 'Save Changes' : 'Add Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Categories() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categories, setCategories] = useState([
    { id: 1, name: 'Raw Materials', productCount: 42, description: 'Unprocessed materials used in manufacturing', lastUpdated: '2026-03-10' },
    { id: 2, name: 'Electronics', productCount: 28, description: 'Electronic components and devices', lastUpdated: '2026-03-12' },
    { id: 3, name: 'Tools', productCount: 35, description: 'Hand tools and equipment', lastUpdated: '2026-03-08' },
    { id: 4, name: 'Furniture', productCount: 18, description: 'Office and industrial furniture', lastUpdated: '2026-03-14' },
    { id: 5, name: 'Safety Equipment', productCount: 22, description: 'Personal protective equipment and safety gear', lastUpdated: '2026-03-09' },
    { id: 6, name: 'Packaging', productCount: 15, description: 'Packaging materials and supplies', lastUpdated: '2026-03-07' },
  ]);

  const handleAddCategory = (formData) => {
    if (editingCategory) {
      setCategories(categories.map(c => c.id === editingCategory.id ? { ...formData, id: c.id, lastUpdated: new Date().toISOString().split('T')[0] } : c));
      setEditingCategory(null);
    } else {
      setCategories([...categories, { ...formData, id: Math.max(...categories.map(c => c.id), 0) + 1, productCount: 0, lastUpdated: new Date().toISOString().split('T')[0] }]);
    }
  };

  const handleDeleteCategory = (id) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-ink">Categories</h1>
          <p className="text-ink-soft text-sm mt-1">{categories.length} product categories</p>
        </div>
        <button
          onClick={() => {
            setEditingCategory(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            onEdit={(cat) => {
              setEditingCategory(cat);
              setModalOpen(true);
            }}
            onDelete={handleDeleteCategory}
          />
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-ink-soft mb-4">No categories found</p>
          <button
            onClick={() => {
              setEditingCategory(null);
              setModalOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create First Category
          </button>
        </div>
      )}

      <CategoryModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingCategory(null);
        }}
        onSave={handleAddCategory}
        category={editingCategory}
      />
    </div>
  );
}
