import { useState } from 'react';
import { Search, Download, Filter, ArrowUp, ArrowDown } from 'lucide-react';

// Status Badge Component
function StatusBadge({ status }) {
  const styles = {
    receipt: 'bg-green-100 text-green-800',
    delivery: 'bg-red-100 text-red-800',
    transfer: 'bg-blue-100 text-blue-800',
    adjustment: 'bg-purple-100 text-purple-800',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || styles.receipt}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function StockLedger() {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');

  // Sample ledger data
  const [ledgerEntries] = useState([
    { id: 1, date: '2026-03-14', type: 'receipt', docNumber: 'REC-9042', product: 'Steel Rods (10mm)', sku: 'SR-2024-X', qtyIn: 100, qtyOut: 0, balance: 1240, warehouse: 'Main Warehouse' },
    { id: 2, date: '2026-03-13', type: 'receipt', docNumber: 'REC-9041', product: 'Copper Wire (2.5mm)', sku: 'CW-2024-A', qtyIn: 500, qtyOut: 0, balance: 3200, warehouse: 'Main Warehouse' },
    { id: 3, date: '2026-03-12', type: 'transfer', docNumber: 'TRF-1105', product: 'Hex Bolt M8x40', sku: 'HB-M8-40', qtyIn: 0, qtyOut: 200, balance: 4300, warehouse: 'Main Warehouse' },
    { id: 4, date: '2026-03-12', type: 'transfer', docNumber: 'TRF-1105', product: 'Hex Bolt M8x40', sku: 'HB-M8-40', qtyIn: 200, qtyOut: 0, balance: 200, warehouse: 'Secondary Depot' },
    { id: 5, date: '2026-03-11', type: 'adjustment', docNumber: 'ADJ-0087', product: 'Welding Electrode 3.2mm', sku: 'WE-32-01', qtyIn: 0, qtyOut: 3, balance: 18, warehouse: 'Main Warehouse' },
    { id: 6, date: '2026-03-10', type: 'delivery', docNumber: 'DEL-3020', product: 'Office Desk Standard', sku: 'OD-STD-01', qtyIn: 0, qtyOut: 3, balance: 24, warehouse: 'Main Warehouse' },
    { id: 7, date: '2026-03-09', type: 'receipt', docNumber: 'REC-9040', product: 'Circuit Board v3', sku: 'CB-2024-V3', qtyIn: 30, qtyOut: 0, balance: 89, warehouse: 'Main Warehouse' },
    { id: 8, date: '2026-03-08', type: 'delivery', docNumber: 'DEL-3019', product: 'Industrial Motor 5HP', sku: 'IM-5HP-01', qtyIn: 0, qtyOut: 5, balance: 12, warehouse: 'Main Warehouse' },
  ]);

  const filtered = ledgerEntries.filter(entry => {
    const matchesSearch = 
      entry.product.toLowerCase().includes(search.toLowerCase()) ||
      entry.sku.toLowerCase().includes(search.toLowerCase()) ||
      entry.docNumber.toLowerCase().includes(search.toLowerCase());
    
    const matchesFilter = filterType === 'all' || entry.type === filterType;

    return matchesSearch && matchesFilter;
  });

  const sorted = [...filtered].sort((a, b) => {
    return sortOrder === 'desc' 
      ? new Date(b.date) - new Date(a.date)
      : new Date(a.date) - new Date(b.date);
  });

  const handleExport = () => {
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
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-ink">Stock Ledger</h1>
          <p className="text-ink-soft text-sm mt-1">Complete audit trail of all stock movements</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft" />
          <input
            type="text"
            placeholder="Search product, SKU, or document..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-line rounded-lg bg-surface text-ink text-sm"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border border-line rounded-lg bg-surface text-ink text-sm"
        >
          <option value="all">All Types</option>
          <option value="receipt">Receipts</option>
          <option value="delivery">Deliveries</option>
          <option value="transfer">Transfers</option>
          <option value="adjustment">Adjustments</option>
        </select>

        <button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="px-4 py-2 border border-line rounded-lg bg-surface text-ink hover:bg-surface-soft transition-colors flex items-center gap-2"
        >
          {sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
          {sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-surface border border-line rounded-lg p-4">
          <p className="text-xs text-ink-soft uppercase tracking-wider mb-1">Total Entries</p>
          <p className="text-2xl font-bold text-ink">{sorted.length}</p>
        </div>
        <div className="bg-surface border border-line rounded-lg p-4">
          <p className="text-xs text-ink-soft uppercase tracking-wider mb-1">Total Qty In</p>
          <p className="text-2xl font-bold text-green-600">{sorted.reduce((acc, e) => acc + e.qtyIn, 0).toLocaleString()}</p>
        </div>
        <div className="bg-surface border border-line rounded-lg p-4">
          <p className="text-xs text-ink-soft uppercase tracking-wider mb-1">Total Qty Out</p>
          <p className="text-2xl font-bold text-red-600">{sorted.reduce((acc, e) => acc + e.qtyOut, 0).toLocaleString()}</p>
        </div>
        <div className="bg-surface border border-line rounded-lg p-4">
          <p className="text-xs text-ink-soft uppercase tracking-wider mb-1">Net Balance</p>
          <p className="text-2xl font-bold text-ink">{(sorted.reduce((acc, e) => acc + e.qtyIn, 0) - sorted.reduce((acc, e) => acc + e.qtyOut, 0)).toLocaleString()}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface border border-line rounded-lg overflow-hidden" style={{ boxShadow: 'var(--shadow-md)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-surface-soft">
                <th className="text-left px-6 py-3 font-medium text-ink-soft text-xs uppercase tracking-wider">Date</th>
                <th className="text-left px-6 py-3 font-medium text-ink-soft text-xs uppercase tracking-wider">Document</th>
                <th className="text-left px-6 py-3 font-medium text-ink-soft text-xs uppercase tracking-wider">Type</th>
                <th className="text-left px-6 py-3 font-medium text-ink-soft text-xs uppercase tracking-wider">Product</th>
                <th className="text-left px-6 py-3 font-medium text-ink-soft text-xs uppercase tracking-wider">SKU</th>
                <th className="text-right px-6 py-3 font-medium text-ink-soft text-xs uppercase tracking-wider">Qty In</th>
                <th className="text-right px-6 py-3 font-medium text-ink-soft text-xs uppercase tracking-wider">Qty Out</th>
                <th className="text-right px-6 py-3 font-medium text-ink-soft text-xs uppercase tracking-wider">Balance</th>
                <th className="text-left px-6 py-3 font-medium text-ink-soft text-xs uppercase tracking-wider">Warehouse</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((entry) => (
                <tr key={entry.id} className="border-b border-line hover:bg-surface-soft transition-colors">
                  <td className="px-6 py-3 text-ink-soft">{entry.date}</td>
                  <td className="px-6 py-3 font-mono text-xs font-medium text-ink">{entry.docNumber}</td>
                  <td className="px-6 py-3">
                    <StatusBadge status={entry.type} />
                  </td>
                  <td className="px-6 py-3 text-ink">{entry.product}</td>
                  <td className="px-6 py-3 font-mono text-xs font-medium text-ink-soft">{entry.sku}</td>
                  <td className="px-6 py-3 text-right font-medium text-green-600">
                    {entry.qtyIn > 0 ? `+${entry.qtyIn}` : '—'}
                  </td>
                  <td className="px-6 py-3 text-right font-medium text-red-600">
                    {entry.qtyOut > 0 ? `−${entry.qtyOut}` : '—'}
                  </td>
                  <td className="px-6 py-3 text-right font-medium text-ink">{entry.balance.toLocaleString()}</td>
                  <td className="px-6 py-3 text-ink-soft text-sm">{entry.warehouse}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {sorted.length === 0 && (
        <div className="text-center py-12">
          <p className="text-ink-soft">No ledger entries found</p>
        </div>
      )}
    </div>
  );
}
