import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Download, RefreshCw, Search, ChevronDown } from "lucide-react";
import { listStockLedger } from "../../services/operationsApi.js";
import { useAuth } from "../../context/AuthContext.jsx";

function StatusBadge({ status }) {
  const styles = {
    receipt:    "bg-emerald-100 text-emerald-800 border border-emerald-200",
    delivery:   "bg-rose-100    text-rose-800    border border-rose-200",
    transfer:   "bg-blue-100    text-blue-800    border border-blue-200",
    adjustment: "bg-purple-100  text-purple-800  border border-purple-200",
  };
  const label = (status || "receipt");
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[label] || styles.receipt}`}>
      {label.charAt(0).toUpperCase() + label.slice(1)}
    </span>
  );
}

/* Single stat card */
function StatCard({ label, value, color = "text-ink" }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4" style={{ boxShadow: "var(--shadow-md)" }}>
      <p className="text-xs font-medium uppercase tracking-wider text-ink-soft">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

/* Responsive filter select */
function FilterSelect({ value, onChange, children }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="w-full appearance-none rounded-lg border border-line bg-surface py-2 pl-3 pr-9 text-sm text-ink outline-none transition-colors focus:border-blue-500"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
    </div>
  );
}

export default function StockLedger() {
  const { session } = useAuth();
  const token = session?.token;
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filterWarehouse, setFilterWarehouse] = useState("all");
  const [filterLocation, setFilterLocation] = useState("all");
  const [filterProduct, setFilterProduct] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchLedger = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const data = await listStockLedger(token);
      setLedgerEntries(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load stock ledger.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLedger(); }, [token]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ledgerEntries.filter((entry) => {
      const matchesSearch = !q || [entry.product, entry.sku, entry.documentNo].filter(Boolean).join(" ").toLowerCase().includes(q);
      const matchesType = filterType === "all" || entry.type === filterType;
      const matchesWarehouse = filterWarehouse === "all" || entry.warehouseId === filterWarehouse;
      const matchesLocation = filterLocation === "all" || entry.locationId === filterLocation;
      const matchesProduct = filterProduct === "all" || entry.productId === filterProduct;
      const matchesFrom = !dateFrom || (entry.date && entry.date >= dateFrom);
      const matchesTo = !dateTo || (entry.date && entry.date <= dateTo);
      return matchesSearch && matchesType && matchesWarehouse && matchesLocation && matchesProduct && matchesFrom && matchesTo;
    });
  }, [ledgerEntries, search, filterType, filterWarehouse, filterLocation, filterProduct, dateFrom, dateTo]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) =>
      sortOrder === "desc"
        ? new Date(b.date || 0) - new Date(a.date || 0)
        : new Date(a.date || 0) - new Date(b.date || 0)
    );
  }, [filtered, sortOrder]);

  const totals = useMemo(() => {
    const totalIn  = filtered.reduce((acc, e) => acc + (Number(e.qtyIn)  || 0), 0);
    const totalOut = filtered.reduce((acc, e) => acc + (Number(e.qtyOut) || 0), 0);
    return { entries: filtered.length, totalIn, totalOut, net: totalIn - totalOut };
  }, [filtered]);

  const warehouseOptions = useMemo(() => {
    const map = new Map();
    ledgerEntries.forEach((e) => { if (e.warehouseId && e.warehouseName && !map.has(e.warehouseId)) map.set(e.warehouseId, e.warehouseName); });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [ledgerEntries]);

  const locationOptions = useMemo(() => {
    const map = new Map();
    ledgerEntries.forEach((e) => {
      if (!e.locationId || !e.locationName) return;
      if (filterWarehouse !== "all" && e.warehouseId !== filterWarehouse) return;
      if (!map.has(e.locationId)) map.set(e.locationId, e.locationName);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [ledgerEntries, filterWarehouse]);

  const productOptions = useMemo(() => {
    const map = new Map();
    ledgerEntries.forEach((e) => {
      if (e.productId && e.product && !map.has(e.productId))
        map.set(e.productId, `${e.product}${e.sku ? ` (${e.sku})` : ""}`);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [ledgerEntries]);

  const handleExport = () => {
    if (sorted.length === 0) return;
    const csv = [
      ["Date", "Document", "Type", "Product", "SKU", "Qty In", "Qty Out", "Balance", "Warehouse"],
      ...sorted.map((e) => [e.date, e.documentNo, e.type, e.product, e.sku, e.qtyIn, e.qtyOut, e.balance, e.warehouse]),
    ].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stock-ledger-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-5">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold text-ink">Stock Ledger</h1>
          <p className="mt-0.5 text-sm text-ink-soft">Complete audit trail of all stock movements</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchLedger}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface-soft disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* ── Filters ────────────────────────────────────────── */}
      <div className="rounded-xl border border-line bg-surface p-4" style={{ boxShadow: "var(--shadow-md)" }}>
        {/* Search */}
        <div className="relative mb-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
          <input
            type="text"
            placeholder="Search product, SKU, or document..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-line bg-surface py-2 pl-10 pr-3 text-sm text-ink outline-none transition-colors focus:border-blue-500"
          />
        </div>

        {/* Dropdowns — 2 cols on mobile, 4 on lg */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <FilterSelect value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">All Types</option>
            <option value="receipt">Receipts</option>
            <option value="delivery">Deliveries</option>
            <option value="transfer">Transfers</option>
            <option value="adjustment">Adjustments</option>
          </FilterSelect>

          <FilterSelect
            value={filterWarehouse}
            onChange={(e) => { setFilterWarehouse(e.target.value); setFilterLocation("all"); }}
          >
            <option value="all">All Warehouses</option>
            {warehouseOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>{opt.name}</option>
            ))}
          </FilterSelect>

          <FilterSelect value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)}>
            <option value="all">All Locations</option>
            {locationOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>{opt.name}</option>
            ))}
          </FilterSelect>

          <FilterSelect value={filterProduct} onChange={(e) => setFilterProduct(e.target.value)}>
            <option value="all">All Products</option>
            {productOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>{opt.name}</option>
            ))}
          </FilterSelect>
        </div>

        {/* Date range + sort — responsive row */}
        <div className="mt-2 flex flex-wrap items-end gap-2">
          <div className="flex flex-1 min-w-[140px] flex-col gap-1">
            <label className="text-xs font-medium text-ink-soft">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex flex-1 min-w-[140px] flex-col gap-1">
            <label className="text-xs font-medium text-ink-soft">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-blue-500"
            />
          </div>
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface-soft"
          >
            {sortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
            <span className="hidden xs:inline">{sortOrder === "asc" ? "Oldest" : "Newest"}</span>
          </button>
        </div>
      </div>

      {/* ── Error ──────────────────────────────────────────── */}
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      )}

      {/* ── Stats ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Entries" value={totals.entries.toLocaleString()} />
        <StatCard label="Total Qty In"  value={`+${totals.totalIn.toLocaleString()}`}  color="text-emerald-600" />
        <StatCard label="Total Qty Out" value={`-${totals.totalOut.toLocaleString()}`} color="text-rose-600" />
        <StatCard
          label="Net Balance"
          value={totals.net.toLocaleString()}
          color={totals.net >= 0 ? "text-emerald-600" : "text-rose-600"}
        />
      </div>

      {/* ── Table — scrollable on small screens ────────────── */}
      {loading ? (
        <div className="rounded-xl border border-line bg-surface px-4 py-10 text-center text-sm text-ink-soft">
          <RefreshCw className="mx-auto mb-2 h-6 w-6 animate-spin opacity-40" />
          Loading stock ledger…
        </div>
      ) : sorted.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line bg-surface px-4 py-10 text-center text-sm text-ink-soft">
          No ledger entries found. Try adjusting your filters.
        </div>
      ) : (
        <div className="rounded-xl border border-line bg-surface" style={{ boxShadow: "var(--shadow-md)" }}>
          {/* result hint */}
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <span className="text-xs text-ink-soft">{sorted.length} entr{sorted.length === 1 ? "y" : "ies"}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-line bg-surface-soft text-xs uppercase text-ink-soft">
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Date</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Document</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Type</th>
                  <th className="px-4 py-3 text-left font-semibold">Product</th>
                  <th className="px-4 py-3 text-right font-semibold whitespace-nowrap">Qty In</th>
                  <th className="px-4 py-3 text-right font-semibold whitespace-nowrap">Qty Out</th>
                  <th className="px-4 py-3 text-right font-semibold whitespace-nowrap">Balance</th>
                  <th className="px-4 py-3 text-left font-semibold hidden lg:table-cell">Warehouse</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((entry) => (
                  <tr key={entry.id} className="border-b border-line last:border-0 hover:bg-surface-soft/60 transition-colors">
                    <td className="px-4 py-3 text-xs text-ink-soft whitespace-nowrap">{entry.date || "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-ink whitespace-nowrap">{entry.documentNo || "—"}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={entry.type} />
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink leading-tight">{entry.product || "—"}</p>
                      {entry.sku && <p className="text-xs text-ink-soft font-mono mt-0.5">{entry.sku}</p>}
                      {/* warehouse shown inline on mobile (hidden on lg) */}
                      {entry.warehouse && (
                        <p className="text-xs text-ink-soft mt-0.5 lg:hidden">{entry.warehouse}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {entry.qtyIn > 0
                        ? <span className="font-semibold text-emerald-600">+{Number(entry.qtyIn).toLocaleString()}</span>
                        : <span className="text-ink-soft">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {entry.qtyOut > 0
                        ? <span className="font-semibold text-rose-600">-{Number(entry.qtyOut).toLocaleString()}</span>
                        : <span className="text-ink-soft">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-ink whitespace-nowrap">
                      {Number(entry.balance || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-soft hidden lg:table-cell">
                      {entry.warehouse || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
