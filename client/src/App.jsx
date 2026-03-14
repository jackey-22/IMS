import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { InventoryOpsProvider } from "./context/InventoryOpsContext.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <InventoryOpsProvider>
          <AppRoutes />
        </InventoryOpsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
