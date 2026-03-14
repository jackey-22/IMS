import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
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

const EMPTY_FORM = {
  name: "",
  loginId: "",
  email: "",
  password: "",
  role: "inventory_manager"
};

export default function UsersPage() {
  const { session } = useAuth();
  const token = session?.token;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_FORM);
  const [createFeedback, setCreateFeedback] = useState(null);
  const [createSubmitting, setCreateSubmitting] = useState(false);

  const [actionFeedback, setActionFeedback] = useState({});
  const [pendingAction, setPendingAction] = useState({});

  const [resetModal, setResetModal] = useState(null);
  const [resetPw, setResetPw] = useState("");
  const [resetFeedback, setResetFeedback] = useState(null);
  const [resetSubmitting, setResetSubmitting] = useState(false);

  const totalUsers = users.length + 1;
  const activeUsers = users.filter((u) => u.isActive).length + (session?.user?.isActive ? 1 : 0);
  const disabledUsers = totalUsers - activeUsers;
  const admins = users.filter((u) => u.role === "admin").length + (session?.user?.role === "admin" ? 1 : 0);

  const setFeedbackFor = (id, type, text) => {
    setActionFeedback((prev) => ({ ...prev, [id]: { type, text } }));
    setTimeout(() => {
      setActionFeedback((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }, 3500);
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
      setCreateFeedback({ type: "error", text: "Login ID must be 6-24 chars (letters, numbers, - or _)." });
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

  const handleRoleChange = async (id, role) => {
    setPendingAction((p) => ({ ...p, [id]: "role" }));
    try {
      const updated = await updateUserRole(token, id, role);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      setFeedbackFor(id, "success", "Role updated.");
    } catch (err) {
      setFeedbackFor(id, "error", err.message || "Failed to update role.");
    } finally {
      setPendingAction((p) => {
        const next = { ...p };
        delete next[id];
        return next;
      });
    }
  };

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
      setPendingAction((p) => {
        const next = { ...p };
        delete next[id];
        return next;
      });
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    setPendingAction((p) => ({ ...p, [id]: "delete" }));
    try {
      await deleteUser(token, id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      setFeedbackFor(id, "error", err.message || "Failed to delete user.");
      setPendingAction((p) => {
        const next = { ...p };
        delete next[id];
        return next;
      });
    }
  };

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
      setTimeout(() => {
        setResetModal(null);
        setResetPw("");
        setResetFeedback(null);
      }, 1200);
    } catch (err) {
      setResetFeedback({ type: "error", text: err.message || "Failed to reset password." });
    } finally {
      setResetSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#111827", margin: 0 }}>User Management</h1>
          <p style={{ color: "#6b7280", margin: "4px 0 0", fontSize: "14px" }}>
            Manage roles, account status, and password resets for all IMS users.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button style={{ background: "white", color: "#111827", border: "1px solid #e5e7eb", padding: "8px 16px", borderRadius: "8px", fontWeight: "600", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Calendar size={18} />
            <span>{new Date().toLocaleDateString()}</span>
          </button>
          <button className="button" type="button" onClick={() => { setShowCreate((v) => !v); setCreateFeedback(null); }}>
            {showCreate ? "Close Form" : "+ New User"}
          </button>
        </div>
      </div>

      <section className="admin-kpi-grid" style={{ marginBottom: "20px" }}>
        <article className="admin-kpi-card">
          <span className="admin-kpi-label">Total Users</span>
          <strong className="admin-kpi-value">{totalUsers}</strong>
        </article>
        <article className="admin-kpi-card">
          <span className="admin-kpi-label">Active Accounts</span>
          <strong className="admin-kpi-value">{activeUsers}</strong>
        </article>
        <article className="admin-kpi-card">
          <span className="admin-kpi-label">Disabled Accounts</span>
          <strong className="admin-kpi-value">{disabledUsers}</strong>
        </article>
        <article className="admin-kpi-card">
          <span className="admin-kpi-label">Admin Users</span>
          <strong className="admin-kpi-value">{admins}</strong>
        </article>
      </section>

      <section className="dashboard-card admin-users-card">
        {showCreate && (
          <form className="form admin-create-form" onSubmit={handleCreateSubmit}>
            <h3 className="admin-section-title">Create New User</h3>
            {createFeedback && <div className={`feedback ${createFeedback.type}`}>{createFeedback.text}</div>}
            <div className="split-form admin-split-form">
              <div className="field">
                <label htmlFor="cu-name">Full Name</label>
                <input id="cu-name" name="name" value={createForm.name} onChange={handleCreateChange} placeholder="Full name" />
              </div>
              <div className="field">
                <label htmlFor="cu-loginId">Login ID</label>
                <input id="cu-loginId" name="loginId" value={createForm.loginId} onChange={handleCreateChange} placeholder="6-24 chars" autoComplete="off" />
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
                <select id="cu-role" name="role" value={createForm.role} onChange={handleCreateChange} className="admin-input-select">
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <button className="button" type="submit" disabled={createSubmitting}>
              {createSubmitting ? "Creating..." : "Create User"}
            </button>
          </form>
        )}

        {loading && <p className="muted">Loading users...</p>}
        {error && <div className="feedback error">{error}</div>}

        {!loading && !error && users.length === 0 && <p className="muted">No other users found.</p>}

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
                    <tr key={user.id} className={busy ? "is-busy" : ""}>
                      <td>
                        <div className="user-primary">{user.name}</div>
                        <div className="user-secondary">{user.email}</div>
                        {fb && <div className={`user-feedback ${fb.type}`}>{fb.text}</div>}
                      </td>
                      <td className="user-login-id">{user.loginId}</td>
                      <td>
                        <select value={user.role} disabled={busy} onChange={(e) => handleRoleChange(user.id, e.target.value)} className="admin-table-select">
                          {ROLES.map((r) => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <span className={`status-pill ${user.isActive ? "active" : "disabled"}`}>
                          {user.isActive ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td>
                        <div className="admin-actions">
                          <button className="ghost-button admin-action-btn" type="button" disabled={busy} onClick={() => handleToggleStatus(user.id, user.isActive)}>
                            {user.isActive ? "Disable" : "Enable"}
                          </button>
                          <button className="ghost-button admin-action-btn" type="button" disabled={busy} onClick={() => openResetModal(user.id, user.name)}>
                            Reset PW
                          </button>
                          <button type="button" disabled={busy} onClick={() => handleDelete(user.id, user.name)} className="admin-danger-btn">
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

      {resetModal && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal">
            <h2 className="admin-modal-title">Reset Password</h2>
            <p className="muted admin-modal-caption">
              Set a new password for <strong>{resetModal.name}</strong>.
            </p>
            <form className="form" onSubmit={handleResetSubmit}>
              {resetFeedback && <div className={`feedback ${resetFeedback.type}`}>{resetFeedback.text}</div>}
              <div className="field">
                <label htmlFor="reset-pw">New Password</label>
                <input id="reset-pw" type="password" value={resetPw} onChange={(e) => setResetPw(e.target.value)} placeholder={passwordHint} autoComplete="new-password" autoFocus />
              </div>
              <div className="button-row">
                <button className="button" type="submit" disabled={resetSubmitting}>
                  {resetSubmitting ? "Saving..." : "Save Password"}
                </button>
                <button className="ghost-button" type="button" onClick={() => setResetModal(null)}>
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
