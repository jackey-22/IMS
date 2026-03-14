import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="page-shell">
      <div className="auth-layout single">
        <aside className="auth-side compact">
          <div className="logo-stage" aria-label="App Logo">
            <span className="logo-ring" />
            <span className="logo-core">IMS</span>
          </div>
          <span className="brand-mark">CoreInventory</span>
        </aside>

        <main className="auth-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}