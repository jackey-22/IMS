import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Download, RefreshCw, Search } from "lucide-react";
import { listStockLedger } from "../../services/operationsApi.js";
import { useAuth } from "../../context/AuthContext.jsx";

// Status Badge Component
function StatusBadge({ status }) {
  const styles = {
    receipt: "bg-green-100 text-green-800",
    delivery: "bg-red-100 text-red-800",
    transfer: "bg-blue-100 text-blue-800",
    adjustment: "bg-purple-100 text-purple-800",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || styles.receipt}`}>
      {(status || "receipt").charAt(0).toUpperCase() + (status || "receipt").slice(1)}
    </span>
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

  useEffect(() => {
    fetchLedger();
  }, [token]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ledgerEntries.filter((entry) => {
      const matchesSearch =
        !q ||
        [entry.product, entry.sku, entry.documentNo]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q);
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
    const rows = [...filtered];
    rows.sort((a, b) =>
      sortOrder === "desc"
        ? new Date(b.date || 0) - new Date(a.date || 0)
        : new Date(a.date || 0) - new Date(b.date || 0)
    );
    return rows;
  }, [filtered, sortOrder]);

  const totals = useMemo(() => {
    const totalIn = filtered.reduce((acc, entry) => acc + (Number(entry.qtyIn) || 0), 0);
    const totalOut = filtered.reduce((acc, entry) => acc + (Number(entry.qtyOut) || 0), 0);
    return {
      entries: filtered.length,
      totalIn,
      totalOut,
      net: totalIn - totalOut,
    };
  }, [filtered]);

  const warehouseOptions = useMemo(() => {
    const map = new Map();
    ledgerEntries.forEach((entry) => {
      if (entry.warehouseId && entry.warehouseName && !map.has(entry.warehouseId)) {
        map.set(entry.warehouseId, entry.warehouseName);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [ledgerEntries]);

  const locationOptions = useMemo(() => {
    const map = new Map();
    ledgerEntries.forEach((entry) => {
      if (!entry.locationId || !entry.locationName) return;
      if (filterWarehouse !== "all" && entry.warehouseId !== filterWarehouse) return;
      if (!map.has(entry.locationId)) {
        map.set(entry.locationId, entry.locationName);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [ledgerEntries, filterWarehouse]);

  const productOptions = useMemo(() => {
    const map = new Map();
    ledgerEntries.forEach((entry) => {
      if (entry.productId && entry.product && !map.has(entry.productId)) {
        map.set(entry.productId, `${entry.product} ${entry.sku ? `(${entry.sku})` : ""}`.trim());
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [ledgerEntries]);

  const handleExport = () => {
    if (sorted.length === 0) return;
    // Simple CSV export
    const csv = [
      ['Date', 'Document', 'Type', 'Product', 'SKU', 'Qty In', 'Qty Out', 'Balance', 'Warehouse'],
      ...sorted.map(entry => [
        entry.date,
        entry.docNumber,
        entry.type,
        entry.product,
        entry.sku,
        entry.qtyIn,
        entry.qtyOut,
        entry.balance,
        entry.warehouse
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock-ledger-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-ink">Stock Ledger</h1>
          <p className="text-sm text-ink-soft">Complete audit trail of all stock movements</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchLedger}
            className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface-soft"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-line bg-surface p-4" style={{ boxShadow: "var(--shadow-md)" }}>
        <div className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_180px_190px_180px_200px_240px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
            <input
              type="text"
              placeholder="Search product, SKU, or document..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-line bg-surface pl-10 pr-3 py-2 text-sm text-ink outline-none transition-colors focus:border-blue-500"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink"
          >
            <option value="all">All Types</option>
            <option value="receipt">Receipts</option>
            <option value="delivery">Deliveries</option>
            <option value="transfer">Transfers</option>
            <option value="adjustment">Adjustments</option>
          </select>

          <select
            value={filterWarehouse}
            onChange={(e) => {
              setFilterWarehouse(e.target.value);
              setFilterLocation("all");
            }}
            className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink"
          >
            <option value="all">All Warehouses</option>
            {warehouseOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>{opt.name}</option>
            ))}
          </select>

          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink"
          >
            <option value="all">All Locations</option>
            {locationOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>{opt.name}</option>
            ))}
          </select>

          <select
            value={filterProduct}
            onChange={(e) => setFilterProduct(e.target.value)}
            className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink"
          >
            <option value="all">All Products</option>
            {productOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>{opt.name}</option>
            ))}
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface-soft"
          >
            {sortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
            {sortOrder === "asc" ? "Oldest First" : "Newest First"}
          </button>
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_1fr]">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-soft">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-soft">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-line bg-surface p-4" style={{ boxShadow: "var(--shadow-md)" }}>
          <p className="text-xs uppercase tracking-wider text-ink-soft">Total Entries</p>
          <p className="mt-2 text-2xl font-semibold text-ink">{totals.entries}</p>
        </div>
        <div className="rounded-xl border border-line bg-surface p-4" style={{ boxShadow: "var(--shadow-md)" }}>
          <p className="text-xs uppercase tracking-wider text-ink-soft">Total Qty In</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-600">{totals.totalIn.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-line bg-surface p-4" style={{ boxShadow: "var(--shadow-md)" }}>
          <p className="text-xs uppercase tracking-wider text-ink-soft">Total Qty Out</p>
          <p className="mt-2 text-2xl font-semibold text-rose-600">{totals.totalOut.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-line bg-surface p-4" style={{ boxShadow: "var(--shadow-md)" }}>
          <p className="text-xs uppercase tracking-wider text-ink-soft">Net Balance</p>
          <p className="mt-2 text-2xl font-semibold text-ink">{totals.net.toLocaleString()}</p>
        </div>
      </div>

      <div className="rounded-xl border border-line bg-surface" style={{ boxShadow: "var(--shadow-md)" }}>
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-surface-soft text-ink-soft">
                <th className="px-4 py-3 text-left font-semibold">Date</th>
                <th className="px-4 py-3 text-left font-semibold">Document</th>
                <th className="px-4 py-3 text-left font-semibold">Type</th>
                <th className="px-4 py-3 text-left font-semibold">Product</th>
                <th className="px-4 py-3 text-left font-semibold">SKU</th>
                <th className="px-4 py-3 text-right font-semibold">Qty In</th>
                <th className="px-4 py-3 text-right font-semibold">Qty Out</th>
                <th className="px-4 py-3 text-right font-semibold">Balance</th>
                <th className="px-4 py-3 text-left font-semibold">Warehouse</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((entry) => (
                <tr key={entry.id} className="border-b border-line last:border-0 hover:bg-surface-soft/60">
                  <td className="px-4 py-3 text-ink-soft">{entry.date || "--"}</td>
                  <td className="px-4 py-3 font-mono text-xs font-medium text-ink">{entry.documentNo || "--"}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={entry.type} />
                  </td>
                  <td className="px-4 py-3 font-medium text-ink">{entry.product}</td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-soft">{entry.sku || "--"}</td>
                  <td className="px-4 py-3 text-right font-semibold text-emerald-600">
                    {entry.qtyIn > 0 ? `+${Number(entry.qtyIn).toLocaleString()}` : "--"}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-rose-600">
                    {entry.qtyOut > 0 ? `-${Number(entry.qtyOut).toLocaleString()}` : "--"}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-ink">{Number(entry.balance || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-ink-soft">{entry.warehouse || "--"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {loading && (
        <div className="rounded-lg border border-line bg-surface px-4 py-3 text-sm text-ink-soft">
          Loading stock ledger...
        </div>
      )}

      {!loading && sorted.length === 0 && (
        <div className="rounded-lg border border-dashed border-line bg-surface px-4 py-10 text-center text-sm text-ink-soft">
          No ledger entries found.
        </div>
      )}
    </div>
  );
}
