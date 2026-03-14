import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import AuthLayout from "../pages/auth/AuthLayout.jsx";
import LoginPage from "../pages/auth/LoginPage.jsx";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage.jsx";
import SignupPage from "../pages/auth/SignupPage.jsx";
import DashboardPage from "../pages/dashboard/DashboardPage.jsx";
import UsersPage from "../pages/admin/UsersPage.jsx";

function ProtectedRoute() {
  const { session } = useAuth();
  return session ? <Outlet /> : <Navigate to="/login" replace />;
}

function PublicOnlyRoute() {
  const { session } = useAuth();
  return session ? <Navigate to="/dashboard" replace /> : <Outlet />;
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
        <Route path="/dashboard" element={<DashboardPage />} />
      </Route>

      <Route element={<AdminRoute />}>
        <Route path="/admin/users" element={<UsersPage />} />
      </Route>

      <Route path="*" element={<Navigate to={session ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}