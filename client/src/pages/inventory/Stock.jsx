import { useMemo, useState } from "react";
import { Check, Pencil, Search, X } from "lucide-react";
import { useInventoryOps } from "../../context/InventoryOpsContext.jsx";

export default function Stock() {
  const { stock, updateStockQuantity } = useInventoryOps();
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [draftQty, setDraftQty] = useState("");
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return stock;

    return stock.filter((item) =>
      [item.product, item.sku].join(" ").toLowerCase().includes(q)
    );
  }, [stock, search]);

  const startEdit = (item) => {
    setEditingId(item.id);
    setDraftQty(String(item.onHand));
    setError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraftQty("");
    setError("");
  };

  const saveEdit = (item) => {
    const result = updateStockQuantity({ productId: item.id, onHand: draftQty });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    cancelEdit();
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-heading font-bold text-ink">Stock</h1>
        <p className="mt-1 text-sm text-ink-soft">View and update current warehouse stock quantities.</p>
      </div>

      <div className="rounded-xl border border-line bg-surface p-4" style={{ boxShadow: "var(--shadow-md)" }}>
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product or SKU"
            className="w-full rounded-lg border border-line bg-surface pl-9 pr-3 py-2 text-sm text-ink outline-none transition-colors focus:border-blue-500"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      )}

      <div className="rounded-xl border border-line bg-surface" style={{ boxShadow: "var(--shadow-md)" }}>
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-surface-soft text-ink-soft">
                <th className="px-4 py-3 text-left font-semibold">Product</th>
                <th className="px-4 py-3 text-left font-semibold">SKU</th>
                <th className="px-4 py-3 text-right font-semibold">Per Unit Cost</th>
                <th className="px-4 py-3 text-right font-semibold">On Hand</th>
                <th className="px-4 py-3 text-right font-semibold">Free To Use</th>
                <th className="px-4 py-3 text-center font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const freeToUse = item.onHand - (item.reserved || 0);
                const isEditing = editingId === item.id;
                return (
                  <tr key={item.id} className="border-b border-line last:border-0 hover:bg-surface-soft/60">
                    <td className="px-4 py-3 font-medium text-ink">{item.product}</td>
                    <td className="px-4 py-3 font-mono text-xs text-ink-soft">{item.sku}</td>
                    <td className="px-4 py-3 text-right text-ink">Rs {item.unitCost.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      {isEditing ? (
                        <input
                          type="number"
                          min={0}
                          value={draftQty}
                          onChange={(e) => setDraftQty(e.target.value)}
                          className="w-24 rounded-md border border-line bg-surface px-2 py-1 text-right text-sm text-ink"
                        />
                      ) : (
                        <span className="font-semibold text-ink">{item.onHand}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-ink">{freeToUse}</td>
                    <td className="px-4 py-3 text-center">
                      {isEditing ? (
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => saveEdit(item)}
                            className="rounded p-1 text-ink-soft transition-colors hover:text-emerald-700"
                            title="Save"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="rounded p-1 text-ink-soft transition-colors hover:text-rose-700"
                            title="Cancel"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(item)}
                          className="inline-flex items-center gap-1 rounded-md border border-line px-2 py-1 text-xs font-medium text-ink transition-colors hover:bg-surface-soft"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Update
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-ink-soft">
                    No stock rows found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
