// Shared Components for Inventory Pages

// Status Badge Component
export function StatusBadge({ status, type = 'status' }) {
  const statusStyles = {
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    draft: 'bg-gray-100 text-gray-800',
  };

  const stockStyles = {
    'in-stock': 'bg-green-100 text-green-800',
    'low-stock': 'bg-yellow-100 text-yellow-800',
    'critical': 'bg-red-100 text-red-800',
  };

  const operationStyles = {
    receipt: 'bg-green-100 text-green-800',
    delivery: 'bg-red-100 text-red-800',
    transfer: 'bg-blue-100 text-blue-800',
    adjustment: 'bg-purple-100 text-purple-800',
  };

  const styles = type === 'stock' ? stockStyles : type === 'operation' ? operationStyles : statusStyles;
  const style = styles[status] || styles.draft;

  const labels = {
    'in-stock': 'In Stock',
    'low-stock': 'Low Stock',
    'critical': 'Critical',
    pending: 'Pending',
    completed: 'Completed',
    draft: 'Draft'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${style}`}>
      {labels[status] || status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// Page Header Component
export function PageHeader({ title, subtitle, actionLabel, actionIcon: ActionIcon, onAction, children }) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-heading font-bold text-ink">{title}</h1>
        {subtitle && <p className="text-ink-soft text-sm mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {children}
        {actionLabel && (
          <button onClick={onAction} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            {ActionIcon && <ActionIcon className="w-4 h-4 mr-2" />}
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}

// Modal Header Component
export function ModalHeader({ title, onClose }) {
  const { X } = require('lucide-react');
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-heading font-bold text-ink">{title}</h2>
      <button onClick={onClose} className="text-ink-soft hover:text-ink">
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}

// Form Input Component
export function FormInput({ label, type = 'text', value, onChange, placeholder, required = false }) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-3 py-2 border border-line rounded-lg bg-surface-soft text-ink text-sm"
      />
    </div>
  );
}

// Form Select Component
export function FormSelect({ label, value, onChange, options, required = false }) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink mb-1">{label}</label>
      <select
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-3 py-2 border border-line rounded-lg bg-surface-soft text-ink text-sm"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

// Form Textarea Component
export function FormTextarea({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink mb-1">{label}</label>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2 border border-line rounded-lg bg-surface-soft text-ink text-sm resize-none"
      />
    </div>
  );
}

// Modal Footer Component
export function ModalFooter({ onCancel, onSubmit, submitLabel = 'Save', cancelLabel = 'Cancel' }) {
  return (
    <div className="flex gap-3 pt-4">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 px-4 py-2 border border-line rounded-lg text-ink hover:bg-surface-soft transition-colors"
      >
        {cancelLabel}
      </button>
      <button
        type="submit"
        onClick={onSubmit}
        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        {submitLabel}
      </button>
    </div>
  );
}

// KPI Card Component
export function KPICard({ label, value, icon: Icon, color = 'text-blue-600' }) {
  return (
    <div className="bg-surface border border-line rounded-lg p-6 hover:shadow-md transition-shadow" style={{ boxShadow: 'var(--shadow-md)' }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium uppercase tracking-wider text-ink-soft">{label}</p>
        {Icon && <Icon className={`w-5 h-5 ${color}`} />}
      </div>
      <h3 className="text-3xl font-bold font-heading">{typeof value === 'number' ? value.toLocaleString() : value}</h3>
    </div>
  );
}

// Table Component
export function DataTable({ columns, data, onEdit, onDelete }) {
  return (
    <div className="bg-surface border border-line rounded-lg overflow-hidden" style={{ boxShadow: 'var(--shadow-md)' }}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-surface-soft">
              {columns.map(col => (
                <th key={col.key} className={`px-6 py-3 font-medium text-ink-soft text-xs uppercase tracking-wider ${col.align === 'right' ? 'text-right' : 'text-left'}`}>
                  {col.label}
                </th>
              ))}
              {(onEdit || onDelete) && <th className="px-6 py-3 font-medium text-ink-soft text-xs uppercase tracking-wider text-center">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className="border-b border-line hover:bg-surface-soft transition-colors">
                {columns.map(col => (
                  <td key={col.key} className={`px-6 py-3 ${col.align === 'right' ? 'text-right' : 'text-left'} ${col.className || ''}`}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="px-6 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {onEdit && (
                        <button onClick={() => onEdit(row)} className="p-1 text-ink-soft hover:text-blue-600 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      {onDelete && (
                        <button onClick={() => onDelete(row.id)} className="p-1 text-ink-soft hover:text-red-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Empty State Component
export function EmptyState({ title = 'No data found', description = '', actionLabel, onAction }) {
  return (
    <div className="text-center py-12">
      <p className="text-ink-soft mb-4">{title}</p>
      {description && <p className="text-sm text-ink-soft mb-6">{description}</p>}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

// Tabs Component
export function Tabs({ tabs, activeTab, setActiveTab }) {
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

// Search Input Component
export function SearchInput({ placeholder, value, onChange }) {
  const { Search } = require('lucide-react');
  return (
    <div className="relative max-w-sm">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full pl-10 pr-4 py-2 border border-line rounded-lg bg-surface text-ink text-sm"
      />
    </div>
  );
}

// Alert Component
export function Alert({ type = 'info', title, message }) {
  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200'
  };

  const textColors = {
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800'
  };

  return (
    <div className={`border rounded-lg p-4 mb-4 ${bgColors[type]} ${textColors[type]}`}>
      {title && <p className="font-medium mb-1">{title}</p>}
      {message && <p className="text-sm">{message}</p>}
    </div>
  );
}

// Import these icons if needed
// import { Edit, Trash2, Search } from 'lucide-react';
