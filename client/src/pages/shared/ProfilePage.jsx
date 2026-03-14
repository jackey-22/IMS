import { useEffect, useMemo, useState } from "react";
import { Mail, Shield, UserCircle2, KeyRound, CheckCircle2, Save, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { changeMyPassword, getMyProfile, updateMyProfile } from "../../services/profileApi.js";
import { isValidEmail, isValidPassword, passwordHint } from "../../services/authApi.js";

const roleLabel = (role) => {
  if (role === "admin") return "Administrator";
  if (role === "warehouse_staff") return "Warehouse Staff";
  if (role === "inventory_manager") return "Inventory Manager";
  return role || "User";
};

export default function ProfilePage() {
  const { session, setSession } = useAuth();
  const token = session?.token;

  const [profile, setProfile] = useState(session?.user || null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState(null);

  const [profileForm, setProfileForm] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || ""
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const payload = await getMyProfile(token);
        setProfile(payload.user);
        setProfileForm({
          name: payload.user.name || "",
          email: payload.user.email || ""
        });
        setSession((prev) => (prev ? { ...prev, user: payload.user } : prev));
      } catch (err) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadProfile();
    }
  }, [token, setSession]);

  const initials = useMemo(() => {
    const source = (profile?.name || profile?.loginId || "U").trim();
    return source
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [profile?.loginId, profile?.name]);

  const pushFeedback = (type, text) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) return pushFeedback("error", "Name is required.");
    if (!isValidEmail(profileForm.email.trim())) return pushFeedback("error", "Invalid email format.");

    setSavingProfile(true);
    try {
      const payload = await updateMyProfile(token, {
        name: profileForm.name.trim(),
        email: profileForm.email.trim()
      });
      setProfile(payload.user);
      setSession((prev) => (prev ? { ...prev, user: payload.user } : prev));
      pushFeedback("success", "Profile updated successfully.");
    } catch (err) {
      pushFeedback("error", err.message || "Update failed.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      return pushFeedback("error", "All fields are required.");
    }
    if (!isValidPassword(passwordForm.newPassword)) return pushFeedback("error", passwordHint);
    if (passwordForm.newPassword !== passwordForm.confirmPassword) return pushFeedback("error", "Passwords do not match.");

    setSavingPassword(true);
    try {
      await changeMyPassword(token, passwordForm);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      pushFeedback("success", "Password updated successfully.");
    } catch (err) {
      pushFeedback("error", err.message || "Password update failed.");
    } finally {
      setSavingPassword(false);
    }
  };

  const styles = {
    heading: { fontSize: "24px", fontWeight: 700, color: "#111827", margin: "0 0 24px 0" },
    card: {
      background: "#ffffff",
      borderRadius: "12px",
      border: "1px solid #e5e7eb",
      boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
      overflow: "hidden",
      marginBottom: "24px"
    },
    cardHeader: {
        padding: "16px 24px",
        borderBottom: "1px solid #e5e7eb",
        fontSize: "16px",
        fontWeight: "600",
        background: "#f9fafb"
    },
    cardBody: { padding: "24px" },
    avatar: {
      width: "80px",
      height: "80px",
      borderRadius: "50%",
      background: "#3b82f6",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontSize: "28px",
      fontWeight: 700,
      margin: "0 auto 16px"
    },
    inputGroup: { marginBottom: "16px" },
    label: { display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "6px" },
    input: {
      width: "100%",
      padding: "10px 14px",
      borderRadius: "8px",
      border: "1px solid #d1d5db",
      fontSize: "14px",
      outline: "none",
      transition: "border-color 0.2s"
    },
    btnPrimary: {
      background: "#111827",
      color: "#ffffff",
      padding: "10px 20px",
      borderRadius: "8px",
      border: "none",
      fontWeight: "600",
      fontSize: "14px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "8px"
    }
  };

  if (loading && !profile) {
    return <div style={{ padding: "40px", textAlign: "center" }}><Loader2 className="animate-spin" style={{ margin: "auto" }} /></div>;
  }

  return (
    <div style={{ maxWidth: "1000px" }}>
      <h1 style={styles.heading}>User Profile</h1>

      {feedback && (
        <div style={{ 
          padding: "12px 16px", 
          borderRadius: "8px", 
          marginBottom: "20px", 
          background: feedback.type === 'success' ? '#ecfdf5' : '#fef2f2',
          border: `1px solid ${feedback.type === 'success' ? '#10b981' : '#ef4444'}`,
          color: feedback.type === 'success' ? '#065f46' : '#991b1b',
          fontSize: "14px"
        }}>
          {feedback.text}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "24px" }}>
        {/* Sidebar */}
        <div>
          <div style={{ ...styles.card, padding: "32px", textAlign: "center" }}>
            <div style={styles.avatar}>{initials}</div>
            <h2 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 4px" }}>{profile?.name}</h2>
            <p style={{ color: "#6b7280", margin: "0 0 20px", fontSize: "14px" }}>{roleLabel(profile?.role)}</p>
            
            <div style={{ textAlign: "left", paddingTop: "20px", borderTop: "1px solid #f3f4f6", display: "grid", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px" }}>
                    <Mail size={14} color="#6b7280" /> <span>{profile?.email}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px" }}>
                    <Shield size={14} color="#6b7280" /> <span>Login ID: {profile?.loginId}</span>
                </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div>
          <div style={styles.card}>
            <div style={styles.cardHeader}>Personal Information</div>
            <div style={styles.cardBody}>
              <form onSubmit={handleProfileSubmit}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Full Name</label>
                  <input 
                    value={profileForm.name} 
                    onChange={(e) => setProfileForm(p => ({ ...p, name: e.target.value }))} 
                    style={styles.input} 
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Email Address</label>
                  <input 
                    type="email" 
                    value={profileForm.email} 
                    onChange={(e) => setProfileForm(p => ({ ...p, email: e.target.value }))} 
                    style={styles.input} 
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button type="submit" style={styles.btnPrimary} disabled={savingProfile}>
                    <Save size={16} /> {savingProfile ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardHeader}>Security</div>
            <div style={styles.cardBody}>
              <form onSubmit={handlePasswordSubmit}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Current Password</label>
                  <input 
                    type="password" 
                    value={passwordForm.currentPassword} 
                    onChange={(e) => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))} 
                    style={styles.input} 
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                   <div>
                      <label style={styles.label}>New Password</label>
                      <input 
                        type="password" 
                        value={passwordForm.newPassword} 
                        onChange={(e) => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))} 
                        style={styles.input} 
                        placeholder={passwordHint}
                      />
                   </div>
                   <div>
                      <label style={styles.label}>Confirm New Password</label>
                      <input 
                        type="password" 
                        value={passwordForm.confirmPassword} 
                        onChange={(e) => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))} 
                        style={styles.input} 
                      />
                   </div>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button type="submit" style={styles.btnPrimary} disabled={savingPassword}>
                    <KeyRound size={16} /> {savingPassword ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
