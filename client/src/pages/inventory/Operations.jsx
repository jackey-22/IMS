import { useState } from 'react';
import { Plus, Search, Edit, Trash2, CheckCircle, Clock, FileText } from 'lucide-react';

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

// Operations Table Component
function OperationsTable({ operations, type }) {
  const typeIcons = {
    receipt: PackageCheck,
    delivery: Truck,
    transfer: ArrowLeftRight,
    adjustment: FileText,
  };

  return (
    <div className="bg-surface border border-line rounded-lg overflow-hidden" style={{ boxShadow: 'var(--shadow-md)' }}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-surface-soft">
              <th className="text-left px-6 py-3 font-medium text-ink-soft text-xs uppercase tracking-wider">Document</th>
              <th className="text-left px-6 py-3 font-medium text-ink-soft text-xs uppercase tracking-wider">Date</th>
              <th className="text-left px-6 py-3 font-medium text-ink-soft text-xs uppercase tracking-wider">Product(s)</th>
              <th className="text-right px-6 py-3 font-medium text-ink-soft text-xs uppercase tracking-wider">Qty</th>
              {type === 'receipt' && <th className="text-left px-6 py-3 font-medium text-ink-soft text-xs uppercase tracking-wider">Supplier</th>}
              {type === 'delivery' && <th className="text-left px-6 py-3 font-medium text-ink-soft text-xs uppercase tracking-wider">Customer</th>}
              {type === 'transfer' && <th className="text-left px-6 py-3 font-medium text-ink-soft text-xs uppercase tracking-wider">Destination</th>}
              <th className="text-left px-6 py-3 font-medium text-ink-soft text-xs uppercase tracking-wider">Status</th>
              <th className="text-center px-6 py-3 font-medium text-ink-soft text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {operations.map((op) => (
              <tr key={op.id} className="border-b border-line hover:bg-surface-soft transition-colors">
                <td className="px-6 py-3 font-mono text-xs font-medium text-ink">{op.docNumber}</td>
                <td className="px-6 py-3 text-ink-soft">{op.date}</td>
                <td className="px-6 py-3 text-ink">{op.items[0]?.productName}</td>
                <td className="px-6 py-3 text-right font-medium text-ink">{op.items[0]?.quantity}</td>
                {type === 'receipt' && <td className="px-6 py-3 text-ink">{op.supplier}</td>}
                {type === 'delivery' && <td className="px-6 py-3 text-ink">{op.customer}</td>}
                {type === 'transfer' && <td className="px-6 py-3 text-ink">{op.destWarehouse}</td>}
                <td className="px-6 py-3">
                  <StatusBadge status={op.status} />
                </td>
                <td className="px-6 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button className="p-1 text-ink-soft hover:text-blue-600 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-ink-soft hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { PackageCheck, Truck, ArrowLeftRight } from 'lucide-react';

export default function Operations() {
  const [activeTab, setActiveTab] = useState('receipts');
  const [search, setSearch] = useState('');
  const [view, setView] = useState('list');

  const tabs = [
    { id: 'receipts', label: 'Receipts', icon: PackageCheck },
    { id: 'deliveries', label: 'Deliveries', icon: Truck },
    { id: 'transfers', label: 'Transfers', icon: ArrowLeftRight },
    { id: 'adjustments', label: 'Adjustments', icon: FileText },
  ];

  // Sample operations data
  const receipts = [
    { id: 1, docNumber: 'REC-9042', date: '2026-03-14', items: [{ productName: 'Steel Rods (10mm)', quantity: 100 }], supplier: 'Tata Steel', status: 'pending' },
    { id: 2, docNumber: 'REC-9041', date: '2026-03-13', items: [{ productName: 'Copper Wire (2.5mm)', quantity: 500 }], supplier: 'Global Metals', status: 'completed' },
    { id: 3, docNumber: 'REC-9043', date: '2026-03-14', items: [{ productName: 'Circuit Board v3', quantity: 50 }], supplier: 'TechParts Inc.', status: 'draft' },
  ];

  const deliveries = [
    { id: 1, docNumber: 'DEL-3021', date: '2026-03-14', items: [{ productName: 'Office Desk Standard', quantity: 5 }], customer: 'ABC Furniture', status: 'pending' },
    { id: 2, docNumber: 'DEL-3022', date: '2026-03-15', items: [{ productName: 'Industrial Motor 5HP', quantity: 2 }], customer: 'MegaCorp Industries', status: 'pending' },
  ];

  const transfers = [
    { id: 1, docNumber: 'TRF-1105', date: '2026-03-12', items: [{ productName: 'Hex Bolt M8x40', quantity: 200 }], destWarehouse: 'Secondary Depot', status: 'completed' },
    { id: 2, docNumber: 'TRF-1106', date: '2026-03-15', items: [{ productName: 'Steel Rods (10mm)', quantity: 50 }], destWarehouse: 'Secondary Depot', status: 'pending' },
  ];

  const adjustments = [
    { id: 1, docNumber: 'ADJ-0087', date: '2026-03-11', items: [{ productName: 'Welding Electrode 3.2mm', quantity: 3 }], reason: 'Stock discrepancy', status: 'completed' },
    { id: 2, docNumber: 'ADJ-0088', date: '2026-03-13', items: [{ productName: 'Oak Plywood Sheet', quantity: 5 }], reason: 'Damage during handling', status: 'completed' },
  ];

  const operationsByType = {
    receipts,
    deliveries,
    transfers,
    adjustments,
  };

  const currentOps = operationsByType[activeTab] || [];
  const filtered = currentOps.filter(op =>
    op.docNumber.toLowerCase().includes(search.toLowerCase()) ||
    op.items[0]?.productName.toLowerCase().includes(search.toLowerCase())
  );

  const kanbanStatuses = {
    receipts: ['draft', 'pending', 'completed'],
    deliveries: ['draft', 'pending', 'completed']
  };

  const groupedOps = (kanbanStatuses[activeTab] || []).reduce((acc, status) => {
    acc[status] = filtered.filter((op) => op.status === status);
    return acc;
  }, {});

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-ink">Inventory Operations</h1>
          <p className="text-ink-soft text-sm mt-1">Manage receipts, deliveries, transfers, and adjustments</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          New Operation
        </button>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Search */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <div className="relative max-w-sm flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft" />
          <input
            type="text"
            placeholder="Search operations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-line rounded-lg bg-surface text-ink text-sm"
          />
        </div>
        {(activeTab === 'receipts' || activeTab === 'deliveries') && (
          <div className="flex gap-2">
            <button
              onClick={() => setView('list')}
              className={`px-3 py-2 rounded-lg border text-sm ${view === 'list' ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-surface border-line text-ink'}`}
            >
              List
            </button>
            <button
              onClick={() => setView('kanban')}
              className={`px-3 py-2 rounded-lg border text-sm ${view === 'kanban' ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-surface border-line text-ink'}`}
            >
              Kanban
            </button>
          </div>
        )}
      </div>

      {/* Operations Table / Kanban */}
      {(activeTab === 'receipts' || activeTab === 'deliveries') && view === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(kanbanStatuses[activeTab] || []).map((status) => (
            <div key={status} className="bg-surface border border-line rounded-lg p-4" style={{ boxShadow: 'var(--shadow-md)' }}>
              <div className="font-semibold text-ink mb-3">{status.charAt(0).toUpperCase() + status.slice(1)}</div>
              <div className="flex flex-col gap-3">
                {(groupedOps[status] || []).map((op) => (
                  <div key={op.id} className="border border-line rounded-lg p-3 bg-surface-strong">
                    <div className="font-mono text-xs font-semibold text-ink">{op.docNumber}</div>
                    <div className="text-sm text-ink mt-1">{op.items[0]?.productName}</div>
                    <div className="text-xs text-ink-soft mt-1">Qty: {op.items[0]?.quantity}</div>
                    <div className="text-xs text-ink-soft mt-1">Date: {op.date}</div>
                  </div>
                ))}
                {(groupedOps[status] || []).length === 0 && (
                  <div className="text-xs text-ink-soft">No items</div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <OperationsTable operations={filtered} type={activeTab.slice(0, -1)} />
      )}

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-ink-soft">No operations found for this tab</p>
        </div>
      )}
    </div>
  );
}
