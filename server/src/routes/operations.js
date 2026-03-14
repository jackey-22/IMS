import { Router } from "express";
import InventoryDoc from "../models/InventoryDoc.js";
import StockBalance from "../models/StockBalance.js";
import StockLedger from "../models/StockLedger.js";
import Product from "../models/Product.js";
import Warehouse from "../models/Warehouse.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(authenticate, requireRole("admin", "inventory_manager"));

function padRef(n) {
  return String(n).padStart(4, "0");
}

async function syncProductOnHand(productId) {
  const balances = await StockBalance.find({ productId }).select("qtyOnHand").lean();
  const totalOnHand = balances.reduce((sum, item) => sum + (Number(item.qtyOnHand) || 0), 0);

  await Product.findByIdAndUpdate(productId, {
    initialStock: totalOnHand,
  });

  return totalOnHand;
}

async function nextDocumentNo(type) {
  const prefix = type === "receipt" ? "WH/IN" : "WH/OUT";
  const lastDoc = await InventoryDoc.findOne({ type })
    .sort({ createdAt: -1 })
    .select("documentNo")
    .lean();

  if (!lastDoc) return `${prefix}/0001`;

  const parts = lastDoc.documentNo.split("/");
  const n = Number(parts[parts.length - 1]) || 0;
  return `${prefix}/${padRef(n + 1)}`;
}

// GET /api/operations/stock — aggregate on-hand per product across all warehouses
router.get("/stock", async (req, res) => {
  try {
    const products = await Product.find({}).select("name sku initialStock").lean();
    const balances = await StockBalance.find({})
      .populate("productId", "name sku uom")
      .populate("warehouseId", "name code")
      .lean();

    const map = new Map();

    for (const product of products) {
      map.set(product._id.toString(), {
        id: product._id.toString(),
        product: product.name,
        sku: product.sku,
        unitCost: 0,
        onHand: Number(product.initialStock) || 0,
        reserved: 0,
        warehouses: [],
        hasBalances: false,
      });
    }

    for (const bal of balances) {
      if (!bal.productId) continue;
      const pid = bal.productId._id.toString();
      if (!map.has(pid)) {
        map.set(pid, {
          id: pid,
          product: bal.productId.name,
          sku: bal.productId.sku,
          unitCost: 0,
          onHand: 0,
          reserved: 0,
          warehouses: [],
          hasBalances: false,
        });
      }
      const entry = map.get(pid);
      if (!entry.hasBalances) {
        entry.onHand = 0;
        entry.reserved = 0;
        entry.warehouses = [];
        entry.hasBalances = true;
      }
      entry.onHand += bal.qtyOnHand;
      entry.reserved += bal.qtyReserved;
      entry.warehouses.push({
        warehouseId: bal.warehouseId?._id?.toString() || null,
        warehouseName: bal.warehouseId?.name || "",
        onHand: bal.qtyOnHand,
        reserved: bal.qtyReserved,
      });
    }

    return res.json(
      Array.from(map.values()).map(({ hasBalances, ...item }) => item)
    );
  } catch (error) {
    console.error("Get stock failed", error);
    return res.status(500).json({ message: "Get stock failed" });
  }
});

// GET /api/operations/receipts
router.get("/receipts", async (req, res) => {
  try {
    const docs = await InventoryDoc.find({ type: "receipt" })
      .populate("warehouseId", "name code")
      .sort({ createdAt: -1 })
      .lean();

    const productIds = [
      ...new Set(
        docs.flatMap((d) => d.lines.map((l) => l.productId?.toString()).filter(Boolean))
      ),
    ];
    const products = await Product.find({ _id: { $in: productIds } }).lean();
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    const result = docs.map((doc) => {
      const line = doc.lines[0];
      const product = line ? productMap.get(line.productId?.toString()) : null;
      const warehouseName = doc.warehouseId
        ? `${doc.warehouseId.name} (${doc.warehouseId.code})`
        : "";
      return {
        id: doc._id,
        reference: doc.documentNo,
        productId: line?.productId?.toString() || null,
        productName: product?.name || "Unknown",
        productSku: product?.sku || "",
        quantity: line?.qty || 0,
        from: doc.notes || doc.partnerName || "",
        to: warehouseName,
        warehouseId: doc.warehouseId?._id?.toString() || null,
        contact: doc.partnerName || "",
        scheduleDate: doc.scheduledDate
          ? new Date(doc.scheduledDate).toISOString().slice(0, 10)
          : new Date(doc.createdAt).toISOString().slice(0, 10),
        status: doc.status,
        createdAt: new Date(doc.createdAt).toISOString().slice(0, 10),
      };
    });

    return res.json(result);
  } catch (error) {
    console.error("List receipts failed", error);
    return res.status(500).json({ message: "List receipts failed" });
  }
});

