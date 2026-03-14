import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  listUsers,
  createUser,
  updateUserRole,
  updateUserStatus,
  resetUserPassword,
  deleteUser
} from "../../services/usersApi.js";
import {
  isValidEmail,
  isValidLoginId,
  isValidPassword,
  passwordHint
} from "../../services/authApi.js";

const ROLES = [
  { value: "admin", label: "Admin" },
  { value: "inventory_manager", label: "Inventory Manager" },
  { value: "warehouse_staff", label: "Warehouse Staff" }
];

const roleLabel = (role) => ROLES.find((r) => r.value === role)?.label ?? role;

const EMPTY_FORM = {
  name: "",
  loginId: "",
  email: "",
  password: "",
  role: "inventory_manager"
};

export default function UsersPage() {
  const navigate = useNavigate();
  const { session, logout } = useAuth();
  const token = session?.token;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create user panel
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_FORM);
  const [createFeedback, setCreateFeedback] = useState(null);
  const [createSubmitting, setCreateSubmitting] = useState(false);

  // Inline action feedback keyed by user id
  const [actionFeedback, setActionFeedback] = useState({});
  const [pendingAction, setPendingAction] = useState({});

  // Reset password modal
  const [resetModal, setResetModal] = useState(null); // { id, name }
  const [resetPw, setResetPw] = useState("");
  const [resetFeedback, setResetFeedback] = useState(null);
  const [resetSubmitting, setResetSubmitting] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const setFeedbackFor = (id, type, text) => {
    setActionFeedback((prev) => ({ ...prev, [id]: { type, text } }));
    setTimeout(() => setActionFeedback((prev) => { const n = { ...prev }; delete n[id]; return n; }), 3500);
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listUsers(token);
      setUsers(data);
    } catch (err) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // --- Create user ---
  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setCreateForm((c) => ({ ...c, [name]: value }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createForm.name.trim()) {
      setCreateFeedback({ type: "error", text: "Enter a full name." });
      return;
    }
    if (!isValidLoginId(createForm.loginId.trim())) {
      setCreateFeedback({ type: "error", text: "Login ID must be 6–24 chars (letters, numbers, - or _)." });
      return;
    }
    if (!isValidEmail(createForm.email.trim())) {
      setCreateFeedback({ type: "error", text: "Enter a valid email address." });
      return;
    }
    if (!isValidPassword(createForm.password)) {
      setCreateFeedback({ type: "error", text: passwordHint });
      return;
    }
    setCreateSubmitting(true);
    setCreateFeedback(null);
    try {
      const newUser = await createUser(token, {
        name: createForm.name.trim(),
        loginId: createForm.loginId.trim(),
        email: createForm.email.trim(),
        password: createForm.password,
        role: createForm.role
      });
      setUsers((prev) => [newUser, ...prev]);
      setCreateForm(EMPTY_FORM);
      setShowCreate(false);
    } catch (err) {
      setCreateFeedback({ type: "error", text: err.message || "Failed to create user." });
    } finally {
      setCreateSubmitting(false);
    }
  };

  // --- Change role ---
  const handleRoleChange = async (id, role) => {
    setPendingAction((p) => ({ ...p, [id]: "role" }));
    try {
      const updated = await updateUserRole(token, id, role);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      setFeedbackFor(id, "success", "Role updated.");
    } catch (err) {
      setFeedbackFor(id, "error", err.message || "Failed to update role.");
    } finally {
      setPendingAction((p) => { const n = { ...p }; delete n[id]; return n; });
    }
  };

  // --- Toggle status ---
  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = !currentStatus;
    setPendingAction((p) => ({ ...p, [id]: "status" }));
    try {
      const updated = await updateUserStatus(token, id, newStatus);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      setFeedbackFor(id, "success", newStatus ? "Account enabled." : "Account disabled.");
    } catch (err) {
      setFeedbackFor(id, "error", err.message || "Failed to update status.");
    } finally {
      setPendingAction((p) => { const n = { ...p }; delete n[id]; return n; });
    }
  };

  // --- Delete user ---
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    setPendingAction((p) => ({ ...p, [id]: "delete" }));
    try {
      await deleteUser(token, id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      setFeedbackFor(id, "error", err.message || "Failed to delete user.");
      setPendingAction((p) => { const n = { ...p }; delete n[id]; return n; });
    }
  };

  // --- Reset password ---
  const openResetModal = (id, name) => {
    setResetModal({ id, name });
    setResetPw("");
    setResetFeedback(null);
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!isValidPassword(resetPw)) {
      setResetFeedback({ type: "error", text: passwordHint });
      return;
    }
    setResetSubmitting(true);
    setResetFeedback(null);
    try {
      await resetUserPassword(token, resetModal.id, resetPw);
      setResetFeedback({ type: "success", text: "Password reset successfully." });
      setTimeout(() => { setResetModal(null); setResetPw(""); setResetFeedback(null); }, 1200);
    } catch (err) {
      setResetFeedback({ type: "error", text: err.message || "Failed to reset password." });
    } finally {
      setResetSubmitting(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="dashboard-layout">
        <header className="dashboard-header">
          <div>
            <span className="muted">CoreInventory</span>
            <h1 className="dashboard-title">User Management</h1>
          </div>
          <div className="button-row">
            <Link to="/dashboard" className="ghost-button">Dashboard</Link>
            <button className="ghost-button" type="button" onClick={handleLogout}>Log out</button>
          </div>
        </header>

        <section className="dashboard-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
            <h2 className="card-title" style={{ margin: 0 }}>All Users</h2>
            <button
              className="button"
              type="button"
              onClick={() => { setShowCreate((v) => !v); setCreateFeedback(null); }}
            >
              {showCreate ? "Cancel" : "+ New User"}
            </button>
          </div>

          {showCreate && (
            <form className="form" onSubmit={handleCreateSubmit} style={{ marginBottom: "24px", padding: "20px", background: "var(--surface-soft)", borderRadius: "16px", border: "1px solid var(--line)" }}>
              <h3 style={{ margin: "0 0 4px", fontFamily: "var(--font-display, Sora)", fontSize: "1rem" }}>Create New User</h3>
              {createFeedback && <div className={`feedback ${createFeedback.type}`}>{createFeedback.text}</div>}
              <div className="split-form" style={{ gap: "14px" }}>
                <div className="field">
                  <label htmlFor="cu-name">Full Name</label>
                  <input id="cu-name" name="name" value={createForm.name} onChange={handleCreateChange} placeholder="Full name" />
                </div>
                <div className="field">
                  <label htmlFor="cu-loginId">Login ID</label>
                  <input id="cu-loginId" name="loginId" value={createForm.loginId} onChange={handleCreateChange} placeholder="6–24 chars" autoComplete="off" />
                </div>
                <div className="field">
                  <label htmlFor="cu-email">Email</label>
                  <input id="cu-email" name="email" type="email" value={createForm.email} onChange={handleCreateChange} placeholder="user@example.com" autoComplete="off" />
                </div>
                <div className="field">
                  <label htmlFor="cu-password">Password</label>
                  <input id="cu-password" name="password" type="password" value={createForm.password} onChange={handleCreateChange} placeholder={passwordHint} autoComplete="new-password" />
                </div>
                <div className="field">
                  <label htmlFor="cu-role">Role</label>
                  <select id="cu-role" name="role" value={createForm.role} onChange={handleCreateChange} style={{ padding: "14px 16px", borderRadius: "16px", border: "1px solid rgba(24,52,87,0.12)", background: "#fff", color: "var(--navy-900)", font: "inherit" }}>
                    {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
              </div>
              <button className="button" type="submit" disabled={createSubmitting} style={{ justifySelf: "start" }}>
                {createSubmitting ? "Creating..." : "Create User"}
              </button>
            </form>
          )}

          {loading && <p className="muted">Loading users…</p>}
          {error && <div className="feedback error">{error}</div>}

          {!loading && !error && users.length === 0 && (
            <p className="muted">No other users found.</p>
          )}

          {!loading && !error && users.length > 0 && (
            <div className="users-table-wrap">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Login ID</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const busy = !!pendingAction[user.id];
                    const fb = actionFeedback[user.id];
                    return (
                      <tr key={user.id} style={{ opacity: busy ? 0.6 : 1 }}>
                        <td>
                          <div style={{ fontWeight: 700 }}>{user.name}</div>
                          <div style={{ fontSize: "0.8rem", color: "var(--ink-soft)" }}>{user.email}</div>
                          {fb && <div style={{ fontSize: "0.78rem", marginTop: "4px", color: fb.type === "success" ? "var(--success-text)" : "var(--error-text)", fontWeight: 600 }}>{fb.text}</div>}
                        </td>
                        <td style={{ fontFamily: "monospace", fontSize: "0.9rem" }}>{user.loginId}</td>
                        <td>
                          <select
                            value={user.role}
                            disabled={busy}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            style={{ padding: "6px 10px", borderRadius: "10px", border: "1px solid rgba(24,52,87,0.12)", background: "#fff", color: "var(--navy-900)", font: "inherit", fontSize: "0.85rem", cursor: "pointer" }}
                          >
                            {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                          </select>
                        </td>
                        <td>
                          <span style={{
                            display: "inline-block",
                            padding: "4px 12px",
                            borderRadius: "999px",
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            background: user.isActive ? "var(--success-bg)" : "var(--error-bg)",
                            color: user.isActive ? "var(--success-text)" : "var(--error-text)",
                            border: `1px solid ${user.isActive ? "var(--success-line)" : "var(--error-line)"}`
                          }}>
                            {user.isActive ? "Active" : "Disabled"}
                          </span>
                        </td>
                        <td>
                          <div className="button-row" style={{ gap: "8px" }}>
                            <button
                              className="ghost-button"
                              type="button"
                              disabled={busy}
                              onClick={() => handleToggleStatus(user.id, user.isActive)}
                              style={{ minHeight: "36px", padding: "0 12px", fontSize: "0.82rem" }}
                            >
                              {user.isActive ? "Disable" : "Enable"}
                            </button>
                            <button
                              className="ghost-button"
                              type="button"
                              disabled={busy}
                              onClick={() => openResetModal(user.id, user.name)}
                              style={{ minHeight: "36px", padding: "0 12px", fontSize: "0.82rem" }}
                            >
                              Reset PW
                            </button>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => handleDelete(user.id, user.name)}
                              style={{ minHeight: "36px", padding: "0 12px", fontSize: "0.82rem", border: "none", borderRadius: "999px", background: "var(--error-bg)", color: "var(--error-text)", fontWeight: 700, cursor: "pointer", border: "1px solid var(--error-line)", transition: "transform 140ms ease" }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {resetModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,30,55,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: "16px" }}>
          <div style={{ background: "#fff", borderRadius: "24px", padding: "32px", maxWidth: "400px", width: "100%", boxShadow: "var(--shadow-lg)" }}>
            <h2 style={{ margin: "0 0 6px", fontFamily: "Sora", letterSpacing: "-0.02em" }}>Reset Password</h2>
            <p className="muted" style={{ margin: "0 0 20px", fontSize: "0.9rem" }}>Set a new password for <strong>{resetModal.name}</strong>.</p>
            <form className="form" onSubmit={handleResetSubmit}>
              {resetFeedback && <div className={`feedback ${resetFeedback.type}`}>{resetFeedback.text}</div>}
              <div className="field">
                <label htmlFor="reset-pw">New Password</label>
                <input
                  id="reset-pw"
                  type="password"
                  value={resetPw}
                  onChange={(e) => setResetPw(e.target.value)}
                  placeholder={passwordHint}
                  autoComplete="new-password"
                  autoFocus
                />
              </div>
              <div className="button-row">
                <button className="button" type="submit" disabled={resetSubmitting}>
                  {resetSubmitting ? "Saving…" : "Save Password"}
                </button>
                <button
                  className="ghost-button"
                  type="button"
                  onClick={() => setResetModal(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
