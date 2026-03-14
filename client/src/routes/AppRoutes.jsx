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
import StockCountPage from "../pages/warehouse/StockCountPage.jsx";
import ProductsSearchPage from "../pages/warehouse/ProductsSearchPage.jsx";
import WarehouseProfilePage from "../pages/warehouse/WarehouseProfilePage.jsx";
import AdminLayout from "../components/admin/AdminLayout.jsx";
import AdminDashboard from "../pages/admin/AdminDashboard.jsx";
import UsersPage from "../pages/admin/UsersPage.jsx";

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
          : "/dashboard";
    return <Navigate to={target} replace />;
  }
  return <Outlet />;
}

function RoleDashboardRoute() {
  const { session } = useAuth();
  if (session?.user?.role === "warehouse_staff") return <Navigate to="/warehouse/dashboard" replace />;
  if (session?.user?.role === "admin") return <Navigate to="/admin/dashboard" replace />;
  return <DashboardPage />;
}

function AdminRoute() {
  const { session } = useAuth();
  if (!session) return <Navigate to="/login" replace />;
  if (session.user?.role !== "admin") return <Navigate to="/dashboard" replace />;
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
          </Route>
        </Route>

        <Route element={<WarehouseLayout />}>
          <Route path="/warehouse/dashboard" element={<WarehouseDashboard />} />
          <Route path="/warehouse/receipts" element={<ReceiptsPage />} />
          <Route path="/warehouse/deliveries" element={<DeliveriesPage />} />
          <Route path="/warehouse/transfers" element={<TransfersPage />} />
          <Route path="/warehouse/stock-count" element={<StockCountPage />} />
          <Route path="/warehouse/products" element={<ProductsSearchPage />} />
          <Route path="/warehouse/profile" element={<WarehouseProfilePage />} />
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