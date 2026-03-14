export default function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <span className="brand-kicker">IMS</span>
          <h1>Inventory Control, Simplified</h1>
          <p>Track stock, automate operations, and keep every movement audited in real time.</p>
        </div>
        <div className="header-actions">
          <button className="btn ghost">Log in</button>
          <button className="btn solid">Get Started</button>
        </div>
      </header>
      <main className="app-main">
        <section className="grid">
          <div className="card">
            <h2>Dashboard KPIs</h2>
            <p>Monitor stock health, pending receipts, deliveries, and transfers instantly.</p>
            <div className="tag-row">
              <span>Total Stock</span>
              <span>Low Stock</span>
              <span>Pending Receipts</span>
            </div>
          </div>
          <div className="card">
            <h2>Operations Hub</h2>
            <p>Create receipts, deliveries, transfers, and adjustments with guided workflows.</p>
            <div className="tag-row">
              <span>Receipts</span>
              <span>Delivery</span>
              <span>Transfers</span>
            </div>
          </div>
          <div className="card">
            <h2>Products + Warehouses</h2>
            <p>Centralize product data, reordering rules, and multi-warehouse visibility.</p>
            <div className="tag-row">
              <span>SKU Search</span>
              <span>Locations</span>
              <span>Alerts</span>
            </div>
          </div>
        </section>
        <section className="card highlight">
          <div>
            <h2>OTP-Based Password Reset</h2>
            <p>
              Secure recovery with one-time email codes and enforced expiration rules for every
              request.
            </p>
          </div>
          <button className="btn solid">See Auth Flow</button>
        </section>
      </main>
    </div>
  );
}
