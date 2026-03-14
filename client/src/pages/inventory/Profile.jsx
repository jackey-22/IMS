import { useEffect, useMemo, useState } from "react";
import { Mail, Shield, UserCircle2, KeyRound, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { changeMyPassword, getMyProfile, updateMyProfile } from "../../services/profileApi.js";
import { isValidEmail, isValidPassword, passwordHint } from "../../services/authApi.js";

const roleLabel = (role) => {
  if (role === "admin") return "Administrator";
  if (role === "warehouse_staff") return "Warehouse Staff";
  if (role === "inventory_manager") return "Inventory Manager";
  return role || "User";
};

export default function Profile() {
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
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [profile?.loginId, profile?.name]);

  const pushFeedback = (type, text) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 2800);
  };

  const onProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const onPasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      pushFeedback("error", "Name is required.");
      return;
    }
    if (!isValidEmail(profileForm.email.trim())) {
      pushFeedback("error", "Enter a valid email address.");
      return;
    }

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
      pushFeedback("error", err.message || "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      pushFeedback("error", "All password fields are required.");
      return;
    }
    if (!isValidPassword(passwordForm.newPassword)) {
      pushFeedback("error", passwordHint);
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      pushFeedback("error", "Passwords do not match.");
      return;
    }

    setSavingPassword(true);
    try {
      await changeMyPassword(token, passwordForm);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      pushFeedback("success", "Password updated successfully.");
    } catch (err) {
      pushFeedback("error", err.message || "Failed to update password.");
    } finally {
      setSavingPassword(false);
    }
  };

  const styles = {
    heading: { fontSize: "24px", fontWeight: 700, color: "#111827", margin: 0 },
    card: {
      background: "#ffffff",
      borderRadius: "12px",
      border: "1px solid #e5e7eb",
      boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
      overflow: "hidden"
    },
    avatar: {
      width: "100px",
      height: "100px",
      borderRadius: "50%",
      background: "#3b82f6",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontSize: "32px",
      fontWeight: 700,
      margin: "0 auto 20px"
    },
    input: {
      width: "100%",
      padding: "12px 14px",
      borderRadius: "10px",
      border: "1px solid #d1d5db",
      fontSize: "14px",
      outline: "none"
    },
    button: {
      minHeight: "42px",
      padding: "0 16px",
      borderRadius: "8px",
      border: "1px solid #111827",
      background: "#111827",
      color: "#fff",
      fontWeight: 600,
      cursor: "pointer"
    },
    helperButton: {
      minHeight: "42px",
      padding: "0 16px",
      borderRadius: "8px",
      border: "1px solid #e5e7eb",
      background: "#fff",
      color: "#111827",
      fontWeight: 600,
      cursor: "pointer"
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={styles.heading}>Manager Profile</h1>
      </div>

      {feedback && <div className={`feedback ${feedback.type}`} style={{ marginBottom: "14px" }}>{feedback.text}</div>}
      {error && <div className="feedback error" style={{ marginBottom: "14px" }}>{error}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: "24px" }}>
        <div style={{ ...styles.card, padding: "32px", textAlign: "center" }}>
          <div style={styles.avatar}>{initials}</div>
          <h2 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 8px" }}>{profile?.name || "Loading..."}</h2>
          <p style={{ color: "#6b7280", margin: "0 0 24px" }}>{roleLabel(profile?.role)}</p>

          <div style={{ textAlign: "left", paddingTop: "24px", borderTop: "1px solid #e5e7eb", display: "grid", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14px" }}>
              <Mail size={16} color="#6b7280" /> <span>{profile?.email || "-"}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14px" }}>
              <Shield size={16} color="#6b7280" /> <span>{roleLabel(profile?.role)}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14px" }}>
              <UserCircle2 size={16} color="#6b7280" /> <span>Login ID: {profile?.loginId || "-"}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14px" }}>
              <CheckCircle2 size={16} color="#6b7280" /> <span>{profile?.isActive ? "Account Active" : "Account Disabled"}</span>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gap: "24px" }}>
          <div style={styles.card}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #e5e7eb", fontWeight: 600 }}>Profile Details</div>
            <form onSubmit={handleProfileSubmit} style={{ padding: "24px", display: "grid", gap: "16px" }}>
              <div className="field" style={{ gap: "8px" }}>
                <label htmlFor="profile-name">Full Name</label>
                <input id="profile-name" name="name" value={profileForm.name} onChange={onProfileChange} style={styles.input} disabled={loading} />
              </div>
              <div className="field" style={{ gap: "8px" }}>
                <label htmlFor="profile-email">Email</label>
                <input id="profile-email" name="email" type="email" value={profileForm.email} onChange={onProfileChange} style={styles.input} disabled={loading} />
              </div>
              <div className="field" style={{ gap: "8px" }}>
                <label htmlFor="profile-login">Login ID</label>
                <input id="profile-login" value={profile?.loginId || ""} style={{ ...styles.input, background: "#f9fafb" }} disabled />
              </div>
              <div>
                <button type="submit" style={styles.button} disabled={savingProfile || loading}>
                  {savingProfile ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          </div>

          <div style={styles.card}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #e5e7eb", fontWeight: 600 }}>Security</div>
            <form onSubmit={handlePasswordSubmit} style={{ padding: "24px", display: "grid", gap: "16px" }}>
              <div className="field" style={{ gap: "8px" }}>
                <label htmlFor="currentPassword">Current Password</label>
                <input id="currentPassword" name="currentPassword" type="password" value={passwordForm.currentPassword} onChange={onPasswordChange} style={styles.input} />
              </div>
              <div className="field" style={{ gap: "8px" }}>
                <label htmlFor="newPassword">New Password</label>
                <input id="newPassword" name="newPassword" type="password" value={passwordForm.newPassword} onChange={onPasswordChange} style={styles.input} placeholder={passwordHint} />
              </div>
              <div className="field" style={{ gap: "8px" }}>
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input id="confirmPassword" name="confirmPassword" type="password" value={passwordForm.confirmPassword} onChange={onPasswordChange} style={styles.input} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <button type="submit" style={styles.button} disabled={savingPassword}>
                  <KeyRound size={16} style={{ marginRight: "8px", verticalAlign: "middle" }} />
                  {savingPassword ? "Updating..." : "Change Password"}
                </button>
                <button
                  type="button"
                  style={styles.helperButton}
                  onClick={() => setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })}
                >
                  Clear
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
