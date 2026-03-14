import { useEffect, useState } from 'react';
import {
  Package, AlertTriangle, XCircle, PackageCheck, Truck, ArrowLeftRight,
  TrendingUp, TrendingDown, BarChart3, Activity, RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { fetchDashboardStats } from '../../services/dashboardApi.js';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#3b82f6', '#f97316', '#10b981', '#8b5cf6', '#ef4444'];

function KPICard({ label, value, sub, icon: Icon, color, bg }) {
  return (
    <div className="bg-surface border border-line rounded-xl p-6 hover:shadow-md transition-all duration-200"
      style={{ boxShadow: 'var(--shadow-md)' }}>
      <div className="flex items-center justify-center rounded-xl mb-4"
        style={{ width: 44, height: 44, backgroundColor: bg, color }}>
        <Icon size={20} />
      </div>
      <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">{label}</p>
      <h3 className="text-3xl font-bold font-heading text-ink mt-2 mb-1">{value}</h3>
      {sub && <p className="text-xs text-ink-soft mt-1">{sub}</p>}
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    draft: { background: '#f3f4f6', color: '#374151' },
    waiting: { background: '#e0f2fe', color: '#075985' },
    ready: { background: '#fef3c7', color: '#92400e' },
    done: { background: '#d1fae5', color: '#065f46' },
    canceled: { background: '#fee2e2', color: '#991b1b' },
  };
  const s = styles[status] || styles.draft;
  return (
    <span style={{
      ...s, padding: '4px 12px', borderRadius: '999px',
      fontSize: '12px', fontWeight: 600, textTransform: 'capitalize'
    }}>
      {status}
    </span>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#ffffff', border: '1px solid var(--line)',
      borderRadius: 12, padding: '12px 16px', boxShadow: 'var(--shadow-md)',
      fontFamily: 'Manrope, sans-serif', fontSize: 13
    }}>
      <p style={{ margin: 0, fontWeight: 700, color: 'var(--navy-900)' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ margin: '4px 0 0', color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
}

export default function InventoryDashboard() {
  const { session } = useAuth();
  const token = session?.token;
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStats = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const data = await fetchDashboardStats(token);
      setStats(data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStats(); }, [token]);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  // KPIs
  const kpis = stats ? [
    { label: 'Total Products', value: stats.products.total, sub: `${stats.products.active} active`, icon: Package, color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Low Stock', value: stats.products.lowStock, sub: 'Below reorder point', icon: AlertTriangle, color: '#f59e0b', bg: '#fffbeb' },
    { label: 'Out of Stock', value: stats.products.outOfStock, sub: 'Zero on hand', icon: XCircle, color: '#ef4444', bg: '#fef2f2' },
    { label: 'Pending Receipts', value: stats.operations.pendingReceipts, sub: 'Awaiting processing', icon: PackageCheck, color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Pending Deliveries', value: stats.operations.pendingDeliveries, sub: 'Ready to ship', icon: Truck, color: '#f97316', bg: '#fff7ed' },
    { label: 'Total On Hand', value: stats.stock.totalOnHand.toLocaleString(), sub: 'Across all warehouses', icon: ArrowLeftRight, color: '#10b981', bg: '#ecfdf5' },
  ] : [];

  // Chart data
  const opsByTypeData = stats ? Object.entries(stats.operations.byType)
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({ name: key.charAt(0).toUpperCase() + key.slice(1), value }))
    : [];

  const opsByStatusData = stats ? Object.entries(stats.operations.byStatus)
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({ name: key.charAt(0).toUpperCase() + key.slice(1), value }))
    : [];

  if (loading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-ink mb-2">Inventory Dashboard</h1>
          <p className="text-ink-soft">{today}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-surface border border-line rounded-xl p-5 animate-pulse"
              style={{ boxShadow: 'var(--shadow-md)', minHeight: 100 }}>
              <div className="flex items-center gap-4">
                <div className="rounded-xl" style={{ width: 48, height: 48, background: '#edf4fb' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: 10, width: '60%', background: '#edf4fb', borderRadius: 6, marginBottom: 8 }} />
                  <div style={{ height: 20, width: '40%', background: '#edf4fb', borderRadius: 6 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {[1, 2].map((i) => (
            <div key={i} className="bg-surface border border-line rounded-xl p-6 animate-pulse"
              style={{ boxShadow: 'var(--shadow-md)', minHeight: 280 }}>
              <div style={{ height: 16, width: '30%', background: '#edf4fb', borderRadius: 6 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-ink mb-2">Inventory Dashboard</h1>
        </div>
        <div className="feedback error">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-ink mb-1">Inventory Dashboard</h1>
          <p className="text-ink-soft text-sm">{today}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadStats}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-line bg-surface text-ink text-sm font-semibold hover:shadow-sm transition-all"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {kpis.map((kpi) => (
          <KPICard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Operations by Type - Bar Chart */}
        <div className="bg-surface border border-line rounded-xl p-6" style={{ boxShadow: 'var(--shadow-md)' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-heading font-semibold text-ink">Operations by Type</h3>
            <BarChart3 className="w-5 h-5 text-ink-soft" />
          </div>
          {opsByTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={opsByTypeData} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(24,52,87,0.08)" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#527196' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#527196' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Operations" radius={[8, 8, 0, 0]}>
                  {opsByTypeData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center text-ink-soft text-sm" style={{ height: 260 }}>
              No operations data yet
            </div>
          )}
        </div>

        {/* Operations by Status - Pie Chart */}
        <div className="bg-surface border border-line rounded-xl p-6" style={{ boxShadow: 'var(--shadow-md)' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-heading font-semibold text-ink">Status Distribution</h3>
            <Activity className="w-5 h-5 text-ink-soft" />
          </div>
          {opsByStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={opsByStatusData} cx="50%" cy="50%"
                  innerRadius={60} outerRadius={100}
                  paddingAngle={3} dataKey="value"
                >
                  {opsByStatusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                  formatter={(v) => <span style={{ color: '#527196', fontSize: 12 }}>{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center text-ink-soft text-sm" style={{ height: 260 }}>
              No operations data yet
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions + Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface border border-line rounded-xl p-6" style={{ boxShadow: 'var(--shadow-md)' }}>
          <h3 className="font-heading font-semibold text-ink mb-4">Quick Actions</h3>
          <div className="flex flex-col gap-3">
            <Link to="/inventory/products"
              className="px-4 py-3 rounded-xl border border-line bg-surface-soft text-ink text-sm font-semibold hover:bg-white transition-colors flex items-center gap-2">
              <Package size={16} className="text-blue-500" /> Manage Products
            </Link>
            <Link to="/inventory/operations"
              className="px-4 py-3 rounded-xl border border-line bg-surface-soft text-ink text-sm font-semibold hover:bg-white transition-colors flex items-center gap-2">
              <PackageCheck size={16} className="text-blue-500" /> Create Operation
            </Link>
            <Link to="/inventory/stock-ledger"
              className="px-4 py-3 rounded-xl border border-line bg-surface-soft text-ink text-sm font-semibold hover:bg-white transition-colors flex items-center gap-2">
              <BarChart3 size={16} className="text-blue-500" /> View Stock Ledger
            </Link>
            <Link to="/inventory/reports"
              className="px-4 py-3 rounded-xl border border-line bg-surface-soft text-ink text-sm font-semibold hover:bg-white transition-colors flex items-center gap-2">
              <TrendingUp size={16} className="text-blue-500" /> View Reports
            </Link>
          </div>
        </div>

        <div className="bg-surface border border-line rounded-xl p-6 lg:col-span-2" style={{ boxShadow: 'var(--shadow-md)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-ink">Low Stock Alerts</h3>
            <span className="px-3 py-1 rounded-full text-xs font-bold"
              style={{ background: '#fef3c7', color: '#92400e' }}>
              {stats.products.lowStock + stats.products.outOfStock} items
            </span>
          </div>
          {(stats.products.lowStockItems.length === 0 && stats.products.outOfStockItems.length === 0) ? (
            <div className="flex items-center justify-center text-ink-soft text-sm py-8">
              All stock levels are healthy ✓
            </div>
          ) : (
            <div className="space-y-2" style={{ maxHeight: 260, overflowY: 'auto' }}>
              {stats.products.outOfStockItems.map((item) => (
                <div key={item._id}
                  className="flex items-center justify-between rounded-xl px-4 py-3"
                  style={{ border: '1px solid #fecaca', background: '#fef2f2' }}>
                  <div>
                    <div className="text-sm font-semibold text-ink">{item.name}</div>
                    <div className="text-xs text-ink-soft">SKU {item.sku}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold" style={{ color: '#ef4444' }}>Out of Stock</div>
                    <div className="text-xs text-ink-soft">Reorder at {item.reorderPoint}</div>
                  </div>
                </div>
              ))}
              {stats.products.lowStockItems.map((item) => (
                <div key={item._id}
                  className="flex items-center justify-between rounded-xl px-4 py-3"
                  style={{ border: '1px solid #fde68a', background: '#fffbeb' }}>
                  <div>
                    <div className="text-sm font-semibold text-ink">{item.name}</div>
                    <div className="text-xs text-ink-soft">SKU {item.sku}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold" style={{ color: '#f59e0b' }}>{item.onHand} in stock</div>
                    <div className="text-xs text-ink-soft">Reorder at {item.reorderPoint}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Operations Table */}
      <div className="bg-surface border border-line rounded-xl overflow-hidden" style={{ boxShadow: 'var(--shadow-md)' }}>
        <div className="px-6 py-4 border-b border-line flex items-center justify-between">
          <h2 className="font-heading font-semibold text-ink">Recent Operations</h2>
          <Link to="/inventory/operations" className="text-sm font-semibold hover:underline" style={{ color: '#3b82f6' }}>
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-surface-soft">
                <th className="text-left px-6 py-3 font-semibold text-ink-soft text-xs uppercase tracking-wider">Document</th>
                <th className="text-left px-6 py-3 font-semibold text-ink-soft text-xs uppercase tracking-wider">Type</th>
                <th className="text-left px-6 py-3 font-semibold text-ink-soft text-xs uppercase tracking-wider">Product</th>
                <th className="text-right px-6 py-3 font-semibold text-ink-soft text-xs uppercase tracking-wider">Qty</th>
                <th className="text-left px-6 py-3 font-semibold text-ink-soft text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 font-semibold text-ink-soft text-xs uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.operations.recent.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-ink-soft">No operations yet</td>
                </tr>
              ) : (
                stats.operations.recent.map((op) => (
                  <tr key={op._id} className="border-b border-line hover:bg-surface-soft transition-colors">
                    <td className="px-6 py-3 font-mono text-xs font-semibold text-ink">{op.documentNo}</td>
                    <td className="px-6 py-3 text-ink capitalize">{op.type}</td>
                    <td className="px-6 py-3 text-ink">{op.productName}</td>
                    <td className="px-6 py-3 text-right font-semibold text-ink">{op.totalQty}</td>
                    <td className="px-6 py-3"><StatusBadge status={op.status} /></td>
                    <td className="px-6 py-3 text-ink-soft">{new Date(op.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
