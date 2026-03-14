import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { InventoryOpsProvider } from "./context/InventoryOpsContext.jsx";
import { NotificationsProvider } from "./context/NotificationsContext.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <InventoryOpsProvider>
        <NotificationsProvider>
          <AppRoutes />
        </NotificationsProvider>
        </InventoryOpsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
