import { useEffect, useState } from "react";
import { 
  Search, 
  CheckCircle,
  Loader2,
  PackagePlus,
  RefreshCw,
  X,
  AlertCircle
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { listReceipts, confirmReceiptApi } from "../../services/operationsApi.js";

export default function ReceiptsPage() {
  const { session } = useAuth();
  const token = session?.token;

  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(null);
  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState(null);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const data = await listReceipts(token);
      setReceipts(data);
    } catch (err) {
      console.error(err);
      setFeedback({ type: "error", message: err.message || "Failed to load receipts" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchReceipts();
    }
  }, [token]);

  const openModal = (receipt) => {
    setSelectedReceipt(receipt);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedReceipt(null);
  };

  const handleConfirm = async () => {
    if (!selectedReceipt) return;
    
    try {
      setConfirming(selectedReceipt.id);
      await confirmReceiptApi(token, selectedReceipt.id);
      setFeedback({ type: "success", message: `Receipt ${selectedReceipt.reference} confirmed successfully` });
      closeModal();
      fetchReceipts();
    } catch (err) {
      setFeedback({ type: "error", message: err.message || "Confirmation failed" });
    } finally {
      setConfirming(null);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const filteredReceipts = receipts.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.reference.toLowerCase().includes(q) ||
      r.productName.toLowerCase().includes(q) ||
      (r.from && r.from.toLowerCase().includes(q))
    );
  });

  const commonStyles = {
    titleSection: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" },
    h1: { fontSize: "24px", fontWeight: "700", color: "#111827", margin: 0 },
    btnPrimary: { background: "#3b82f6", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "600", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" },
    btnSecondary: { background: "white", color: "#111827", border: "1px solid #e5e7eb", padding: "8px 16px", borderRadius: "8px", fontWeight: "600", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" },
    card: { background: "#ffffff", borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)", overflow: "hidden" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: { textAlign: "left", padding: "16px 24px", background: "#f9fafb", color: "#6b7280", fontWeight: "600", fontSize: "13px", textTransform: "uppercase" },
    td: { padding: "16px 24px", borderBottom: "1px solid #e5e7eb", fontSize: "14px", color: "#111827" },
    statusBadge: (status) => {
      const isDone = status === 'done';
      return {
        padding: "4px 10px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: "600",
        background: isDone ? "#d1fae5" : "#fff7ed",
        color: isDone ? "#065f46" : "#9a3412",
        textTransform: "capitalize"
      };
    },
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000
    },
    modal: {
      backgroundColor: "#ffffff",
      borderRadius: "16px",
      width: "480px",
      padding: "32px",
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
      position: "relative"
    }
  };

  return (
    <div>
      <div style={commonStyles.titleSection}>
        <div>
          <h1 style={commonStyles.h1}>Warehouse Receipts</h1>
          <p style={{ color: "#6b7280", fontSize: "14px", margin: "4px 0 0 0" }}>Process incoming goods against manager orders.</p>
        </div>
      </div>

      {feedback && (
        <div style={{ 
          padding: "12px 16px", 
          borderRadius: "8px", 
          marginBottom: "20px",
          background: feedback.type === 'success' ? '#ecfdf5' : '#fef2f2',
          border: `1px solid ${feedback.type === 'success' ? '#10b981' : '#ef4444'}`,
          color: feedback.type === 'success' ? '#065f46' : '#991b1b',
          fontSize: "14px",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          {feedback.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {feedback.message}
        </div>
      )}

      <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
        <div style={{ flex: 1, display: "flex", background: "white", padding: "8px 16px", borderRadius: "8px", border: "1px solid #e5e7eb", alignItems: "center", gap: "8px" }}>
          <Search size={18} color="#6b7280" />
          <input
            placeholder="Search by ID, Product or Source..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: "none", outline: "none", width: "100%", fontSize: "14px" }}
          />
        </div>
        <button onClick={fetchReceipts} style={commonStyles.btnSecondary}><RefreshCw size={18} /> Refresh</button>
      </div>

      <div style={commonStyles.card}>
        {loading && !receipts.length ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
            <Loader2 className="animate-spin" style={{ margin: "0 auto 12px auto" }} />
            Loading receipts...
          </div>
        ) : (
          <table style={commonStyles.table}>
            <thead>
              <tr>
                <th style={commonStyles.th}>Receipt No</th>
                <th style={commonStyles.th}>From → To</th>
                <th style={commonStyles.th}>Product Details</th>
                <th style={commonStyles.th}>Quantity</th>
                <th style={commonStyles.th}>Status</th>
                <th style={commonStyles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredReceipts.map((r) => (
                <tr key={r.id}>
                  <td style={{ ...commonStyles.td, fontWeight: "600", color: "#2563eb" }}>{r.reference}</td>
                  <td style={commonStyles.td}>
                    <div style={{ fontSize: "13px" }}>
                      <span style={{ color: "#6b7280" }}>From:</span> {r.from}
                    </div>
                    <div style={{ fontSize: "13px", marginTop: "4px" }}>
                      <span style={{ color: "#6b7280" }}>To:</span> {r.to}
                    </div>
                  </td>
                  <td style={commonStyles.td}>{r.productName}</td>
                  <td style={{ ...commonStyles.td, fontWeight: "700" }}>{r.quantity}</td>
                  <td style={commonStyles.td}>
                    <span style={commonStyles.statusBadge(r.status)}>
                      {r.status}
                    </span>
                  </td>
                  <td style={commonStyles.td}>
                    {r.status === 'done' ? (
                      <div style={{ color: "#10b981", display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", fontWeight: "600" }}>
                        <CheckCircle size={16} /> Confirmed
                      </div>
                    ) : (
                      <button 
                        onClick={() => openModal(r)} 
                        style={{ ...commonStyles.btnPrimary, padding: "6px 14px", fontSize: "13px" }}
                      >
                        <PackagePlus size={16} /> Confirm Receipt
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredReceipts.length === 0 && !loading && (
                <tr>
                  <td colSpan="6" style={{ ...commonStyles.td, textAlign: "center", padding: "40px", color: "#9ca3af" }}>
                    No pending receipts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Confirmation Modal */}
      {modalOpen && selectedReceipt && (
        <div style={commonStyles.overlay} onClick={closeModal}>
          <div style={commonStyles.modal} onClick={e => e.stopPropagation()}>
            <button 
              onClick={closeModal} 
              style={{ position: "absolute", top: "20px", right: "20px", border: "none", background: "none", cursor: "pointer", color: "#9ca3af" }}
            >
              <X size={20} />
            </button>
            
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <div style={{ 
                width: "64px", 
                height: "64px", 
                backgroundColor: "#eff6ff", 
                borderRadius: "50%", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                margin: "0 auto 16px",
                color: "#3b82f6"
              }}>
                <PackagePlus size={32} />
              </div>
              <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#111827", margin: "0 0 8px" }}>Confirm Receipt</h2>
              <p style={{ color: "#6b7280", fontSize: "14px", lineHeight: "1.5" }}>
                You are about to confirm the arrival of <strong>{selectedReceipt.quantity} units</strong> of <strong>{selectedReceipt.productName}</strong>. 
                This will automatically update the system stock.
              </p>
            </div>

            <div style={{ backgroundColor: "#f9fafb", borderRadius: "12px", padding: "16px", marginBottom: "24px" }}>
               <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                 <span style={{ fontSize: "13px", color: "#6b7280" }}>Reference</span>
                 <span style={{ fontSize: "13px", fontWeight: "600", color: "#111827" }}>{selectedReceipt.reference}</span>
               </div>
               <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                 <span style={{ fontSize: "13px", color: "#6b7280" }}>Source</span>
                 <span style={{ fontSize: "13px", fontWeight: "600", color: "#111827" }}>{selectedReceipt.from}</span>
               </div>
               <div style={{ display: "flex", justifyContent: "space-between" }}>
                 <span style={{ fontSize: "13px", color: "#6b7280" }}>Destination</span>
                 <span style={{ fontSize: "13px", fontWeight: "600", color: "#111827" }}>{selectedReceipt.to}</span>
               </div>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button 
                onClick={closeModal} 
                style={{ ...commonStyles.btnSecondary, flex: 1, justifyContent: "center" }}
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirm} 
                disabled={confirming}
                style={{ ...commonStyles.btnPrimary, flex: 1, justifyContent: "center" }}
              >
                {confirming ? "Processing..." : "Confirm & Update Stock"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
