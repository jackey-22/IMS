import { useMemo, useState } from "react";
import { ArrowLeft, PackageMinus, Plus, Search, X } from "lucide-react";
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

function DeliveryFormModal({ isOpen, onClose }) {
  const { products, warehouses, stock, createDelivery, getNextReference } = useInventoryOps();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    productId: "",
    quantity: "",
    warehouseId: "",
    to: "",
    contact: "",
    scheduleDate: new Date().toISOString().slice(0, 10),
    status: "ready",
  });

  if (!isOpen) return null;

  const selectedStock = stock.find((item) => item.id === form.productId);
  const qty = Number(form.quantity || 0);
  const warehouseStock = selectedStock?.warehouses?.find((w) => w.warehouseId === form.warehouseId);
  const whOnHand = warehouseStock?.onHand ?? selectedStock?.onHand ?? 0;
  const whReserved = warehouseStock?.reserved ?? selectedStock?.reserved ?? 0;
  const freeToUse = whOnHand - whReserved;
  const afterOnHand = whOnHand - (Number.isNaN(qty) ? 0 : qty);
  const nextReference = getNextReference("OUT");

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const result = await createDelivery({ ...form });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError("");
    setForm({
      productId: "",
      quantity: "",
      warehouseId: "",
      to: "",
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
            <h2 className="text-lg font-heading font-bold text-ink">New Delivery</h2>
            <p className="text-xs text-ink-soft">Auto reference: {nextReference}</p>
          </div>
          <button onClick={onClose} className="rounded p-1 text-ink-soft hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        )}

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
              <label className="mb-1 block text-sm font-medium text-ink">Quantity Out</label>
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
              <label className="mb-1 block text-sm font-medium text-ink">From (Warehouse)</label>
              <select
                value={form.warehouseId}
                onChange={(e) => setForm((prev) => ({ ...prev, warehouseId: e.target.value }))}
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink"
                required
              >
                <option value="">Select warehouse</option>
                {warehouses.map((wh) => (
                  <option key={wh._id} value={wh._id}>
                    {wh.name} ({wh.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-ink">To (Customer)</label>
              <input
                type="text"
                value={form.to}
                onChange={(e) => setForm((prev) => ({ ...prev, to: e.target.value }))}
                placeholder="e.g. Customer name"
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink"
              />
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

          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm">
            <div className="font-semibold text-rose-900">Stock Impact Preview</div>
            <div className="mt-1 text-rose-800">
              Warehouse On Hand: {whOnHand} | Free To Use: {freeToUse} | Delivery: -{Number.isNaN(qty) ? 0 : qty} | After Save: {afterOnHand}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-line px-3 py-2 text-sm text-ink hover:bg-surface-soft"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Delivery"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Deliveries() {
  const { deliveries } = useInventoryOps();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return deliveries;

    return deliveries.filter((delivery) =>
      [delivery.reference, delivery.contact, delivery.from, delivery.to, delivery.productName]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [deliveries, search]);

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
          <h1 className="text-2xl font-heading font-bold text-ink">Deliveries</h1>
          <p className="text-sm text-ink-soft">Outgoing stock documents. Deliveries remove quantity from warehouse stock.</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          New Delivery
        </button>
      </div>

      <div className="rounded-xl border border-line bg-surface p-4" style={{ boxShadow: "var(--shadow-md)" }}>
        <div className="relative max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by reference or customer"
            className="w-full rounded-lg border border-line bg-surface pl-9 pr-3 py-2 text-sm text-ink outline-none transition-colors focus:border-blue-500"
          />
        </div>
      </div>

      <div className="rounded-xl border border-line bg-surface" style={{ boxShadow: "var(--shadow-md)" }}>
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-surface-soft text-ink-soft">
                <th className="px-4 py-3 text-left font-semibold">Reference</th>
                <th className="px-4 py-3 text-left font-semibold">From</th>
                <th className="px-4 py-3 text-left font-semibold">To</th>
                <th className="px-4 py-3 text-left font-semibold">Contact</th>
                <th className="px-4 py-3 text-left font-semibold">Product</th>
                <th className="px-4 py-3 text-right font-semibold">Qty Out</th>
                <th className="px-4 py-3 text-left font-semibold">Schedule Date</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Stock Effect</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((delivery) => (
                <tr key={String(delivery.id)} className="border-b border-line last:border-0 hover:bg-surface-soft/60">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-ink">{delivery.reference}</td>
                  <td className="px-4 py-3 text-ink">{delivery.from}</td>
                  <td className="px-4 py-3 text-ink">{delivery.to}</td>
                  <td className="px-4 py-3 text-ink">{delivery.contact}</td>
                  <td className="px-4 py-3 text-ink">{delivery.productName}</td>
                  <td className="px-4 py-3 text-right font-semibold text-rose-700">-{delivery.quantity}</td>
                  <td className="px-4 py-3 text-ink-soft">{delivery.scheduleDate}</td>
                  <td className="px-4 py-3">
                    <StatusPill status={delivery.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700">
                      <PackageMinus className="h-3.5 w-3.5" />
                      -{delivery.quantity}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-ink-soft">
                    No deliveries found for this search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-rose-800">Memory Tip</div>
          <div className="mt-1 text-sm text-rose-900">Deliveries = Stock OUT = - Quantity</div>
        </div>
        <div className="rounded-xl border border-line bg-surface p-4 lg:col-span-2">
          <div className="text-sm text-ink-soft">Reference format</div>
          <div className="mt-1 font-mono text-sm font-semibold text-ink">WH/OUT/0001</div>
          <p className="mt-2 text-xs text-ink-soft">Pattern: &lt;Warehouse&gt;/&lt;Operation&gt;/&lt;ID&gt;. Operation for deliveries is OUT.</p>
        </div>
      </div>

      <DeliveryFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
