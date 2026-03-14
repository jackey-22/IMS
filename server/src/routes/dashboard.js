import express from "express";
import { authenticate } from "../middleware/auth.js";
import Product from "../models/Product.js";
import InventoryDoc from "../models/InventoryDoc.js";
import StockBalance from "../models/StockBalance.js";
import Warehouse from "../models/Warehouse.js";
import User from "../models/User.js";
import Category from "../models/Category.js";

const router = express.Router();

router.get("/stats", authenticate, async (req, res) => {
  try {
    const role = req.user.role;

    // ── Product stats ──
    const products = await Product.find().lean();
    const totalProducts = products.length;
    const activeProducts = products.filter((p) => p.isActive).length;

    // ── Stock balances ──
    const stockBalances = await StockBalance.find().lean();
    const totalOnHand = stockBalances.reduce((sum, s) => sum + (s.qtyOnHand || 0), 0);

    // Low stock: products where total on-hand ≤ reorderPoint
    const productStockMap = {};
    for (const sb of stockBalances) {
      const pid = String(sb.productId);
      productStockMap[pid] = (productStockMap[pid] || 0) + (sb.qtyOnHand || 0);
    }

    const lowStockProducts = [];
    const outOfStockProducts = [];
    for (const p of products) {
      const onHand = productStockMap[String(p._id)] || 0;
      if (onHand === 0) {
        outOfStockProducts.push({ _id: p._id, name: p.name, sku: p.sku, onHand, reorderPoint: p.reorderPoint });
      } else if (p.reorderPoint > 0 && onHand <= p.reorderPoint) {
        lowStockProducts.push({ _id: p._id, name: p.name, sku: p.sku, onHand, reorderPoint: p.reorderPoint });
      }
    }

    // ── Operations stats ──
    const operations = await InventoryDoc.find()
      .sort({ createdAt: -1 })
      .populate("lines.productId", "name sku")
      .lean();

    const opsByType = { receipt: 0, delivery: 0, transfer: 0, adjustment: 0 };
    const opsByStatus = { draft: 0, waiting: 0, ready: 0, done: 0, canceled: 0 };
    let completedToday = 0;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    for (const op of operations) {
      opsByType[op.type] = (opsByType[op.type] || 0) + 1;
      opsByStatus[op.status] = (opsByStatus[op.status] || 0) + 1;
      if (op.status === "done" && op.validatedAt && new Date(op.validatedAt) >= todayStart) {
        completedToday++;
      }
    }

    const pendingReceipts = operations.filter((o) => o.type === "receipt" && o.status !== "done" && o.status !== "canceled").length;
    const pendingDeliveries = operations.filter((o) => o.type === "delivery" && o.status !== "done" && o.status !== "canceled").length;
    const scheduledTransfers = operations.filter((o) => o.type === "transfer" && o.status !== "done" && o.status !== "canceled").length;

    const recentOperations = operations.slice(0, 10).map((op) => ({
      _id: op._id,
      documentNo: op.documentNo,
      type: op.type,
      status: op.status,
      partnerName: op.partnerName,
      createdAt: op.createdAt,
      scheduledDate: op.scheduledDate,
      totalQty: op.lines.reduce((sum, l) => sum + (l.qty || 0), 0),
      productName: op.lines[0]?.productId?.name || "—",
    }));

    // ── Warehouse stats ──
    const warehouses = await Warehouse.find().lean();
    const totalWarehouses = warehouses.length;
    const totalLocations = warehouses.reduce((sum, w) => sum + (w.locations?.length || 0), 0);

    // ── Category stats ──
    const categories = await Category.find().lean();
    const totalCategories = categories.length;

    // ── Base response ──
    const stats = {
      products: {
        total: totalProducts,
        active: activeProducts,
        lowStock: lowStockProducts.length,
        outOfStock: outOfStockProducts.length,
        lowStockItems: lowStockProducts.slice(0, 10),
        outOfStockItems: outOfStockProducts.slice(0, 5),
      },
      stock: { totalOnHand },
      operations: {
        byType: opsByType,
        byStatus: opsByStatus,
        pendingReceipts,
        pendingDeliveries,
        scheduledTransfers,
        completedToday,
        recent: recentOperations,
      },
      warehouses: { total: totalWarehouses, totalLocations },
      categories: { total: totalCategories },
    };

    // ── Admin-only: user stats ──
    if (role === "admin") {
      const users = await User.find().select("-passwordHash").lean();
      const byRole = { admin: 0, inventory_manager: 0, warehouse_staff: 0 };
      let activeUsers = 0;
      let disabledUsers = 0;
      for (const u of users) {
        byRole[u.role] = (byRole[u.role] || 0) + 1;
        if (u.isActive) activeUsers++;
        else disabledUsers++;
      }
      stats.users = {
        total: users.length,
        active: activeUsers,
        disabled: disabledUsers,
        byRole,
        recent: users
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 6)
          .map((u) => ({
            _id: u._id,
            name: u.name,
            loginId: u.loginId,
            email: u.email,
            role: u.role,
            isActive: u.isActive,
            createdAt: u.createdAt,
          })),
      };
    }

    return res.json(stats);
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
});

export default router;