// POST /api/operations/receipts
router.post("/receipts", async (req, res) => {
  try {
    const { productId, warehouseId, qty, partnerName, fromText, scheduleDate, status } = req.body;

    if (!productId || !warehouseId || !qty) {
      return res.status(400).json({ message: "productId, warehouseId, and qty are required" });
    }

    const quantity = Number(qty);
    if (Number.isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ message: "qty must be a positive number" });
    }

    const [product, warehouse] = await Promise.all([
      Product.findById(productId).lean(),
      Warehouse.findById(warehouseId).lean(),
    ]);

    if (!product) return res.status(404).json({ message: "Product not found" });
    if (!warehouse) return res.status(404).json({ message: "Warehouse not found" });

    const documentNo = await nextDocumentNo("receipt");

    const doc = await InventoryDoc.create({
      type: "receipt",
      status: status || "ready",
      documentNo,
      partnerName: partnerName || "",
      notes: fromText || "",
      scheduledDate: scheduleDate ? new Date(scheduleDate) : new Date(),
      warehouseId: warehouse._id,
      destinationWarehouseId: warehouse._id,
      createdBy: req.user._id,
      lines: [
        {
          productId: product._id,
          uom: product.uom,
          qty: quantity,
          destinationLocationId: null,
        },
      ],
    });

    // Upsert StockBalance — add qty
    let balance = await StockBalance.findOne({
      productId: product._id,
      warehouseId: warehouse._id,
      locationId: null,
    });

    let balanceAfter;
    if (balance) {
      balance.qtyOnHand += quantity;
      await balance.save();
      balanceAfter = balance.qtyOnHand;
    } else {
      const created = await StockBalance.create({
        productId: product._id,
        warehouseId: warehouse._id,
        locationId: null,
        qtyOnHand: quantity,
        qtyReserved: 0,
      });
      balanceAfter = created.qtyOnHand;
    }

    await StockLedger.create({
      productId: product._id,
      warehouseId: warehouse._id,
      locationId: null,
      documentId: doc._id,
      type: "receipt",
      qtyIn: quantity,
      qtyOut: 0,
      balanceAfter,
    });

    await syncProductOnHand(product._id);

    return res.status(201).json({
      id: doc._id,
      reference: documentNo,
      productId: product._id,
      productName: product.name,
      warehouseId: warehouse._id,
      warehouseName: warehouse.name,
      quantity,
      status: doc.status,
    });
  } catch (error) {
    console.error("Create receipt failed", error);
    return res.status(500).json({ message: "Create receipt failed" });
  }
});

// GET /api/operations/deliveries
router.get("/deliveries", async (req, res) => {
  try {
    const docs = await InventoryDoc.find({ type: "delivery" })
      .populate("warehouseId", "name code")
      .sort({ createdAt: -1 })
      .lean();

    const productIds = [
      ...new Set(
        docs.flatMap((d) => d.lines.map((l) => l.productId?.toString()).filter(Boolean))
      ),
    ];
    const products = await Product.find({ _id: { $in: productIds } }).lean();
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    const result = docs.map((doc) => {
      const line = doc.lines[0];
      const product = line ? productMap.get(line.productId?.toString()) : null;
      const warehouseName = doc.warehouseId
        ? `${doc.warehouseId.name} (${doc.warehouseId.code})`
        : "";
      return {
        id: doc._id,
        reference: doc.documentNo,
        productId: line?.productId?.toString() || null,
        productName: product?.name || "Unknown",
        productSku: product?.sku || "",
        quantity: line?.qty || 0,
        from: warehouseName,
        to: doc.notes || doc.partnerName || "",
        warehouseId: doc.warehouseId?._id?.toString() || null,
        contact: doc.partnerName || "",
        scheduleDate: doc.scheduledDate
          ? new Date(doc.scheduledDate).toISOString().slice(0, 10)
          : new Date(doc.createdAt).toISOString().slice(0, 10),
        status: doc.status,
        createdAt: new Date(doc.createdAt).toISOString().slice(0, 10),
      };
    });

    return res.json(result);
  } catch (error) {
    console.error("List deliveries failed", error);
    return res.status(500).json({ message: "List deliveries failed" });
  }
});

// POST /api/operations/deliveries
router.post("/deliveries", async (req, res) => {
  try {
    const { productId, warehouseId, qty, partnerName, toText, scheduleDate, status } = req.body;

    if (!productId || !warehouseId || !qty) {
      return res.status(400).json({ message: "productId, warehouseId, and qty are required" });
    }

    const quantity = Number(qty);
    if (Number.isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ message: "qty must be a positive number" });
    }

    const [product, warehouse] = await Promise.all([
      Product.findById(productId).lean(),
      Warehouse.findById(warehouseId).lean(),
    ]);

    if (!product) return res.status(404).json({ message: "Product not found" });
    if (!warehouse) return res.status(404).json({ message: "Warehouse not found" });

    // Check stock available at this warehouse
    const balance = await StockBalance.findOne({
      productId: product._id,
      warehouseId: warehouse._id,
      locationId: null,
    });

    const available = balance ? balance.qtyOnHand - (balance.qtyReserved || 0) : 0;
    if (quantity > available) {
      return res.status(400).json({
        message: `Insufficient stock at ${warehouse.name}. Available: ${available}, Requested: ${quantity}.`,
      });
    }

    const documentNo = await nextDocumentNo("delivery");

    const doc = await InventoryDoc.create({
      type: "delivery",
      status: status || "ready",
      documentNo,
      partnerName: partnerName || "",
      notes: toText || "",
      scheduledDate: scheduleDate ? new Date(scheduleDate) : new Date(),
      warehouseId: warehouse._id,
      sourceWarehouseId: warehouse._id,
      createdBy: req.user._id,
      lines: [
        {
          productId: product._id,
          uom: product.uom,
          qty: quantity,
          sourceLocationId: null,
        },
      ],
    });

    // Subtract qty from StockBalance
    balance.qtyOnHand -= quantity;
    await balance.save();
    const balanceAfter = balance.qtyOnHand;

    await StockLedger.create({
      productId: product._id,
      warehouseId: warehouse._id,
      locationId: null,
      documentId: doc._id,
      type: "delivery",
      qtyIn: 0,
      qtyOut: quantity,
      balanceAfter,
    });

    await syncProductOnHand(product._id);

    return res.status(201).json({
      id: doc._id,
      reference: documentNo,
      productId: product._id,
      productName: product.name,
      warehouseId: warehouse._id,
      warehouseName: warehouse.name,
      quantity,
      status: doc.status,
    });
  } catch (error) {
    console.error("Create delivery failed", error);
    return res.status(500).json({ message: "Create delivery failed" });
  }
});

export default router;
