import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import AuthLayout from "../pages/auth/AuthLayout.jsx";
import LoginPage from "../pages/auth/LoginPage.jsx";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage.jsx";
import SignupPage from "../pages/auth/SignupPage.jsx";
import DashboardPage from "../pages/dashboard/DashboardPage.jsx";
import WarehouseLayout from "../components/warehouse/WarehouseLayout.jsx";
import WarehouseDashboard from "../pages/warehouse/WarehouseDashboard.jsx";
import ReceiptsPage from "../pages/warehouse/ReceiptsPage.jsx";
import DeliveriesPage from "../pages/warehouse/DeliveriesPage.jsx";
import TransfersPage from "../pages/warehouse/TransfersPage.jsx";
import ProductsSearchPage from "../pages/warehouse/ProductsSearchPage.jsx";
import AdminLayout from "../components/admin/AdminLayout.jsx";
import AdminDashboard from "../pages/admin/AdminDashboard.jsx";
import UsersPage from "../pages/admin/UsersPage.jsx";
import Dashboard from "../pages/inventory/Dashboard.jsx";
import Products from "../pages/inventory/Products.jsx";
import Categories from "../pages/inventory/Categories.jsx";
import Warehouses from "../pages/inventory/Warehouses.jsx";
import Operations from "../pages/inventory/Operations.jsx";
import Receipts from "../pages/inventory/Receipts.jsx";
import Deliveries from "../pages/inventory/Deliveries.jsx";
import Transfers from "../pages/inventory/Transfers.jsx";
import Stock from "../pages/inventory/Stock.jsx";
import StockLedger from "../pages/inventory/StockLedger.jsx";
import Reports from "../pages/inventory/Reports.jsx";
import Profile from "../pages/inventory/Profile.jsx";
import WarehouseSettingsPage from "../pages/admin/WarehouseSettingsPage.jsx";
import LocationSettingsPage from "../pages/admin/LocationSettingsPage.jsx";
import AdminProfilePage from "../pages/admin/AdminProfilePage.jsx";
import ProfilePage from "../pages/shared/ProfilePage.jsx";
import InventoryLayout from "../components/inventory/InventoryLayout.jsx";

function ProtectedRoute() {
  const { session } = useAuth();
  return session ? <Outlet /> : <Navigate to="/login" replace />;
}

function PublicOnlyRoute() {
  const { session } = useAuth();
  if (session) {
    const target =
      session.user?.role === "warehouse_staff"
        ? "/warehouse/dashboard"
        : session.user?.role === "admin"
          ? "/admin/dashboard"
          : session.user?.role === "inventory_manager"
            ? "/inventory/dashboard"
            : "/dashboard";
    return <Navigate to={target} replace />;
  }
  return <Outlet />;
}

function RoleDashboardRoute() {
  const { session } = useAuth();
  if (session?.user?.role === "warehouse_staff") return <Navigate to="/warehouse/dashboard" replace />;
  if (session?.user?.role === "admin") return <Navigate to="/admin/dashboard" replace />;
  if (session?.user?.role === "inventory_manager") return <Navigate to="/inventory/dashboard" replace />;
  return <DashboardPage />;
}

function AdminRoute() {
  const { session } = useAuth();
  if (!session) return <Navigate to="/login" replace />;
  if (session.user?.role !== "admin") return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

function InventoryManagerRoute() {
  const { session } = useAuth();
  if (!session) return <Navigate to="/login" replace />;
  if (session.user?.role !== "inventory_manager") return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

export default function AppRoutes() {
  const { session } = useAuth();

  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<RoleDashboardRoute />} />

        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UsersPage />} />
            <Route path="/admin/settings/warehouse" element={<WarehouseSettingsPage />} />
            <Route path="/admin/settings/locations" element={<LocationSettingsPage />} />
            <Route path="/admin/profile" element={<AdminProfilePage />} />
          </Route>
        </Route>

        <Route element={<WarehouseLayout />}>
          <Route path="/warehouse/dashboard" element={<WarehouseDashboard />} />
          <Route path="/warehouse/receipts" element={<ReceiptsPage />} />
          <Route path="/warehouse/deliveries" element={<DeliveriesPage />} />
          <Route path="/warehouse/transfers" element={<TransfersPage />} />
          <Route path="/warehouse/products" element={<ProductsSearchPage />} />
          <Route path="/warehouse/profile" element={<ProfilePage />} />
        </Route>

        <Route element={<InventoryManagerRoute />}>
          <Route element={<InventoryLayout />}>
            <Route path="/inventory/dashboard" element={<Dashboard />} />
            <Route path="/inventory/products" element={<Products />} />
            <Route path="/inventory/categories" element={<Categories />} />
            <Route path="/inventory/warehouses" element={<Warehouses />} />
            <Route path="/inventory/operations" element={<Operations />} />
            <Route path="/inventory/operations/receipts" element={<Receipts />} />
            <Route path="/inventory/operations/deliveries" element={<Deliveries />} />
            <Route path="/inventory/operations/transfers" element={<Transfers />} />
            <Route path="/inventory/stock" element={<Stock />} />
            <Route path="/inventory/stock-ledger" element={<StockLedger />} />
            <Route path="/inventory/reports" element={<Reports />} />
            <Route path="/inventory/profile" element={<Profile />} />
          </Route>
        </Route>
      </Route>

      <Route
        path="*"
        element={
          <Navigate
            to={
              session
                ? session.user?.role === "warehouse_staff"
                  ? "/warehouse/dashboard"
                  : session.user?.role === "admin"
                    ? "/admin/dashboard"
                    : session.user?.role === "inventory_manager"
                      ? "/inventory/dashboard"
                    : "/dashboard"
                : "/login"
            }
            replace
          />
        }
      />
    </Routes>
  );
}