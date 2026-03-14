import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Edit, Trash2, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from "../../services/productsApi.js";
import { listCategories } from "../../services/categoriesApi.js";

const EMPTY_FORM = {
  name: "",
  sku: "",
  categoryId: "",
  uom: "pcs",
  initialStock: ""
};

function ProductModal({ isOpen, onClose, onSave, product = null, categories = [], submitting = false }) {
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    if (!product) {
      setFormData(EMPTY_FORM);
      return;
    }

    setFormData({
      name: product.name || "",
      sku: product.sku || "",
      categoryId: product.categoryId || "",
      uom: product.uom || "pcs",
      initialStock:
        product.initialStock === undefined || product.initialStock === null ? "" : String(product.initialStock)
    });
  }, [product, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-line rounded-lg max-w-md w-full p-6" style={{ boxShadow: "var(--shadow-lg)" }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-heading font-bold text-ink">{product ? "Edit Product" : "Add Product"}</h2>
          <button onClick={onClose} className="text-ink-soft hover:text-ink" disabled={submitting}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-line rounded-lg bg-surface-soft text-ink text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">SKU / Code</label>
            <input
              type="text"
              value={formData.sku}
              onChange={(e) => setFormData((prev) => ({ ...prev, sku: e.target.value }))}
              className="w-full px-3 py-2 border border-line rounded-lg bg-surface-soft text-ink text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Category</label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData((prev) => ({ ...prev, categoryId: e.target.value }))}
              className="w-full px-3 py-2 border border-line rounded-lg bg-surface-soft text-ink text-sm"
            >
              <option value="">Uncategorized</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Unit of Measure</label>
              <input
                type="text"
                value={formData.uom}
                onChange={(e) => setFormData((prev) => ({ ...prev, uom: e.target.value }))}
                className="w-full px-3 py-2 border border-line rounded-lg bg-surface-soft text-ink text-sm"
                placeholder="pcs"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Initial Stock (optional)</label>
              <input
                type="number"
                min="0"
                value={formData.initialStock}
                onChange={(e) => setFormData((prev) => ({ ...prev, initialStock: e.target.value }))}
                className="w-full px-3 py-2 border border-line rounded-lg bg-surface-soft text-ink text-sm"
                placeholder="0"
              />
            </div>
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
              {submitting ? "Saving..." : product ? "Save Changes" : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Products() {
  const { session } = useAuth();
  const token = session?.token;

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
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
      const [productsData, categoriesData] = await Promise.all([
        listProducts(token),
        listCategories(token)
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (err) {
      setError(err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const categoryNameById = useMemo(() => {
    const map = new Map();
    categories.forEach((category) => map.set(category._id, category.name));
    return map;
  }, [categories]);

  const filtered = useMemo(
    () =>
      products.filter(
        (product) =>
          product.name?.toLowerCase().includes(search.toLowerCase()) ||
          product.sku?.toLowerCase().includes(search.toLowerCase())
      ),
    [products, search]
  );

  const handleSaveProduct = async (formData) => {
    const payload = {
      name: formData.name.trim(),
      sku: formData.sku.trim(),
      categoryId: formData.categoryId || null,
      uom: formData.uom.trim(),
      initialStock:
        formData.initialStock === "" || formData.initialStock === null
          ? 0
          : Number(formData.initialStock)
    };

    if (!payload.name || !payload.sku || !payload.uom) {
      showFlash("error", "Name, SKU / Code, and Unit of Measure are required.");
      return;
    }

    if (Number.isNaN(payload.initialStock) || payload.initialStock < 0) {
      showFlash("error", "Initial stock must be zero or greater.");
      return;
    }

    setSaving(true);
    try {
      if (editingProduct) {
        const updated = await updateProduct(token, editingProduct._id, payload);
        setProducts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
        showFlash("success", "Product updated.");
      } else {
        const created = await createProduct(token, payload);
        setProducts((prev) => [created, ...prev]);
        showFlash("success", "Product created.");
      }
      setModalOpen(false);
      setEditingProduct(null);
    } catch (err) {
      showFlash("error", err.message || "Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    const product = products.find((p) => p._id === id);
    if (!product) return;

    if (!window.confirm(`Delete product "${product.name}"?`)) return;

    try {
      await deleteProduct(token, id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      showFlash("success", "Product deleted.");
    } catch (err) {
      showFlash("error", err.message || "Failed to delete product.");
    }
  };

  return (
    <div className="p-8">
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

      {loading && <p className="text-sm text-ink-soft mb-5">Loading products...</p>}

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

      {!loading && (
        <div className="bg-surface border border-line rounded-lg overflow-hidden" style={{ boxShadow: "var(--shadow-md)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-surface-soft">
                  <th className="text-left px-6 py-3 font-medium text-ink-soft text-xs uppercase tracking-wider">Name</th>
                  <th className="text-left px-6 py-3 font-medium text-ink-soft text-xs uppercase tracking-wider">SKU / Code</th>
                  <th className="text-left px-6 py-3 font-medium text-ink-soft text-xs uppercase tracking-wider">Category</th>
                  <th className="text-center px-6 py-3 font-medium text-ink-soft text-xs uppercase tracking-wider">UoM</th>
                  <th className="text-right px-6 py-3 font-medium text-ink-soft text-xs uppercase tracking-wider">Initial Stock</th>
                  <th className="text-center px-6 py-3 font-medium text-ink-soft text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr key={product._id} className="border-b border-line hover:bg-surface-soft transition-colors">
                    <td className="px-6 py-3 font-medium text-ink">{product.name}</td>
                    <td className="px-6 py-3 font-mono text-xs font-medium text-ink-soft">{product.sku}</td>
                    <td className="px-6 py-3 text-ink">{categoryNameById.get(product.categoryId) || "Uncategorized"}</td>
                    <td className="px-6 py-3 text-center text-ink">{product.uom}</td>
                    <td className="px-6 py-3 text-right text-ink">{Number(product.initialStock || 0).toLocaleString()}</td>
                    <td className="px-6 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
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
                          onClick={() => handleDeleteProduct(product._id)}
                          title="Delete product"
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
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-ink-soft mb-4">No products found</p>
        </div>
      )}

      <ProductModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        product={editingProduct}
        categories={categories}
        submitting={saving}
      />
    </div>
  );
}
