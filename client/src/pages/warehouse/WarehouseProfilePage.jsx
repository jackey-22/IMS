import { Mail, Shield, MapPin, Bell, Key } from "lucide-react";

export default function WarehouseProfilePage() {
  const commonStyles = {
    h1: { fontSize: "24px", fontWeight: "700", color: "#111827", margin: 0 },
    card: { background: "#ffffff", borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)", overflow: "hidden" },
    btnSecondary: { background: "white", color: "#111827", border: "1px solid #e5e7eb", padding: "8px 16px", borderRadius: "8px", fontWeight: "600", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" },
    avatar: { width: "100px", height: "100px", borderRadius: "50%", background: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "32px", fontWeight: "600" }
  };

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={commonStyles.h1}>My Profile</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: "24px" }}>
        <div style={{ ...commonStyles.card, padding: "32px", textAlign: "center" }}>
          <div style={{ ...commonStyles.avatar, margin: "0 auto 20px auto" }}>JD</div>
          <h2 style={{ fontSize: "20px", fontWeight: "700", margin: "0 0 8px 0" }}>John Doe</h2>
          <p style={{ color: "#6b7280", margin: "0 0 24px 0" }}>Warehouse Staff</p>
          
          <div style={{ textAlign: "left", paddingTop: "24px", borderTop: "1px solid #e5e7eb", display: "grid", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14px" }}>
              <Mail size={16} color="#6b7280" /> <span>john.doe@ims.com</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14px" }}>
              <Shield size={16} color="#6b7280" /> <span>Staff ID: WH-7729</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14px" }}>
              <MapPin size={16} color="#6b7280" /> <span>Main Warehouse</span>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gap: "24px" }}>
          <div style={commonStyles.card}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #e5e7eb", fontWeight: "600" }}>Account Settings</div>
            <div style={{ padding: "24px", display: "grid", gap: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: "600" }}>Change Password</div>
                  <div style={{ fontSize: "13px", color: "#6b7280" }}>Update regularly</div>
                </div>
                <button style={commonStyles.btnSecondary}><Key size={16} /> Update</button>
              </div>
            </div>
          </div>
          
          <div style={commonStyles.card}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #e5e7eb", fontWeight: "600" }}>Assigned Duties</div>
            <div style={{ padding: "24px" }}>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: "12px" }}>
                <li style={{ padding: "12px", background: "#f9fafb", borderRadius: "8px", fontSize: "14px" }}>✅ Inbound Receipt Verification</li>
                <li style={{ padding: "12px", background: "#f9fafb", borderRadius: "8px", fontSize: "14px" }}>✅ Weekly Cycle Counting</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
