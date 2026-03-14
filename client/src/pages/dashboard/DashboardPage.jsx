import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const metrics = [
  { value: "Live", label: "Stock Visibility" },
  { value: "OTP", label: "Password Recovery" },
  { value: "Modular", label: "IMS Structure" }
];

const managerTasks = [
  "Manage incoming stock",
  "Manage outgoing stock",
  "Monitor inventory movement"
];

const staffTasks = [
  "Transfers",
  "Picking",
  "Shelving",
  "Counting"
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { logout, session } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="page-shell">
      <div className="dashboard-layout">
        <header className="dashboard-header">
          <div>
            <span className="muted">CoreInventory</span>
            <h1 className="dashboard-title">Inventory Dashboard</h1>
          </div>
          <div className="button-row">
            {session?.user?.role === "admin" && (
              <Link to="/admin/users" className="ghost-button">Manage Users</Link>
            )}
            <button className="ghost-button" type="button" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </header>

        <section className="dashboard-hero">
          <div className="metric-grid">
            {metrics.map((metric) => (
              <article className="metric-card" key={metric.label}>
                <span className="metric-value">{metric.value}</span>
                <span className="metric-label">{metric.label}</span>
              </article>
            ))}
          </div>

          <div className="project-overview minimal">
            <span className="section-label">Operations</span>
            <div className="role-list">
              <span className="role-chip">Inventory Managers</span>
              <span className="role-chip">Warehouse Staff</span>
            </div>
          </div>
        </section>

        <section className="dashboard-grid">
          <article className="dashboard-card">
            <h2 className="card-title">Inventory Managers</h2>
            <ul className="clean-list">
              {managerTasks.map((task) => (
                <li key={task}>{task}</li>
              ))}
            </ul>
          </article>

          <article className="dashboard-card">
            <h2 className="card-title">Warehouse Staff</h2>
            <ul className="clean-list">
              {staffTasks.map((task) => (
                <li key={task}>{task}</li>
              ))}
            </ul>
          </article>
        </section>

        <section className="dashboard-card">
          <h2 className="card-title">Session</h2>
          <div className="meta-grid">
            <div className="meta-item">
              <span className="meta-label">Login ID</span>
              <span className="meta-value">{session?.user?.loginId}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Email ID</span>
              <span className="meta-value">{session?.user?.email}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Role</span>
              <span className="meta-value">{session?.user?.role?.replace("_", " ")}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Access</span>
              <span className="meta-value">Authenticated</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}