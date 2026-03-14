import { useEffect, useMemo, useState } from "react";
import { MapPin, Plus } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  listWarehouses,
  updateWarehouse,
  updateLocation,
  deleteLocation
} from "../../services/warehousesApi.js";

const makeNodeId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const createLocationNode = () => ({
  nodeId: makeNodeId(),
  name: "",
  code: "",
  type: "zone",
  children: []
});

const updateNodeById = (nodes, nodeId, updater) =>
  nodes.map((node) => {
    if (node.nodeId === nodeId) {
      return updater(node);
    }

    if (!node.children?.length) {
      return node;
    }

    return {
      ...node,
      children: updateNodeById(node.children, nodeId, updater)
    };
  });

const removeNodeById = (nodes, nodeId) =>
  nodes
    .filter((node) => node.nodeId !== nodeId)
    .map((node) => ({
      ...node,
      children: removeNodeById(node.children || [], nodeId)
    }));

const addChildNodeById = (nodes, nodeId) =>
  nodes.map((node) => {
    if (node.nodeId === nodeId) {
      return {
        ...node,
        children: [...(node.children || []), createLocationNode()]
      };
    }

    if (!node.children?.length) {
      return node;
    }

    return {
      ...node,
      children: addChildNodeById(node.children, nodeId)
    };
  });

const flattenHierarchy = (nodes, parentCode = null, collector = []) => {
  nodes.forEach((node) => {
    const code = node.code.trim();
    collector.push({
      name: node.name.trim(),
      code,
      type: node.type.trim() || "location",
      isActive: true,
      parentCode
    });

    flattenHierarchy(node.children || [], code, collector);
  });

  return collector;
};

const countNodes = (nodes) =>
  nodes.reduce((sum, node) => sum + 1 + countNodes(node.children || []), 0);

