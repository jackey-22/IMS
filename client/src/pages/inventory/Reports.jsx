import { useState } from 'react';
import { FileText, TrendingDown, TrendingUp, Package, Warehouse, Calendar } from 'lucide-react';

// Tab Component
function Tabs({ tabs, activeTab, setActiveTab }) {
  return (
    <div className="flex gap-1 border-b border-line mb-6 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
            activeTab === tab.id
              ? 'border-blue-600 text-ink'
              : 'border-transparent text-ink-soft hover:text-ink'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// Report Card Component
function ReportCard({ title, subtitle, value, icon: Icon, color }) {
  return (
    <div className="bg-surface border border-line rounded-lg p-6" style={{ boxShadow: 'var(--shadow-md)' }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-heading font-semibold text-ink">{title}</h3>
          <p className="text-sm text-ink-soft mt-1">{subtitle}</p>
        </div>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <p className="text-3xl font-bold text-ink">{value}</p>
    </div>
  );
}

// Chart Component
function ChartBar({ label, value, maxValue, color }) {
  const percentage = (value / maxValue) * 100;
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-ink">{label}</span>
        <span className="text-sm font-medium text-ink">{value}</span>
      </div>
      <div className="h-2 bg-surface-soft rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all" 
          style={{ 
            width: `${percentage}%`,
            backgroundColor: color
          }}
        />
      </div>
    </div>
  );
}

export default function Reports() {
  const [activeTab, setActiveTab] = useState('low-stock');
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const tabs = [
    { id: 'low-stock', label: 'Low Stock Alert' },
    { id: 'movement', label: 'Product Movement' },
    { id: 'warehouse', label: 'Warehouse Distribution' },
    { id: 'monthly', label: 'Monthly Trend' },
  ];

  // Low Stock Report
  const lowStockItems = [
    { product: 'Welding Electrode 3.2mm', sku: 'WE-32-01', current: 18, reorder: 20, category: 'Tools', trend: -5 },
    { product: 'Circuit Board v3', sku: 'CB-2024-V3', current: 89, reorder: 100, category: 'Electronics', trend: -12 },
    { product: 'Oak Plywood Sheet', sku: 'OP-48-01', current: 0, reorder: 50, category: 'Raw Materials', trend: -100 },
  ];

  // Product Movement Report
  const movementData = [
    { product: 'Steel Rods (10mm)', movements: 45, revenue: 135000, trend: 12 },
    { product: 'Copper Wire (2.5mm)', movements: 32, revenue: 96000, trend: 8 },
    { product: 'Office Desk Standard', movements: 28, revenue: 84000, trend: -3 },
    { product: 'Hex Bolt M8x40', movements: 24, revenue: 72000, trend: 5 },
  ];

  // Warehouse Distribution
  const warehouseData = [
    { warehouse: 'Main Warehouse', stock: 8200, percentage: 65, color: '#3b82f6' },
    { warehouse: 'Secondary Depot', stock: 2100, percentage: 22, color: '#10b981' },
    { warehouse: 'Regional Hub', stock: 1280, percentage: 13, color: '#f59e0b' },
  ];

  // Monthly Trend
  const monthlyData = [
    { month: 'January', receipts: 145, deliveries: 98, transfers: 32 },
    { month: 'February', receipts: 156, deliveries: 112, transfers: 45 },
    { month: 'March', receipts: 89, deliveries: 67, transfers: 24 },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-ink">Reports</h1>
          <p className="text-ink-soft text-sm mt-1">Inventory insights and analytics</p>
        </div>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-4 py-2 border border-line rounded-lg bg-surface text-ink text-sm"
        >
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="quarter">Last Quarter</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Low Stock Alert Tab */}
      {activeTab === 'low-stock' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ReportCard
              title="Critical Items"
              subtitle="Out of stock"
              value="1"
              icon={Package}
              color="text-red-600"
            />
            <ReportCard
              title="Low Stock"
              subtitle="Below reorder point"
              value="2"
              icon={TrendingDown}
              color="text-yellow-600"
            />
            <ReportCard
              title="Value at Risk"
              subtitle="Estimated loss"
              value="₹45,500"
              icon={TrendingUp}
              color="text-orange-600"
            />
          </div>

          <div className="bg-surface border border-line rounded-lg p-6" style={{ boxShadow: 'var(--shadow-md)' }}>
            <h3 className="font-heading font-semibold text-ink mb-6">Low Stock Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line">
                    <th className="text-left px-4 py-3 font-medium text-ink-soft text-xs uppercase">Product</th>
                    <th className="text-left px-4 py-3 font-medium text-ink-soft text-xs uppercase">SKU</th>
                    <th className="text-center px-4 py-3 font-medium text-ink-soft text-xs uppercase">Current</th>
                    <th className="text-center px-4 py-3 font-medium text-ink-soft text-xs uppercase">Reorder Point</th>
                    <th className="text-left px-4 py-3 font-medium text-ink-soft text-xs uppercase">Category</th>
                    <th className="text-center px-4 py-3 font-medium text-ink-soft text-xs uppercase">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockItems.map((item, i) => (
                    <tr key={i} className="border-b border-line hover:bg-surface-soft">
                      <td className="px-4 py-3 text-ink">{item.product}</td>
                      <td className="px-4 py-3 font-mono text-xs text-ink-soft">{item.sku}</td>
                      <td className="px-4 py-3 text-center font-medium text-ink">{item.current}</td>
                      <td className="px-4 py-3 text-center text-ink-soft">{item.reorder}</td>
                      <td className="px-4 py-3 text-ink">{item.category}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-xs text-red-600 font-medium">{item.trend}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Product Movement Tab */}
      {activeTab === 'movement' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ReportCard
              title="Total Movements"
              subtitle="Current period"
              value="512"
              icon={Package}
              color="text-blue-600"
            />
            <ReportCard
              title="Total Revenue"
              subtitle="From movement"
              value="₹11,52,000"
              icon={TrendingUp}
              color="text-green-600"
            />
          </div>

          <div className="bg-surface border border-line rounded-lg p-6" style={{ boxShadow: 'var(--shadow-md)' }}>
            <h3 className="font-heading font-semibold text-ink mb-6">Top Moved Products</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line">
                    <th className="text-left px-4 py-3 font-medium text-ink-soft text-xs uppercase">Product</th>
                    <th className="text-center px-4 py-3 font-medium text-ink-soft text-xs uppercase">Movements</th>
                    <th className="text-right px-4 py-3 font-medium text-ink-soft text-xs uppercase">Revenue</th>
                    <th className="text-center px-4 py-3 font-medium text-ink-soft text-xs uppercase">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {movementData.map((item, i) => (
                    <tr key={i} className="border-b border-line hover:bg-surface-soft">
                      <td className="px-4 py-3 text-ink">{item.product}</td>
                      <td className="px-4 py-3 text-center font-medium text-ink">{item.movements}</td>
                      <td className="px-4 py-3 text-right font-medium text-ink">₹{item.revenue.toLocaleString()}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-medium ${item.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.trend > 0 ? '+' : ''}{item.trend}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Warehouse Distribution Tab */}
      {activeTab === 'warehouse' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ReportCard
              title="Total Stock"
              subtitle="All warehouses"
              value="11,580"
              icon={Warehouse}
              color="text-blue-600"
            />
            <ReportCard
              title="Warehouses"
              subtitle="Active locations"
              value="3"
              icon={Package}
              color="text-blue-600"
            />
            <ReportCard
              title="Avg Utilization"
              subtitle="Capacity used"
              value="33.6%"
              icon={TrendingUp}
              color="text-blue-600"
            />
          </div>

          <div className="bg-surface border border-line rounded-lg p-6" style={{ boxShadow: 'var(--shadow-md)' }}>
            <h3 className="font-heading font-semibold text-ink mb-6">Stock by Warehouse</h3>
            <div className="space-y-6">
              {warehouseData.map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="font-medium text-ink">{item.warehouse}</span>
                    <span className="text-sm text-ink-soft">{item.stock.toLocaleString()} units ({item.percentage}%)</span>
                  </div>
                  <div className="h-3 bg-surface-soft rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full" 
                      style={{ 
                        width: `${item.percentage}%`,
                        backgroundColor: item.color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Monthly Trend Tab */}
      {activeTab === 'monthly' && (
        <div className="space-y-6">
          <div className="bg-surface border border-line rounded-lg p-6" style={{ boxShadow: 'var(--shadow-md)' }}>
            <h3 className="font-heading font-semibold text-ink mb-6">Operations Trend</h3>
            <div className="space-y-6">
              {monthlyData.map((month, i) => (
                <div key={i} className="space-y-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-ink">{month.month}</span>
                    <span className="text-sm text-ink-soft">Total: {month.receipts + month.deliveries + month.transfers}</span>
                  </div>
                  <ChartBar label="Receipts" value={month.receipts} maxValue={160} color="#3b82f6" />
                  <ChartBar label="Deliveries" value={month.deliveries} maxValue={160} color="#10b981" />
                  <ChartBar label="Transfers" value={month.transfers} maxValue={160} color="#f59e0b" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
