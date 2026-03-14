import { useEffect, useMemo, useState } from "react";
import {
  Mail,
  Shield,
  UserCircle2,
  KeyRound,
  CheckCircle2,
  CalendarDays,
  Sparkles,
  Lock,
  Save,
  BadgeCheck
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { changeMyPassword, getMyProfile, updateMyProfile } from "../../services/profileApi.js";
import { isValidEmail, isValidPassword, passwordHint } from "../../services/authApi.js";

const roleLabel = (role) => {
  if (role === "admin") return "Administrator";
  if (role === "warehouse_staff") return "Warehouse Staff";
  if (role === "inventory_manager") return "Inventory Manager";
  return role || "User";
};

const formatDate = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit"
  });
};

export default function AdminProfilePage() {
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
    page: {
      display: "grid",
      gap: "20px"
    },
    hero: {
      borderRadius: "18px",
      border: "1px solid #dbe3f1",
      background: "linear-gradient(120deg, #0f172a 0%, #1d4ed8 55%, #0ea5e9 100%)",
      color: "#f8fafc",
      padding: "24px",
      boxShadow: "0 12px 30px rgba(15, 23, 42, 0.2)"
    },
    heroTop: {
      display: "grid",
      gridTemplateColumns: "auto 1fr",
      gap: "18px",
      alignItems: "center"
    },
    heroAvatar: {
      width: "72px",
      height: "72px",
      borderRadius: "18px",
      background: "rgba(255,255,255,0.17)",
      backdropFilter: "blur(2px)",
      display: "grid",
      placeItems: "center",
      fontWeight: 800,
      fontSize: "26px"
    },
    statGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
      gap: "10px",
      marginTop: "16px"
    },
    stat: {
      border: "1px solid rgba(255,255,255,0.22)",
      borderRadius: "12px",
      padding: "10px 12px",
      background: "rgba(255,255,255,0.1)"
    },
    contentGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
      gap: "18px"
    },
    card: {
      background: "#ffffff",
      border: "1px solid #e2e8f0",
      borderRadius: "16px",
      boxShadow: "0 8px 18px rgba(15, 23, 42, 0.06)",
      overflow: "hidden"
    },
    cardHeader: {
      padding: "14px 16px",
      borderBottom: "1px solid #e2e8f0",
      background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontWeight: 700,
      color: "#0f172a"
    },
    cardBody: {
      padding: "16px",
      display: "grid",
      gap: "12px"
    },
    field: {
      display: "grid",
      gap: "6px"
    },
    label: {
      fontSize: "12px",
      fontWeight: 700,
      color: "#334155",
      textTransform: "uppercase",
      letterSpacing: "0.03em"
    },
    input: {
      width: "100%",
      padding: "12px 12px",
      borderRadius: "10px",
      border: "1px solid #cbd5e1",
      fontSize: "14px",
      outline: "none",
      background: "#ffffff"
    },
    mutedInput: {
      width: "100%",
      padding: "12px 12px",
      borderRadius: "10px",
      border: "1px solid #e2e8f0",
      fontSize: "14px",
      background: "#f8fafc",
      color: "#64748b"
    },
    primaryButton: {
      minHeight: "42px",
      padding: "0 14px",
      borderRadius: "10px",
      border: "1px solid #0f172a",
      background: "#0f172a",
      color: "#fff",
      fontWeight: 700,
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      gap: "8px"
    },
    secondaryButton: {
      minHeight: "42px",
      padding: "0 14px",
      borderRadius: "10px",
      border: "1px solid #cbd5e1",
      background: "#fff",
      color: "#0f172a",
      fontWeight: 700,
      cursor: "pointer"
    },
    infoRow: {
      display: "grid",
      gap: "10px"
    },
    infoItem: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      color: "#0f172a",
      fontSize: "14px",
      padding: "10px 12px",
      borderRadius: "10px",
      border: "1px solid #e2e8f0",
      background: "#f8fafc"
    }
  };

  return (
    <div style={styles.page}>
      {feedback && <div className={`feedback ${feedback.type}`}>{feedback.text}</div>}
      {error && <div className="feedback error">{error}</div>}

      <section style={styles.hero}>
        <div style={styles.heroTop}>
          <div style={styles.heroAvatar}>{initials}</div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <Sparkles size={16} />
              <span style={{ fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.9 }}>
                Admin Profile Center
              </span>
            </div>
            <h1 style={{ margin: 0, fontSize: "26px", fontWeight: 800 }}>{profile?.name || "Loading..."}</h1>
            <p style={{ margin: "4px 0 0", opacity: 0.9 }}>{roleLabel(profile?.role)} · {profile?.email || "-"}</p>
          </div>
        </div>

        <div style={styles.statGrid}>
          <div style={styles.stat}>
            <div style={{ fontSize: "11px", opacity: 0.85 }}>Login ID</div>
            <div style={{ fontWeight: 700, marginTop: "3px" }}>{profile?.loginId || "-"}</div>
          </div>
          <div style={styles.stat}>
            <div style={{ fontSize: "11px", opacity: 0.85 }}>Account Status</div>
            <div style={{ fontWeight: 700, marginTop: "3px" }}>{profile?.isActive ? "Active" : "Disabled"}</div>
          </div>
          <div style={styles.stat}>
            <div style={{ fontSize: "11px", opacity: 0.85 }}>Created</div>
            <div style={{ fontWeight: 700, marginTop: "3px" }}>{formatDate(profile?.createdAt)}</div>
          </div>
        </div>
      </section>

      <section style={styles.contentGrid}>
        <article style={styles.card}>
          <div style={styles.cardHeader}>
            <BadgeCheck size={16} /> Profile Details
          </div>
          <form onSubmit={handleProfileSubmit} style={styles.cardBody}>
            <div style={styles.field}>
              <label htmlFor="profile-name" style={styles.label}>Full Name</label>
              <input
                id="profile-name"
                name="name"
                value={profileForm.name}
                onChange={onProfileChange}
                style={styles.input}
                disabled={loading}
              />
            </div>

            <div style={styles.field}>
              <label htmlFor="profile-email" style={styles.label}>Email</label>
              <input
                id="profile-email"
                name="email"
                type="email"
                value={profileForm.email}
                onChange={onProfileChange}
                style={styles.input}
                disabled={loading}
              />
            </div>

            <div style={styles.field}>
              <label htmlFor="profile-login" style={styles.label}>Login ID</label>
              <input id="profile-login" value={profile?.loginId || ""} style={styles.mutedInput} disabled />
            </div>

            <button type="submit" style={styles.primaryButton} disabled={savingProfile || loading}>
              <Save size={16} /> {savingProfile ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </article>

        <article style={styles.card}>
          <div style={styles.cardHeader}>
            <Lock size={16} /> Security
          </div>
          <form onSubmit={handlePasswordSubmit} style={styles.cardBody}>
            <div style={styles.field}>
              <label htmlFor="currentPassword" style={styles.label}>Current Password</label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={onPasswordChange}
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label htmlFor="newPassword" style={styles.label}>New Password</label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={onPasswordChange}
                style={styles.input}
                placeholder={passwordHint}
              />
            </div>

            <div style={styles.field}>
              <label htmlFor="confirmPassword" style={styles.label}>Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={onPasswordChange}
                style={styles.input}
              />
            </div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button type="submit" style={styles.primaryButton} disabled={savingPassword}>
                <KeyRound size={16} /> {savingPassword ? "Updating..." : "Change Password"}
              </button>
              <button
                type="button"
                style={styles.secondaryButton}
                onClick={() => setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })}
              >
                Clear
              </button>
            </div>
          </form>
        </article>

        <article style={styles.card}>
          <div style={styles.cardHeader}>
            <UserCircle2 size={16} /> Account Snapshot
          </div>
          <div style={styles.cardBody}>
            <div style={styles.infoRow}>
              <div style={styles.infoItem}><Mail size={16} color="#475569" /> {profile?.email || "-"}</div>
              <div style={styles.infoItem}><Shield size={16} color="#475569" /> {roleLabel(profile?.role)}</div>
              <div style={styles.infoItem}><CheckCircle2 size={16} color="#475569" /> {profile?.isActive ? "Account Active" : "Account Disabled"}</div>
              <div style={styles.infoItem}><CalendarDays size={16} color="#475569" /> Joined {formatDate(profile?.createdAt)}</div>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
