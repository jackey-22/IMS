import { useState } from 'react';
import { 
  Package, AlertTriangle, XCircle, PackageCheck, Truck, ArrowLeftRight,
  Plus, Filter, TrendingUp, TrendingDown, BarChart3, PieChart
} from 'lucide-react';

// KPI Cards Component
function KPICard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-surface border border-line rounded-lg p-6 hover:shadow-md transition-shadow" style={{ boxShadow: 'var(--shadow-md)' }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium uppercase tracking-wider text-ink-soft">{label}</p>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <h3 className="text-3xl font-bold font-heading">{value.toLocaleString()}</h3>
    </div>
  );
}

// Simple Chart Component
function SimpleChart({ title, data, type }) {
  return (
    <div className="bg-surface border border-line rounded-lg p-6" style={{ boxShadow: 'var(--shadow-md)' }}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading font-semibold text-ink">{title}</h3>
        {type === 'pie' ? <PieChart className="w-4 h-4 text-ink-soft" /> : <BarChart3 className="w-4 h-4 text-ink-soft" />}
      </div>
      <div className="space-y-3">
        {data.map((item, i) => (
          <div key={i}>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-ink">{item.label}</span>
              <span className="text-sm font-medium text-ink">{item.value}</span>
            </div>
            <div className="h-2 bg-surface-soft rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full" 
                style={{ 
                  width: `${item.percentage}%`,
                  backgroundColor: item.color || '#3b82f6'
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status }) {
  const styles = {
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    draft: 'bg-gray-100 text-gray-800',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || styles.draft}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// Trending Component
function TrendingItem({ label, value, trend, isPositive }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-line last:border-0">
      <span className="text-sm text-ink">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-medium text-ink">{value}</span>
        <div className="flex items-center gap-1">
          {isPositive ? <TrendingUp className="w-4 h-4 text-success-text" /> : <TrendingDown className="w-4 h-4 text-error-text" />}
          <span className={`text-xs font-medium ${isPositive ? 'text-success-text' : 'text-error-text'}`}>{trend}%</span>
        </div>
      </div>
    </div>
  );
}

export default function InventoryDashboard() {
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');
  const [selectedDocType, setSelectedDocType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Sample data
  const kpis = [
    { label: 'Total Products', value: 245, icon: Package, color: 'text-blue-600' },
    { label: 'Low Stock', value: 12, icon: AlertTriangle, color: 'text-yellow-600' },
    { label: 'Out of Stock', value: 3, icon: XCircle, color: 'text-red-600' },
    { label: 'Pending Receipts', value: 8, icon: PackageCheck, color: 'text-blue-600' },
    { label: 'Pending Deliveries', value: 5, icon: Truck, color: 'text-orange-600' },
    { label: 'Scheduled Transfers', value: 2, icon: ArrowLeftRight, color: 'text-gray-600' },
  ];

  const operationsByType = [
    { label: 'Receipts', value: 45, percentage: 40, color: '#3b82f6' },
    { label: 'Deliveries', value: 32, percentage: 28, color: '#f97316' },
    { label: 'Transfers', value: 24, percentage: 21, color: '#10b981' },
    { label: 'Adjustments', value: 12, percentage: 11, color: '#8b5cf6' },
  ];

  const statusDistribution = [
    { label: 'Completed', value: 89, percentage: 65, color: '#10b981' },
    { label: 'Pending', value: 32, percentage: 23, color: '#f59e0b' },
    { label: 'Draft', value: 15, percentage: 12, color: '#6b7280' },
  ];

  const recentOps = [
    { id: 1, doc: 'REC-9042', type: 'Receipt', date: '2026-03-14', product: 'Steel Rods (10mm)', qty: 100, status: 'pending' },
    { id: 2, doc: 'DEL-3021', type: 'Delivery', date: '2026-03-14', product: 'Office Desk Standard', qty: 5, status: 'pending' },
    { id: 3, doc: 'TRF-1105', type: 'Transfer', date: '2026-03-12', product: 'Hex Bolt M8x40', qty: 200, status: 'completed' },
    { id: 4, doc: 'ADJ-0087', type: 'Adjustment', date: '2026-03-11', product: 'Welding Electrode', qty: 3, status: 'completed' },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-ink mb-2">Inventory Dashboard</h1>
        <p className="text-ink-soft">Main Hub · {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {kpis.map((kpi) => (
          <KPICard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-8 flex-wrap">
        <select
          value={selectedWarehouse}
          onChange={(e) => setSelectedWarehouse(e.target.value)}
          className="px-4 py-2 bg-surface border border-line rounded-lg text-ink text-sm"
        >
          <option value="all">All Warehouses</option>
          <option value="main">Main Warehouse</option>
          <option value="secondary">Secondary Depot</option>
        </select>

        <select
          value={selectedDocType}
          onChange={(e) => setSelectedDocType(e.target.value)}
          className="px-4 py-2 bg-surface border border-line rounded-lg text-ink text-sm"
        >
          <option value="all">All Document Types</option>
          <option value="receipt">Receipts</option>
          <option value="delivery">Deliveries</option>
          <option value="transfer">Transfers</option>
          <option value="adjustment">Adjustments</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 bg-surface border border-line rounded-lg text-ink text-sm"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <SimpleChart title="Operations by Type" data={operationsByType} type="bar" />
        <SimpleChart title="Status Distribution" data={statusDistribution} type="pie" />
      </div>

      {/* Recent Operations Table */}
      <div className="bg-surface border border-line rounded-lg overflow-hidden" style={{ boxShadow: 'var(--shadow-md)' }}>
        <div className="px-6 py-4 border-b border-line flex items-center justify-between">
          <h2 className="font-heading font-semibold text-ink">Recent Operations</h2>
          <a href="/inventory/operations" className="text-blue-600 text-sm hover:underline">View all →</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-surface-soft">
                <th className="text-left px-6 py-3 font-medium text-ink-soft text-xs uppercase tracking-wider">Document</th>
                <th className="text-left px-6 py-3 font-medium text-ink-soft text-xs uppercase tracking-wider">Type</th>
                <th className="text-left px-6 py-3 font-medium text-ink-soft text-xs uppercase tracking-wider">Date</th>
                <th className="text-left px-6 py-3 font-medium text-ink-soft text-xs uppercase tracking-wider">Product</th>
                <th className="text-right px-6 py-3 font-medium text-ink-soft text-xs uppercase tracking-wider">Qty</th>
                <th className="text-left px-6 py-3 font-medium text-ink-soft text-xs uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOps.map((op) => (
                <tr key={op.id} className="border-b border-line hover:bg-surface-soft transition-colors">
                  <td className="px-6 py-3 font-mono text-xs font-medium text-ink">{op.doc}</td>
                  <td className="px-6 py-3 text-ink">{op.type}</td>
                  <td className="px-6 py-3 text-ink-soft">{op.date}</td>
                  <td className="px-6 py-3 text-ink">{op.product}</td>
                  <td className="px-6 py-3 text-right font-medium text-ink">{op.qty}</td>
                  <td className="px-6 py-3">
                    <StatusBadge status={op.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
