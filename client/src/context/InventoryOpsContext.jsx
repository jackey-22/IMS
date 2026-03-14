import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext.jsx";
import { listProducts } from "../services/productsApi.js";
import { listWarehouses } from "../services/warehousesApi.js";
import {
  listStock,
  listReceipts,
  createReceiptApi,
  listDeliveries,
  createDeliveryApi,
} from "../services/operationsApi.js";

const InventoryOpsContext = createContext(null);

function padRef(num) {
  return String(num).padStart(4, "0");
}

export function InventoryOpsProvider({ children }) {
  const { session } = useAuth();
  const token = session?.token;

  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [stock, setStock] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [prods, whs, recs, dels, stk] = await Promise.all([
        listProducts(token),
        listWarehouses(token),
        listReceipts(token),
        listDeliveries(token),
        listStock(token),
      ]);
      setProducts(Array.isArray(prods) ? prods : []);
      setWarehouses(Array.isArray(whs) ? whs : []);
      setReceipts(Array.isArray(recs) ? recs : []);
      setDeliveries(Array.isArray(dels) ? dels : []);
      setStock(Array.isArray(stk) ? stk : []);
    } catch (err) {
      console.error("Failed to load inventory ops data", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Client-side reference preview (actual reference is assigned server-side)
  const getNextReference = (operationType) => {
    if (operationType === "IN") {
      const maxRef = receipts.reduce((max, entry) => {
        const n = Number(entry.reference?.split("/").pop()) || 0;
        return Math.max(max, n);
      }, 0);
      return `WH/IN/${padRef(maxRef + 1)}`;
    }
    const maxRef = deliveries.reduce((max, entry) => {
      const n = Number(entry.reference?.split("/").pop()) || 0;
      return Math.max(max, n);
    }, 0);
    return `WH/OUT/${padRef(maxRef + 1)}`;
  };

  const createReceipt = async (payload) => {
    const qty = Number(payload.quantity);
    if (Number.isNaN(qty) || qty <= 0) {
      return { ok: false, error: "Receipt quantity must be greater than zero." };
    }
    if (!payload.productId) {
      return { ok: false, error: "Select a valid product." };
    }
    if (!payload.warehouseId) {
      return { ok: false, error: "Select a destination warehouse." };
    }
    try {
      const result = await createReceiptApi(token, {
        productId: payload.productId,
        warehouseId: payload.warehouseId,
        qty,
        partnerName: payload.contact || "",
        fromText: payload.from || "",
        scheduleDate: payload.scheduleDate,
        status: payload.status || "ready",
      });
      await fetchAll();
      return { ok: true, reference: result.reference };
    } catch (err) {
      return { ok: false, error: err.message || "Failed to create receipt." };
    }
  };

  const createDelivery = async (payload) => {
    const qty = Number(payload.quantity);
    if (Number.isNaN(qty) || qty <= 0) {
      return { ok: false, error: "Delivery quantity must be greater than zero." };
    }
    if (!payload.productId) {
      return { ok: false, error: "Select a valid product." };
    }
    if (!payload.warehouseId) {
      return { ok: false, error: "Select a source warehouse." };
    }
    try {
      const result = await createDeliveryApi(token, {
        productId: payload.productId,
        warehouseId: payload.warehouseId,
        qty,
        partnerName: payload.contact || "",
        toText: payload.to || "",
        scheduleDate: payload.scheduleDate,
        status: payload.status || "ready",
      });
      await fetchAll();
      return { ok: true, reference: result.reference };
    } catch (err) {
      return { ok: false, error: err.message || "Failed to create delivery." };
    }
  };

  // Manual stock quantity adjustment (optimistic local update)
  const updateStockQuantity = ({ productId, onHand }) => {
    const nextOnHand = Number(onHand);
    if (Number.isNaN(nextOnHand) || nextOnHand < 0) {
      return { ok: false, error: "On-hand quantity must be a non-negative number." };
    }
    setStock((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, onHand: nextOnHand } : item
      )
    );
    return { ok: true };
  };

  const value = {
    products,
    warehouses,
    stock,
    receipts,
    deliveries,
    loading,
    getNextReference,
    createReceipt,
    createDelivery,
    updateStockQuantity,
    refresh: fetchAll,
  };

  return (
    <InventoryOpsContext.Provider value={value}>
      {children}
    </InventoryOpsContext.Provider>
  );
}

export function useInventoryOps() {
  const context = useContext(InventoryOpsContext);
  if (!context) {
    throw new Error("useInventoryOps must be used within InventoryOpsProvider");
  }
  return context;
}
