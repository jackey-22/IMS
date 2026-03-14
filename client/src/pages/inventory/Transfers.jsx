import { useMemo, useState } from "react";
import { ArrowLeft, ArrowLeftRight, Plus, Search, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useInventoryOps } from "../../context/InventoryOpsContext.jsx";

function StatusPill({ status }) {
  const tone = {
    ready: "bg-emerald-100 text-emerald-800 border-emerald-200",
    waiting: "bg-amber-100 text-amber-800 border-amber-200",
    done: "bg-blue-100 text-blue-800 border-blue-200",
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${tone[status] || tone.waiting}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function TransferFormModal({ isOpen, onClose }) {
  const { products, warehouses, stock, createTransfer, getNextReference } = useInventoryOps();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    productId: "",
    quantity: "",
    sourceWarehouseId: "",
    destinationWarehouseId: "",
    sourceLocationId: "",
    destinationLocationId: "",
    scheduleDate: new Date().toISOString().slice(0, 10),
    status: "ready",
  });

  if (!isOpen) return null;

  const selectedStock = stock.find((item) => item.id === form.productId);
  const qty = Number(form.quantity || 0);
  const sourceWarehouseStock = selectedStock?.warehouses?.filter(
    (w) => w.warehouseId === form.sourceWarehouseId
  );
  const selectedLocationStock = sourceWarehouseStock?.find(
    (w) => w.locationId && w.locationId === form.sourceLocationId
  );
  const warehouseLevelStock = sourceWarehouseStock?.find((w) => !w.locationId);
  const sourceOnHand =
    (form.sourceLocationId ? selectedLocationStock?.onHand : warehouseLevelStock?.onHand) ?? 0;
  const sourceReserved =
    (form.sourceLocationId ? selectedLocationStock?.reserved : warehouseLevelStock?.reserved) ?? 0;
  const sourceFree = sourceOnHand - sourceReserved;
  const afterSource = sourceOnHand - (Number.isNaN(qty) ? 0 : qty);
  const nextReference = getNextReference("TRF");

  const sourceWarehouse = warehouses.find((wh) => wh._id === form.sourceWarehouseId);
  const destinationWarehouse = warehouses.find((wh) => wh._id === form.destinationWarehouseId);
  const availableSourceWarehouses = selectedStock?.warehouses
    ? warehouses.filter((wh) =>
        selectedStock.warehouses.some(
          (entry) => entry.warehouseId === wh._id && entry.onHand > 0
        )
      )
    : warehouses;
  const sourceLocations =
    sourceWarehouseStock
      ?.filter((entry) => entry.locationId && entry.onHand > 0)
      .map((entry) => ({
        _id: entry.locationId,
        name: entry.locationName || "",
        code: entry.locationCode || "",
        type: entry.locationType || "",
      })) || [];
  const destinationLocations = destinationWarehouse?.locations || [];

  const submit = async (e) => {
    e.preventDefault();
    if (sourceLocations.length > 0 && !form.sourceLocationId) {
      setError("Select a source location that has stock.");
      return;
    }
    if (destinationLocations.length > 0 && !form.destinationLocationId) {
      setError("Select a destination location.");
      return;
    }
    setSaving(true);
    const result = await createTransfer({ ...form });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError("");
    setForm({
      productId: "",
      quantity: "",
      sourceWarehouseId: "",
      destinationWarehouseId: "",
      sourceLocationId: "",
      destinationLocationId: "",
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
            <h2 className="text-lg font-heading font-bold text-ink">New Internal Transfer</h2>
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
              <label className="mb-1 block text-sm font-medium text-ink">Quantity</label>
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
              <label className="mb-1 block text-sm font-medium text-ink">From Warehouse</label>
              <select
                value={form.sourceWarehouseId}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    sourceWarehouseId: e.target.value,
                    sourceLocationId: "",
                  }))
                }
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink"
                required
              >
                <option value="">Select warehouse</option>
                {availableSourceWarehouses.map((wh) => (
                  <option key={wh._id} value={wh._id}>
                    {wh.name} ({wh.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-ink">To Warehouse</label>
              <select
                value={form.destinationWarehouseId}
                onChange={(e) => setForm((prev) => ({ ...prev, destinationWarehouseId: e.target.value }))}
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
              <label className="mb-1 block text-sm font-medium text-ink">From Location (optional)</label>
              <select
                value={form.sourceLocationId}
                onChange={(e) => setForm((prev) => ({ ...prev, sourceLocationId: e.target.value }))}
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink"
              >
                <option value="">Warehouse level</option>
                {sourceLocations.map((loc) => (
                  <option key={loc._id} value={loc._id}>
                    {loc.name} ({loc.code}) · {loc.type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-ink">To Location (optional)</label>
              <select
                value={form.destinationLocationId}
                onChange={(e) => setForm((prev) => ({ ...prev, destinationLocationId: e.target.value }))}
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink"
              >
                <option value="">Warehouse level</option>
                {destinationLocations.map((loc) => (
                  <option key={loc._id} value={loc._id}>
                    {loc.name} ({loc.code}) · {loc.type}
                  </option>
                ))}
              </select>
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

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm">
            <div className="font-semibold text-blue-900">Stock Impact Preview</div>
            <div className="mt-1 text-blue-800">
              Source On Hand: {sourceOnHand} | Free To Use: {sourceFree} | Transfer: -{Number.isNaN(qty) ? 0 : qty} | After Save: {afterSource}
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
              {saving ? "Saving..." : "Save Transfer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Transfers() {
  const { transfers } = useInventoryOps();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return transfers;

    return transfers.filter((transfer) =>
      [transfer.reference, transfer.contact, transfer.from, transfer.to, transfer.productName]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [transfers, search]);

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
          <h1 className="text-2xl font-heading font-bold text-ink">Internal Transfers</h1>
          <p className="text-sm text-ink-soft">Move stock between warehouses and track transfer status.</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          New Transfer
        </button>
      </div>

      <div className="rounded-xl border border-line bg-surface p-4" style={{ boxShadow: "var(--shadow-md)" }}>
        <div className="relative max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by reference, warehouse, or product"
            className="w-full rounded-lg border border-line bg-surface pl-9 pr-3 py-2 text-sm text-ink outline-none transition-colors focus:border-blue-500"
          />
        </div>
      </div>

      <div className="rounded-xl border border-line bg-surface" style={{ boxShadow: "var(--shadow-md)" }}>
        <div className="overflow-x-auto">
          <table className="min-w-[960px] w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-surface-soft text-ink-soft">
                <th className="px-4 py-3 text-left font-semibold">Reference</th>
                <th className="px-4 py-3 text-left font-semibold">From</th>
                <th className="px-4 py-3 text-left font-semibold">To</th>
                <th className="px-4 py-3 text-left font-semibold">Product</th>
                <th className="px-4 py-3 text-right font-semibold">Qty</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Schedule Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((transfer) => (
                <tr key={transfer.id} className="border-b border-line last:border-0 hover:bg-surface-soft/60">
                  <td className="px-4 py-3 font-mono text-xs text-ink">{transfer.reference}</td>
                  <td className="px-4 py-3 text-ink">{transfer.from}</td>
                  <td className="px-4 py-3 text-ink">{transfer.to}</td>
                  <td className="px-4 py-3 text-ink">{transfer.productName}</td>
                  <td className="px-4 py-3 text-right text-ink">{transfer.quantity}</td>
                  <td className="px-4 py-3">
                    <StatusPill status={transfer.status} />
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{transfer.scheduleDate}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-ink-soft">
                    No transfers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TransferFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
