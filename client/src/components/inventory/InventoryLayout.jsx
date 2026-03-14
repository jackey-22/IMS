import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useNotifications } from "../../context/NotificationsContext.jsx";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  Layers,
  Warehouse,
  ArrowLeftRight,
  ClipboardList,
  NotebookText,
  FileBarChart2,
  Users,
  User,
  LogOut,
  Search,
  Bell
} from "lucide-react";

export default function InventoryLayout() {
  const navigate = useNavigate();
  const { logout, session } = useAuth();
  const { items, unreadCount, markRead, markAllRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/inventory/dashboard" },
    { icon: Package, label: "Products", path: "/inventory/products" },
    { icon: Layers, label: "Categories", path: "/inventory/categories" },
    { icon: Warehouse, label: "Warehouses", path: "/inventory/warehouses" },
    { icon: ClipboardList, label: "Operations", path: "/inventory/operations" },
    { icon: ArrowLeftRight, label: "Internal Transfers", path: "/inventory/operations/transfers" },
    { icon: NotebookText, label: "Stock", path: "/inventory/stock" },
    { icon: NotebookText, label: "Stock Ledger", path: "/inventory/stock-ledger" },
    { icon: FileBarChart2, label: "Reports", path: "/inventory/reports" },
    { icon: Users, label: "Suppliers", path: "/inventory/suppliers" },
    { icon: User, label: "Profile", path: "/inventory/profile" }
  ];

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const userName = session?.user?.name || "Inventory Manager";
  const userRoleLabel = session?.user?.role ? session.user.role.replace("_", " ") : "Inventory Manager";
  const initials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const styles = {
    shell: {
      display: "flex",
      minHeight: "100vh",
      fontFamily: "'Manrope', sans-serif",
      background: "#f9fafb"
    },
    sidebar: {
      width: "260px",
      background: "#111827",
      color: "#9ca3af",
      display: "flex",
      flexDirection: "column",
      position: "fixed",
      height: "100vh",
      left: 0,
      top: 0,
      zIndex: 100
    },
    sidebarHeader: {
      padding: "24px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      color: "#ffffff",
      borderBottom: "1px solid #1f2937"
    },
    sidebarNav: {
      flex: 1,
      paddingTop: "20px"
    },
    sidebarLink: (isActive) => ({
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "12px 24px",
      color: isActive ? "#ffffff" : "#9ca3af",
      textDecoration: "none",
      fontSize: "14px",
      fontWeight: "500",
      background: isActive ? "#1f2937" : "transparent",
      borderLeft: isActive ? "4px solid #3b82f6" : "4px solid transparent",
      transition: "all 0.2s ease"
    }),
    sidebarFooter: {
      marginTop: "auto",
      padding: "16px 0",
      borderTop: "1px solid #1f2937"
    },
    logoutBtn: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "12px 24px",
      color: "#9ca3af",
      width: "100%",
      background: "transparent",
      border: "none",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "500",
      transition: "color 0.2s"
    },
    main: {
      flex: 1,
      marginLeft: "260px",
      display: "flex",
      flexDirection: "column",
      minWidth: 0
    },
    topbar: {
      height: "64px",
      background: "#ffffff",
      borderBottom: "1px solid #e5e7eb",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 24px",
      position: "sticky",
      top: 0,
      zIndex: 90
    },
    searchBox: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      background: "#f3f4f6",
      padding: "8px 16px",
      borderRadius: "8px",
      width: "320px"
    },
    searchInput: {
      background: "transparent",
      border: "none",
      outline: "none",
      fontSize: "14px",
      width: "100%"
    },
    topbarActions: {
      display: "flex",
      alignItems: "center",
      gap: "20px"
    },
    iconBtn: {
      background: "transparent",
      border: "none",
      color: "#6b7280",
      cursor: "pointer",
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    },
    dropdown: {
      position: "absolute",
      right: 0,
      top: "36px",
      width: "320px",
      background: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: "12px",
      boxShadow: "0 18px 40px rgba(15, 23, 42, 0.15)",
      zIndex: 200
    },
    dropdownHeader: {
      padding: "12px 14px",
      borderBottom: "1px solid #e5e7eb",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      fontWeight: 600,
      fontSize: "14px"
    },
    dropdownList: {
      maxHeight: "320px",
      overflowY: "auto"
    },
    dropdownItem: {
      padding: "12px 14px",
      borderBottom: "1px solid #f3f4f6",
      cursor: "pointer"
    },
    dropdownTitle: { fontSize: "13px", fontWeight: 600, color: "#111827" },
    dropdownMessage: { fontSize: "12px", color: "#6b7280", marginTop: "4px" },
    dropdownEmpty: { padding: "16px", fontSize: "13px", color: "#6b7280" },
    badge: {
      position: "absolute",
      top: "-4px",
      right: "-4px",
      background: "#ef4444",
      color: "white",
      fontSize: "10px",
      padding: "2px 5px",
      borderRadius: "10px",
      border: "2px solid #ffffff"
    },
    userProfile: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      paddingLeft: "20px",
      borderLeft: "1px solid #e5e7eb"
    },
    avatar: (size = "32px", bg = "#3b82f6", color = "white") => ({
      width: size,
      height: size,
      borderRadius: "50%",
      background: bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: color,
      fontWeight: "600",
      fontSize: size === "32px" ? "14px" : "32px"
    }),
    content: {
      padding: "24px",
      overflowY: "auto"
    }
  };

  const onBellClick = () => setIsOpen((prev) => !prev);

  return (
    <div style={styles.shell}>
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.avatar("32px", "white", "#3b82f6")}>IMS</div>
          <h2 style={{ fontSize: "20px", fontWeight: "800", margin: 0 }}>Inventory</h2>
        </div>

        <nav style={styles.sidebarNav}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => styles.sidebarLink(isActive)}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div style={styles.sidebarFooter}>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main style={styles.main}>
        <header style={styles.topbar}>
          <div style={styles.searchBox}>
            <Search size={18} color="#6b7280" />
            <input type="text" placeholder="Search..." style={styles.searchInput} />
          </div>

          <div style={styles.topbarActions}>
            <div style={{ position: "relative" }}>
              <button style={styles.iconBtn} onClick={onBellClick}>
                <Bell size={20} />
                {unreadCount > 0 && <span style={styles.badge}>{unreadCount}</span>}
              </button>
              {isOpen && (
                <div style={styles.dropdown} onClick={(e) => e.stopPropagation()}>
                  <div style={styles.dropdownHeader}>
                    <span>Notifications</span>
                    <button
                      onClick={() => markAllRead()}
                      style={{ background: "none", border: "none", color: "#2563eb", cursor: "pointer", fontSize: "12px" }}
                    >
                      Mark all read
                    </button>
                  </div>
                  <div style={styles.dropdownList}>
                    {items.length === 0 && <div style={styles.dropdownEmpty}>No notifications yet.</div>}
                    {items.map((item) => (
                      <div
                        key={item._id}
                        style={{
                          ...styles.dropdownItem,
                          background: item.readAt ? "#ffffff" : "#eff6ff"
                        }}
                        onClick={() => markRead(item._id)}
                      >
                        <div style={styles.dropdownTitle}>{item.title}</div>
                        <div style={styles.dropdownMessage}>{item.message}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={styles.userProfile}>
              <div style={{ textAlign: "right", marginRight: "12px" }}>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>{userName}</div>
                <div style={{ fontSize: "12px", color: "#6b7280", textTransform: "capitalize" }}>{userRoleLabel}</div>
              </div>
              <div style={styles.avatar()}>{initials || "IM"}</div>
            </div>
          </div>
        </header>

        <div style={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
