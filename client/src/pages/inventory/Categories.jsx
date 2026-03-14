import { useEffect, useMemo, useState } from "react";
import { Plus, Edit, Trash2, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from "../../services/categoriesApi.js";
import { listProducts } from "../../services/productsApi.js";

function CategoryCard({ category, onEdit, onDelete }) {
  return (
    <div className="bg-surface border border-line rounded-lg p-6 hover:shadow-md transition-shadow" style={{ boxShadow: "var(--shadow-md)" }}>
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
            onClick={() => onDelete(category._id)}
            className="p-2 text-ink-soft hover:text-red-600 transition-colors hover:bg-surface-soft rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-line">
        <div className="flex justify-between items-center">
          <span className="text-xs text-ink-soft">Created</span>
          <span className="text-xs font-medium text-ink">
            {new Date(category.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}

function CategoryModal({ isOpen, onClose, onSave, category = null, submitting = false }) {
  const [name, setName] = useState("");

  useEffect(() => {
    setName(category?.name || "");
  }, [category, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-line rounded-lg max-w-md w-full p-6" style={{ boxShadow: "var(--shadow-lg)" }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-heading font-bold text-ink">{category ? "Edit Category" : "Add Category"}</h2>
          <button onClick={onClose} className="text-ink-soft hover:text-ink" disabled={submitting}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Category Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-line rounded-lg bg-surface-soft text-ink text-sm"
              required
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
              {submitting ? "Saving..." : category ? "Save Changes" : "Add Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Categories() {
  const { session } = useAuth();
  const token = session?.token;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const showFlash = (type, text) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 2800);
  };

  const loadData = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);
      const [categoriesData, productsData] = await Promise.all([
        listCategories(token),
        listProducts(token)
      ]);
      setCategories(categoriesData);
      setProducts(productsData);
    } catch (err) {
      setError(err.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const productCountByCategory = useMemo(() => {
    const countMap = new Map();
    products.forEach((product) => {
      if (!product.categoryId) return;
      countMap.set(product.categoryId, (countMap.get(product.categoryId) || 0) + 1);
    });
    return countMap;
  }, [products]);

  const categoriesWithCount = useMemo(
    () =>
      categories.map((category) => ({
        ...category,
        productCount: productCountByCategory.get(category._id) || 0
      })),
    [categories, productCountByCategory]
  );

  const handleSaveCategory = async ({ name }) => {
    const payload = { name: name.trim() };

    if (!payload.name) {
      showFlash("error", "Category name is required.");
      return;
    }

    setSaving(true);
    try {
      if (editingCategory) {
        const updated = await updateCategory(token, editingCategory._id, payload);
        setCategories((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
        showFlash("success", "Category updated.");
      } else {
        const created = await createCategory(token, payload);
        setCategories((prev) => [created, ...prev]);
        showFlash("success", "Category created.");
      }
      setModalOpen(false);
      setEditingCategory(null);
    } catch (err) {
      showFlash("error", err.message || "Failed to save category.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    const category = categories.find((c) => c._id === id);
    if (!category) return;

    if (!window.confirm(`Delete category "${category.name}"?`)) return;

    try {
      await deleteCategory(token, id);
      setCategories((prev) => prev.filter((c) => c._id !== id));
      showFlash("success", "Category deleted.");
    } catch (err) {
      showFlash("error", err.message || "Failed to delete category.");
    }
  };

  return (
    <div className="p-8">
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

      {loading && <p className="text-sm text-ink-soft mb-5">Loading categories...</p>}

      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoriesWithCount.map((category) => (
            <CategoryCard
              key={category._id}
              category={category}
              onEdit={(cat) => {
                setEditingCategory(cat);
                setModalOpen(true);
              }}
              onDelete={handleDeleteCategory}
            />
          ))}
        </div>
      )}

      {!loading && categories.length === 0 && (
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
        onSave={handleSaveCategory}
        category={editingCategory}
        submitting={saving}
      />
    </div>
  );
}
