import { useMemo, useState } from "react";
import { ArrowLeft, Columns3, List, Plus, Search, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useInventoryOps } from "../../context/InventoryOpsContext.jsx";

function StatusPill({ status }) {
  const tone = {
    ready: "bg-emerald-100 text-emerald-800 border-emerald-200",
    waiting: "bg-amber-100 text-amber-800 border-amber-200",
    late: "bg-rose-100 text-rose-800 border-rose-200",
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${tone[status] || tone.waiting}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function ReceiptFormModal({ isOpen, onClose }) {
  const { products, warehouses, stock, createReceipt, getNextReference } = useInventoryOps();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    productId: "",
    quantity: "",
    from: "",
    warehouseId: "",
    contact: "",
    scheduleDate: new Date().toISOString().slice(0, 10),
    status: "ready",
  });

  if (!isOpen) return null;

  const selectedStock = stock.find((item) => item.id === form.productId);
  const qty = Number(form.quantity || 0);
  const warehouseEntry = selectedStock?.warehouses?.find((w) => w.warehouseId === form.warehouseId);
  const currentWhOnHand = warehouseEntry?.onHand ?? 0;
  const afterOnHand = currentWhOnHand + (Number.isNaN(qty) ? 0 : qty);
  const nextReference = getNextReference("IN");

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const result = await createReceipt({ ...form });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError("");
    setForm({
      productId: "",
      quantity: "",
      from: "",
      warehouseId: "",
      contact: "",
      scheduleDate: new Date().toISOString().slice(0, 10),
      status: "ready",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-xl border border-line bg-surface p-5" style={{ boxShadow: "var(--shadow-lg)" }}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-heading font-bold text-ink">New Receipt</h2>
            <p className="text-xs text-ink-soft">Auto reference: {nextReference}</p>
          </div>
          <button onClick={onClose} className="rounded p-1 text-ink-soft hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Product</label>
              <select
                value={form.productId}
                onChange={(e) => setForm((prev) => ({ ...prev, productId: e.target.value }))}
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink"
                required
              >
                <option value="">Select product</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Quantity In</label>
              <input
                type="number"
                min={1}
                value={form.quantity}
                onChange={(e) => setForm((prev) => ({ ...prev, quantity: e.target.value }))}
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-ink">From (Supplier)</label>
              <input
                type="text"
                value={form.from}
                onChange={(e) => setForm((prev) => ({ ...prev, from: e.target.value }))}
                placeholder="e.g. Vendor / Supplier name"
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-ink">To (Warehouse)</label>
              <select
                value={form.warehouseId}
                onChange={(e) => setForm((prev) => ({ ...prev, warehouseId: e.target.value }))}
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink"
                required
              >
                <option value="">Select warehouse</option>
                {warehouses.map((wh) => {
                  const whEntry = selectedStock?.warehouses?.find((w) => w.warehouseId === wh._id.toString());
                  const currentQty = whEntry?.onHand ?? 0;
                  const suffix = form.productId ? ` — ${currentQty} on hand` : "";
                  return (
                    <option key={wh._id} value={wh._id}>
                      {wh.name} ({wh.code}){suffix}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Contact</label>
              <input
                type="text"
                value={form.contact}
                onChange={(e) => setForm((prev) => ({ ...prev, contact: e.target.value }))}
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Schedule Date</label>
              <input
                type="date"
                value={form.scheduleDate}
                onChange={(e) => setForm((prev) => ({ ...prev, scheduleDate: e.target.value }))}
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink"
                required
              />
            </div>
          </div>

          {selectedStock && selectedStock.warehouses.length > 0 && (
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
              <div className="mb-2 text-xs font-semibold text-blue-800">Stock by Warehouse — {selectedStock.product}</div>
              <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
                {selectedStock.warehouses.map((wh) => (
                  <div
                    key={wh.warehouseId}
                    className={`flex items-center justify-between rounded px-2 py-1.5 text-xs ${
                      wh.warehouseId === form.warehouseId
                        ? "bg-blue-600 text-white font-semibold"
                        : "border border-blue-100 bg-white text-ink"
                    }`}
                  >
                    <span className="truncate">{wh.warehouseName}</span>
                    <span className="ml-2 shrink-0 font-semibold">{wh.onHand}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm">
            <div className="font-semibold text-emerald-900">Stock Impact Preview</div>
            <div className="mt-1 text-emerald-800">
              {form.warehouseId
                ? <>Warehouse On Hand: {currentWhOnHand} | Receipt: +{Number.isNaN(qty) ? 0 : qty} | After Save: {afterOnHand}</>
                : <>Select a warehouse to see current stock at that location</>}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-line px-3 py-2 text-sm text-ink hover:bg-surface-soft">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save Receipt"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Receipts() {
  const { receipts } = useInventoryOps();
  const [search, setSearch] = useState("");
  const [view, setView] = useState("list");
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return receipts;

    return receipts.filter((receipt) =>
      [receipt.reference, receipt.contact, receipt.from, receipt.to, receipt.productName]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [receipts, search]);

  const grouped = useMemo(() => {
    return {
      ready: filtered.filter((item) => item.status === "ready"),
      waiting: filtered.filter((item) => item.status === "waiting"),
      late: filtered.filter((item) => item.status === "late"),
    };
  }, [filtered]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-ink-soft">
            <Link to="/inventory/operations" className="inline-flex items-center gap-1 hover:text-ink">
              <ArrowLeft className="h-4 w-4" />
              Operations
            </Link>
          </div>
          <h1 className="text-2xl font-heading font-bold text-ink">Receipts</h1>
          <p className="text-sm text-ink-soft">Incoming stock documents. Receipts add quantity to warehouse stock.</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          New
        </button>
      </div>

      <div className="rounded-xl border border-line bg-surface p-4" style={{ boxShadow: "var(--shadow-md)" }}>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[240px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by reference or contact"
              className="w-full rounded-lg border border-line bg-surface pl-9 pr-3 py-2 text-sm text-ink outline-none transition-colors focus:border-blue-500"
            />
          </div>

          <div className="inline-flex items-center rounded-lg border border-line bg-surface-soft p-1">
            <button
              onClick={() => setView("list")}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                view === "list" ? "bg-white text-ink shadow-sm" : "text-ink-soft hover:text-ink"
              }`}
            >
              <List className="h-4 w-4" />
              List
            </button>
            <button
              onClick={() => setView("kanban")}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                view === "kanban" ? "bg-white text-ink shadow-sm" : "text-ink-soft hover:text-ink"
              }`}
            >
              <Columns3 className="h-4 w-4" />
              Kanban
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-line bg-surface" style={{ boxShadow: "var(--shadow-md)" }}>
        {view === "list" ? (
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-surface-soft text-ink-soft">
                  <th className="px-4 py-3 text-left font-semibold">Reference</th>
                  <th className="px-4 py-3 text-left font-semibold">From</th>
                  <th className="px-4 py-3 text-left font-semibold">To</th>
                  <th className="px-4 py-3 text-left font-semibold">Contact</th>
                  <th className="px-4 py-3 text-left font-semibold">Product</th>
                  <th className="px-4 py-3 text-right font-semibold">Qty In</th>
                  <th className="px-4 py-3 text-left font-semibold">Schedule Date</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((receipt) => (
                  <tr key={receipt.id} className="border-b border-line last:border-0 hover:bg-surface-soft/60">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-ink">{receipt.reference}</td>
                    <td className="px-4 py-3 text-ink">{receipt.from}</td>
                    <td className="px-4 py-3 text-ink">{receipt.to}</td>
                    <td className="px-4 py-3 text-ink">{receipt.contact}</td>
                    <td className="px-4 py-3 text-ink">{receipt.productName}</td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-700">+{receipt.quantity}</td>
                    <td className="px-4 py-3 text-ink-soft">{receipt.scheduleDate}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={receipt.status} />
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-ink-soft">
                      No receipts found for this search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-3">
            {[
              { key: "ready", label: "Ready" },
              { key: "waiting", label: "Waiting" },
              { key: "late", label: "Late" },
            ].map((column) => (
              <div key={column.key} className="rounded-lg border border-line bg-surface-soft p-3">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-ink">{column.label}</h3>
                  <span className="text-xs text-ink-soft">{grouped[column.key].length}</span>
                </div>
                <div className="space-y-2">
                  {grouped[column.key].map((receipt) => (
                    <div key={receipt.id} className="rounded-lg border border-line bg-white p-3">
                      <div className="font-mono text-xs font-semibold text-ink">{receipt.reference}</div>
                      <div className="mt-1 text-sm text-ink">{receipt.contact}</div>
                      <div className="mt-1 text-xs text-ink-soft">{receipt.productName} x {receipt.quantity}</div>
                    </div>
                  ))}
                  {grouped[column.key].length === 0 && (
                    <div className="rounded-lg border border-dashed border-line p-3 text-xs text-ink-soft">No receipts</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Memory Tip</div>
          <div className="mt-1 text-sm text-emerald-900">Receipts = Stock IN = + Quantity</div>
        </div>
        <div className="rounded-xl border border-line bg-surface p-4 lg:col-span-2">
          <div className="text-sm text-ink-soft">Reference format</div>
          <div className="mt-1 font-mono text-sm font-semibold text-ink">WH/IN/0001</div>
          <p className="mt-2 text-xs text-ink-soft">Pattern: &lt;Warehouse&gt;/&lt;Operation&gt;/&lt;ID&gt;. Operation for receipts is IN.</p>
        </div>
      </div>

      <ReceiptFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