const buildTreeFromLocations = (locations = []) => {
  if (!locations.length) return [];

  const map = new Map();
  const roots = [];

  locations.forEach((loc) => {
    map.set((loc.code || "").toLowerCase(), {
      _id: loc._id,
      name: loc.name || "",
      code: loc.code || "",
      type: loc.type || "location",
      isActive: loc.isActive ?? true,
      parentCode: loc.parentCode || null,
      children: []
    });
  });

  map.forEach((node) => {
    const parentKey = (node.parentCode || "").toLowerCase();
    if (parentKey && map.has(parentKey)) {
      map.get(parentKey).children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
};

const DEPTH_COLORS = [
  { accent: '#3b82f6', bg: '#eff6ff', border: '#93c5fd', label: 'Root' },
  { accent: '#10b981', bg: '#ecfdf5', border: '#6ee7b7', label: 'L1' },
  { accent: '#f59e0b', bg: '#fffbeb', border: '#fcd34d', label: 'L2' },
  { accent: '#8b5cf6', bg: '#f5f3ff', border: '#c4b5fd', label: 'L3' },
  { accent: '#ef4444', bg: '#fef2f2', border: '#fca5a5', label: 'L4' },
];

function HierarchyRows({ nodes, depth, onChange, onAddChild, onRemove }) {
  const dc = DEPTH_COLORS[Math.min(depth, DEPTH_COLORS.length - 1)];

  return nodes.map((node, idx) => {
    const isLastChild = idx === nodes.length - 1;

    return (
      <div key={node.nodeId} style={{ position: 'relative' }}>
        {/* Connector lines for nested nodes */}
        {depth > 0 && (
          <>
            <div style={{
              position: 'absolute', left: -18, top: 0,
              width: 2, height: isLastChild ? 36 : '100%',
              background: 'rgba(24,52,87,0.1)'
            }} />
            <div style={{
              position: 'absolute', left: -18, top: 36,
              width: 18, height: 2,
              background: 'rgba(24,52,87,0.1)'
            }} />
          </>
        )}

        {/* Node card */}
        <div style={{
          background: '#ffffff', border: `1px solid ${dc.border}`,
          borderRadius: 14, padding: '14px 16px', margin: '6px 0',
          borderLeft: `4px solid ${dc.accent}`,
          boxShadow: '0 1px 3px rgba(17,40,70,0.04)'
        }}>
          {/* Depth indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.06em', padding: '2px 8px', borderRadius: 6,
              background: dc.bg, color: dc.accent, border: `1px solid ${dc.border}`
            }}>
              {depth === 0 ? 'Root Node' : `Level ${depth}`}
            </span>
            {node.children?.length > 0 && (
              <span style={{
                fontSize: 10, fontWeight: 600, color: '#527196',
                background: 'rgba(24,52,87,0.05)', padding: '2px 8px', borderRadius: 999
              }}>
                {node.children.length} {node.children.length === 1 ? 'child' : 'children'}
              </span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 10, alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#527196', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Name</label>
              <input
                type="text"
                value={node.name}
                onChange={(e) => onChange(node.nodeId, "name", e.target.value)}
                style={{
                  width: '100%', padding: '8px 12px', border: '1px solid rgba(24,52,87,0.12)',
                  borderRadius: 10, background: '#ffffff', color: '#15304f', fontSize: 13,
                  outline: 'none', fontFamily: 'inherit'
                }}
                placeholder={depth === 0 ? "Zone A" : "Rack A1"}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#527196', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Code</label>
              <input
                type="text"
                value={node.code}
                onChange={(e) => onChange(node.nodeId, "code", e.target.value.toUpperCase())}
                style={{
                  width: '100%', padding: '8px 12px', border: '1px solid rgba(24,52,87,0.12)',
                  borderRadius: 10, background: '#ffffff', color: '#15304f', fontSize: 13,
                  outline: 'none', fontFamily: 'Consolas, Monaco, monospace'
                }}
                placeholder={depth === 0 ? "ZONE-A" : "RACK-A1"}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#527196', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Type</label>
              <input
                type="text"
                value={node.type}
                onChange={(e) => onChange(node.nodeId, "type", e.target.value)}
                style={{
                  width: '100%', padding: '8px 12px', border: '1px solid rgba(24,52,87,0.12)',
                  borderRadius: 10, background: '#ffffff', color: '#15304f', fontSize: 13,
                  outline: 'none', fontFamily: 'inherit'
                }}
                placeholder="zone / rack / bin / shelf"
              />
            </div>

            <div style={{ display: 'flex', gap: 6, paddingBottom: 1 }}>
              <button
                type="button"
                onClick={() => onAddChild(node.nodeId)}
                title="Add child node"
                style={{
                  padding: '8px 14px', border: `1px solid ${dc.border}`, borderRadius: 10,
                  background: dc.bg, color: dc.accent, fontSize: 12, fontWeight: 700,
                  cursor: 'pointer', whiteSpace: 'nowrap',
                  display: 'inline-flex', alignItems: 'center', gap: 4
                }}
              >
                + Child
              </button>
              <button
                type="button"
                onClick={() => onRemove(node.nodeId)}
                title="Remove node"
                style={{
                  padding: '8px 14px', border: '1px solid #fecaca', borderRadius: 10,
                  background: '#fef2f2', color: '#dc2626', fontSize: 12, fontWeight: 700,
                  cursor: 'pointer', whiteSpace: 'nowrap'
                }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>

        {/* Children with indentation */}
        {!!node.children?.length && (
          <div style={{ marginLeft: 24, position: 'relative' }}>
            <HierarchyRows
              nodes={node.children}
              depth={depth + 1}
              onChange={onChange}
              onAddChild={onAddChild}
              onRemove={onRemove}
            />
          </div>
        )}
      </div>
    );
  });
}

function LocationTreeView({ nodes, depth = 0, isLast = false }) {
  const typeColors = {
    zone: { bg: '#dbeafe', color: '#1e40af', border: '#93c5fd' },
    rack: { bg: '#d1fae5', color: '#065f46', border: '#6ee7b7' },
    bin: { bg: '#fef3c7', color: '#92400e', border: '#fcd34d' },
    shelf: { bg: '#ede9fe', color: '#5b21b6', border: '#c4b5fd' },
  };

  const getTypeStyle = (type) => typeColors[type?.toLowerCase()] || { bg: '#f3f4f6', color: '#374151', border: '#d1d5db' };

  return (
    <div>
      {nodes.map((node, idx) => {
        const isLastChild = idx === nodes.length - 1;
        const ts = getTypeStyle(node.type);
        const hasChildren = !!node.children?.length;

        return (
          <div key={`${node.code}-${node.name}-${depth}`} style={{ position: 'relative' }}>
            {/* Connector lines */}
            {depth > 0 && (
              <>
                {/* Vertical line from parent */}
                <div style={{
                  position: 'absolute', left: -20, top: 0,
                  width: 2, height: isLastChild ? 22 : '100%',
                  background: 'rgba(24,52,87,0.12)'
                }} />
                {/* Horizontal connector to node */}
                <div style={{
                  position: 'absolute', left: -20, top: 22,
                  width: 20, height: 2,
                  background: 'rgba(24,52,87,0.12)'
                }} />
              </>
            )}

            {/* Node card */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 16px', margin: '4px 0',
              borderRadius: 12, border: `1px solid ${ts.border}`,
              background: '#ffffff',
              opacity: node.isActive ? 1 : 0.5,
              transition: 'box-shadow 140ms ease',
              boxShadow: '0 1px 3px rgba(17,40,70,0.04)'
            }}>
              {/* Type badge */}
              <span style={{
                fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.06em', padding: '3px 10px',
                borderRadius: 6, background: ts.bg, color: ts.color,
                border: `1px solid ${ts.border}`, whiteSpace: 'nowrap'
              }}>
                {node.type || 'location'}
              </span>

              {/* Node info */}
              <span style={{ fontSize: 14, fontWeight: 600, color: '#15304f' }}>{node.name}</span>
              {node.code && (
                <span style={{
                  fontSize: 12, color: '#527196', fontFamily: 'Consolas, Monaco, monospace',
                  background: 'rgba(24,52,87,0.05)', padding: '2px 8px', borderRadius: 6
                }}>
                  {node.code}
                </span>
              )}

              {/* Children count badge */}
              {hasChildren && (
                <span style={{
                  fontSize: 11, fontWeight: 600, color: '#527196',
                  marginLeft: 'auto', background: 'rgba(24,52,87,0.06)',
                  padding: '2px 8px', borderRadius: 999
                }}>
                  {node.children.length} {node.children.length === 1 ? 'child' : 'children'}
                </span>
              )}

              {!node.isActive && (
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '2px 8px',
                  borderRadius: 999, background: '#fee2e2', color: '#991b1b',
                  marginLeft: hasChildren ? 0 : 'auto'
                }}>
                  Disabled
                </span>
              )}
            </div>

            {/* Children with indentation */}
            {hasChildren && (
              <div style={{ marginLeft: 28, position: 'relative' }}>
                <LocationTreeView nodes={node.children} depth={depth + 1} isLast={isLastChild} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function LocationSettingsPage() {
  const { session } = useAuth();
  const token = session?.token;

  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const [selectedWarehouseId, setSelectedWarehouseId] = useState("");
  const [hierarchyNodes, setHierarchyNodes] = useState([]);
  const [savingHierarchy, setSavingHierarchy] = useState(false);

  const selectedWarehouse = useMemo(
    () => warehouses.find((w) => w._id === selectedWarehouseId) || null,
    [selectedWarehouseId, warehouses]
  );

  const currentTree = useMemo(
    () => buildTreeFromLocations(selectedWarehouse?.locations || []),
    [selectedWarehouse]
  );

  const rootLocationsCount = useMemo(
    () => (selectedWarehouse?.locations || []).filter((loc) => !loc.parentCode).length,
    [selectedWarehouse]
  );

  const setFlash = (type, text) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 2600);
  };

  const loadWarehouses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listWarehouses(token);
      setWarehouses(data);
      if (!selectedWarehouseId && data.length) {
        setSelectedWarehouseId(data[0]._id);
      }
    } catch (err) {
      setError(err.message || "Failed to load warehouses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWarehouses();
  }, []);

  useEffect(() => {
    if (selectedWarehouseId && !warehouses.some((w) => w._id === selectedWarehouseId)) {
      setSelectedWarehouseId(warehouses[0]?._id || "");
    }
  }, [warehouses, selectedWarehouseId]);

  const addRootNode = () => {
    setHierarchyNodes((prev) => [...prev, createLocationNode()]);
  };

  const applyNodeChange = (nodeId, field, value) => {
    setHierarchyNodes((prev) =>
      updateNodeById(prev, nodeId, (node) => ({
        ...node,
        [field]: value
      }))
    );
  };

  const addChildNode = (nodeId) => {
    setHierarchyNodes((prev) => addChildNodeById(prev, nodeId));
  };

  const removeNode = (nodeId) => {
    setHierarchyNodes((prev) => removeNodeById(prev, nodeId));
  };

  const handleSaveHierarchy = async (e) => {
    e.preventDefault();

    if (!selectedWarehouseId) {
      setFlash("error", "Select a warehouse first.");
      return;
    }

    if (!hierarchyNodes.length) {
      setFlash("error", "Add at least one location node.");
      return;
    }

    const newLocations = flattenHierarchy(hierarchyNodes);
    const missing = newLocations.find((loc) => !loc.name || !loc.code);
    if (missing) {
      setFlash("error", "Each node needs both Name and Code.");
      return;
    }

    const existingLocations = selectedWarehouse?.locations || [];
    const existingCodeSet = new Set(existingLocations.map((loc) => String(loc.code || "").toLowerCase()));
    const newCodeSet = new Set();

    for (const loc of newLocations) {
      const key = loc.code.toLowerCase();
      if (newCodeSet.has(key)) {
        setFlash("error", `Duplicate code in new hierarchy: ${loc.code}`);
        return;
      }
      if (existingCodeSet.has(key)) {
        setFlash("error", `Code already exists in warehouse: ${loc.code}`);
        return;
      }
      newCodeSet.add(key);
    }

    setSavingHierarchy(true);
    try {
      const mergedLocations = [...existingLocations, ...newLocations];
      const updatedWarehouse = await updateWarehouse(token, selectedWarehouseId, {
        locations: mergedLocations
      });

      setWarehouses((prev) => prev.map((w) => (w._id === updatedWarehouse._id ? updatedWarehouse : w)));
      setHierarchyNodes([]);
      setFlash("success", "Hierarchy locations added.");
    } catch (err) {
      setFlash("error", err.message || "Failed to save hierarchy.");
    } finally {
      setSavingHierarchy(false);
    }
  };

  const toggleLocationStatus = async (location) => {
    if (!selectedWarehouse) return;
    try {
      const updatedWarehouse = await updateLocation(token, selectedWarehouse._id, location._id, {
        isActive: !location.isActive
      });
      setWarehouses((prev) => prev.map((w) => (w._id === updatedWarehouse._id ? updatedWarehouse : w)));
      setFlash("success", !location.isActive ? "Location enabled." : "Location disabled.");
    } catch (err) {
      setFlash("error", err.message || "Failed to update location.");
    }
  };

  const handleDeleteLocation = async (location) => {
    if (!selectedWarehouse) return;
    if (!window.confirm(`Delete location "${location.name}" and its child locations?`)) return;
    try {
      const updatedWarehouse = await deleteLocation(token, selectedWarehouse._id, location._id);
      setWarehouses((prev) => prev.map((w) => (w._id === updatedWarehouse._id ? updatedWarehouse : w)));
      setFlash("success", "Location deleted.");
    } catch (err) {
      setFlash("error", err.message || "Failed to delete location.");
    }
  };

  const s = {
    card: {
      background: '#ffffff', borderRadius: 16, border: '1px solid rgba(24,52,87,0.08)',
      boxShadow: '0 14px 36px rgba(17,40,70,0.08)', overflow: 'hidden', marginBottom: 20
    },
    cardHeader: {
      padding: '18px 22px', borderBottom: '1px solid rgba(24,52,87,0.08)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between'
    },
    cardBody: { padding: '20px 22px' },
    cardTitle: { fontSize: 16, fontWeight: 600, margin: 0, fontFamily: 'Sora, sans-serif', color: '#15304f', display: 'flex', alignItems: 'center', gap: 8 },
    kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 22 },
    kpiCard: {
      background: '#ffffff', padding: '18px 20px', borderRadius: 16,
      boxShadow: '0 14px 36px rgba(17,40,70,0.08)', border: '1px solid rgba(24,52,87,0.08)'
    },
    kpiLabel: { fontSize: 11, color: '#527196', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' },
    kpiValue: { fontSize: 28, fontWeight: 700, color: '#15304f', margin: '6px 0 0', fontFamily: 'Sora, sans-serif' },
    label: { display: 'block', fontSize: 12, fontWeight: 600, color: '#527196', marginBottom: 6, letterSpacing: '0.03em' },
    select: {
      width: '100%', padding: '10px 14px', border: '1px solid rgba(24,52,87,0.12)',
      borderRadius: 12, background: '#ffffff', color: '#15304f', fontSize: 14,
      fontFamily: 'inherit', outline: 'none', appearance: 'auto', cursor: 'pointer'
    },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: {
      textAlign: 'left', padding: '12px 22px', background: '#f8fafc',
      color: '#527196', fontWeight: 600, fontSize: 12,
      textTransform: 'uppercase', letterSpacing: '0.05em'
    },
    td: {
      padding: '14px 22px', borderBottom: '1px solid rgba(24,52,87,0.06)',
      fontSize: 14, color: '#15304f'
    },
    statusBadge: (active) => ({
      padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
      background: active ? '#d1fae5' : '#fee2e2',
      color: active ? '#065f46' : '#991b1b'
    }),
    actionBtn: (variant) => ({
      padding: '6px 14px', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none',
      ...(variant === 'danger'
        ? { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }
        : { background: '#f8fafc', color: '#15304f', border: '1px solid rgba(24,52,87,0.12)' }
      )
    }),
    emptyState: {
      padding: '32px 20px', textAlign: 'center', color: '#527196', fontSize: 14,
      border: '1px dashed rgba(24,52,87,0.15)', borderRadius: 12, background: '#fafbfd'
    },
    nodeCount: {
      fontSize: 12, color: '#527196', background: 'rgba(24,52,87,0.05)',
      padding: '4px 12px', borderRadius: 999, fontWeight: 600
    }
  };

  const typeBadgeStyle = (type) => {
    const map = {
      zone: { bg: '#dbeafe', color: '#1e40af', border: '#93c5fd' },
      rack: { bg: '#d1fae5', color: '#065f46', border: '#6ee7b7' },
      bin: { bg: '#fef3c7', color: '#92400e', border: '#fcd34d' },
      shelf: { bg: '#ede9fe', color: '#5b21b6', border: '#c4b5fd' },
    };
    const t = map[type?.toLowerCase()] || { bg: '#f3f4f6', color: '#374151', border: '#d1d5db' };
    return {
      fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
      padding: '3px 10px', borderRadius: 6, background: t.bg, color: t.color, border: `1px solid ${t.border}`
    };
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#15304f', fontFamily: 'Sora, sans-serif', letterSpacing: '-0.03em' }}>
            Settings · Locations
          </h1>
          <p style={{ margin: '4px 0 0', color: '#527196', fontSize: 14 }}>
            Build and manage unlimited nested location hierarchies for your warehouses.
          </p>
        </div>
      </div>

      {/* Feedback banners */}
      {feedback && (
        <div style={{
          padding: '12px 18px', borderRadius: 12, marginBottom: 16, fontSize: 14, fontWeight: 600,
          ...(feedback.type === 'error'
            ? { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }
            : { background: '#ecfdf5', color: '#065f46', border: '1px solid #6ee7b7' })
        }}>
          {feedback.text}
        </div>
      )}
      {error && (
        <div style={{
          padding: '12px 18px', borderRadius: 12, marginBottom: 16, fontSize: 14, fontWeight: 600,
          background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca'
        }}>
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div style={s.kpiGrid}>
        <div style={s.kpiCard}>
          <p style={s.kpiLabel}>Selected Warehouse</p>
          <p style={s.kpiValue}>{selectedWarehouse?.code || '—'}</p>
        </div>
        <div style={s.kpiCard}>
          <p style={s.kpiLabel}>Total Locations</p>
          <p style={s.kpiValue}>{selectedWarehouse?.locations?.length || 0}</p>
        </div>
        <div style={s.kpiCard}>
          <p style={s.kpiLabel}>Root Nodes</p>
          <p style={s.kpiValue}>{rootLocationsCount}</p>
        </div>
      </div>

      {/* Hierarchy Builder Card */}
      <div style={s.card}>
        <div style={s.cardHeader}>
          <h2 style={s.cardTitle}>
            <Plus size={18} style={{ color: '#3b82f6' }} />
            Add Location Hierarchy
          </h2>
        </div>
        <div style={s.cardBody}>
          <form onSubmit={handleSaveHierarchy}>
            {/* Warehouse selector */}
            <div style={{ marginBottom: 18 }}>
              <label style={s.label} htmlFor="warehouse-select">Warehouse</label>
              <select
                id="warehouse-select"
                style={s.select}
                value={selectedWarehouseId}
                onChange={(e) => setSelectedWarehouseId(e.target.value)}
              >
                <option value="">Select warehouse</option>
                {warehouses.map((w) => (
                  <option key={w._id} value={w._id}>{w.name} ({w.code})</option>
                ))}
              </select>
            </div>

            {/* Hierarchy builder area */}
            <div style={{
              border: '1px solid rgba(24,52,87,0.1)', borderRadius: 14,
              padding: 18, background: '#fafbfd', marginBottom: 18
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#15304f' }}>Hierarchy Nodes</p>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: '#527196' }}>
                    Zone → Rack → Bin → Shelf — nest as many levels as you need.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={s.nodeCount}>
                    {countNodes(hierarchyNodes)} {countNodes(hierarchyNodes) === 1 ? 'node' : 'nodes'}
                  </span>
                  <button
                    type="button"
                    onClick={addRootNode}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '8px 16px', border: '1px solid #93c5fd', borderRadius: 10,
                      background: '#eff6ff', color: '#2563eb', fontSize: 13, fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <Plus size={14} />
                    Add Root
                  </button>
                </div>
              </div>

              {!hierarchyNodes.length ? (
                <div style={s.emptyState}>
                  <MapPin size={24} style={{ color: '#93c5fd', marginBottom: 8 }} />
                  <p style={{ margin: 0, fontWeight: 600 }}>No nodes yet</p>
                  <p style={{ margin: '4px 0 0', fontSize: 13 }}>Click "Add Root" to start building your location tree.</p>
                </div>
              ) : (
                <HierarchyRows
                  nodes={hierarchyNodes}
                  depth={0}
                  onChange={applyNodeChange}
                  onAddChild={addChildNode}
                  onRemove={removeNode}
                />
              )}
            </div>

            {/* Save button */}
            <button
              type="submit"
              disabled={savingHierarchy || !selectedWarehouseId}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '12px 28px', border: 'none', borderRadius: 12,
                background: savingHierarchy || !selectedWarehouseId
                  ? '#94a3b8'
                  : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                color: '#ffffff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                boxShadow: savingHierarchy || !selectedWarehouseId
                  ? 'none'
                  : '0 4px 14px rgba(37,99,235,0.25)',
                opacity: savingHierarchy || !selectedWarehouseId ? 0.7 : 1,
                transition: 'all 200ms ease'
              }}
            >
              <Plus size={16} />
              <span>{savingHierarchy ? 'Saving...' : 'Save Hierarchy'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Current Location Tree Card */}
      <div style={s.card}>
        <div style={s.cardHeader}>
          <h2 style={s.cardTitle}>
            <MapPin size={18} style={{ color: '#10b981' }} />
            Current Location Tree
          </h2>
          {selectedWarehouse?.locations?.length > 0 && (
            <span style={s.nodeCount}>
              {selectedWarehouse.locations.length} locations
            </span>
          )}
        </div>
        <div style={s.cardBody}>
          {loading ? (
            <div style={s.emptyState}>Loading warehouses...</div>
          ) : !selectedWarehouse ? (
            <div style={s.emptyState}>
              <MapPin size={24} style={{ color: '#93c5fd', marginBottom: 8 }} />
              <p style={{ margin: 0, fontWeight: 600 }}>No warehouse selected</p>
              <p style={{ margin: '4px 0 0', fontSize: 13 }}>Choose a warehouse above to view its location hierarchy.</p>
            </div>
          ) : !selectedWarehouse.locations?.length ? (
            <div style={s.emptyState}>
              <MapPin size={24} style={{ color: '#93c5fd', marginBottom: 8 }} />
              <p style={{ margin: 0, fontWeight: 600 }}>No locations in {selectedWarehouse.name}</p>
              <p style={{ margin: '4px 0 0', fontSize: 13 }}>Use the hierarchy builder above to add your first locations.</p>
            </div>
          ) : (
            <LocationTreeView nodes={currentTree} />
          )}
        </div>
      </div>

      {/* Locations Table Card */}
      <div style={s.card}>
        <div style={s.cardHeader}>
          <h2 style={s.cardTitle}>Locations Table</h2>
        </div>
        {loading ? (
          <div style={{ ...s.cardBody, ...s.emptyState, margin: 20 }}>Loading...</div>
        ) : !selectedWarehouse ? (
          <div style={{ ...s.cardBody, ...s.emptyState, margin: 20 }}>Select a warehouse.</div>
        ) : !selectedWarehouse.locations?.length ? (
          <div style={{ ...s.cardBody, ...s.emptyState, margin: 20 }}>No locations yet.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Name</th>
                  <th style={s.th}>Code</th>
                  <th style={s.th}>Type</th>
                  <th style={s.th}>Parent</th>
                  <th style={s.th}>Status</th>
                  <th style={s.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {selectedWarehouse.locations.map((loc) => (
                  <tr key={loc._id}>
                    <td style={{ ...s.td, fontWeight: 600 }}>{loc.name}</td>
                    <td style={{ ...s.td, fontFamily: 'Consolas, Monaco, monospace', fontSize: 13 }}>{loc.code}</td>
                    <td style={s.td}>
                      <span style={typeBadgeStyle(loc.type)}>{loc.type || 'location'}</span>
                    </td>
                    <td style={{ ...s.td, color: loc.parentCode ? '#15304f' : '#94a3b8' }}>
                      {loc.parentCode || '—'}
                    </td>
                    <td style={s.td}>
                      <span style={s.statusBadge(loc.isActive)}>
                        {loc.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td style={s.td}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button style={s.actionBtn('ghost')} type="button" onClick={() => toggleLocationStatus(loc)}>
                          {loc.isActive ? 'Disable' : 'Enable'}
                        </button>
                        <button style={s.actionBtn('danger')} type="button" onClick={() => handleDeleteLocation(loc)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
