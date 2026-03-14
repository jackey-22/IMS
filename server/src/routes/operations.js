import { Router } from "express";
import InventoryDoc from "../models/InventoryDoc.js";
import StockBalance from "../models/StockBalance.js";
import StockLedger from "../models/StockLedger.js";
import Product from "../models/Product.js";
import Warehouse from "../models/Warehouse.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

// Restricted to admin/inventory_manager by default, but we'll override for specific routes
router.use(authenticate);

function padRef(n) {
  return String(n).padStart(4, "0");
}

async function syncProductOnHand(productId) {
  const balances = await StockBalance.find({ productId }).select("qtyOnHand").lean();
  const totalOnHand = balances.reduce((sum, item) => sum + (Number(item.qtyOnHand) || 0), 0);
  await Product.findByIdAndUpdate(productId, { initialStock: totalOnHand });
  return totalOnHand;
}

async function nextDocumentNo(type) {
  const prefix =
    type === "receipt"
      ? "WH/IN"
      : type === "delivery"
        ? "WH/OUT"
        : type === "transfer"
          ? "WH/TRF"
          : "WH/DOC";
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
      .populate("warehouseId", "name code locations")
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
      const locationId = bal.locationId ? bal.locationId.toString() : null;
      const location = locationId
        ? (bal.warehouseId?.locations || []).find((loc) => loc._id.toString() === locationId)
        : null;

      entry.warehouses.push({
        warehouseId: bal.warehouseId?._id?.toString() || null,
        warehouseName: bal.warehouseId?.name || "",
        locationId,
        locationName: location?.name || "",
        locationCode: location?.code || "",
        locationType: location?.type || "",
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

// GET /api/operations/stock-ledger
router.get("/stock-ledger", requireRole("admin", "inventory_manager", "warehouse_staff"), async (req, res) => {
  try {
    const entries = await StockLedger.find({})
      .populate("productId", "name sku")
      .populate("warehouseId", "name code locations")
      .populate("documentId", "documentNo")
      .sort({ createdAt: -1 })
      .lean();

    const result = entries.map((entry) => {
      const warehouse = entry.warehouseId;
      const locationId = entry.locationId ? entry.locationId.toString() : null;
      const location = locationId
        ? (warehouse?.locations || []).find((loc) => loc._id.toString() === locationId)
        : null;
      const warehouseLabel = warehouse ? `${warehouse.name} (${warehouse.code})` : "";
      const locationLabel = location ? `${location.name} (${location.code})` : "";

      return {
        id: entry._id,
        date: entry.createdAt ? new Date(entry.createdAt).toISOString().slice(0, 10) : "",
        type: entry.type,
        documentNo: entry.documentId?.documentNo || "",
        productId: entry.productId?._id?.toString() || null,
        product: entry.productId?.name || "Unknown",
        sku: entry.productId?.sku || "",
        qtyIn: Number(entry.qtyIn) || 0,
        qtyOut: Number(entry.qtyOut) || 0,
        balance: Number(entry.balanceAfter) || 0,
        warehouseId: warehouse?._id?.toString() || null,
        warehouseName: warehouseLabel,
        locationId: locationId || null,
        locationName: locationLabel,
        warehouse: locationLabel ? `${warehouseLabel} - ${locationLabel}` : warehouseLabel,
      };
    });

    return res.json(result);
  } catch (error) {
    console.error("List stock ledger failed", error);
    return res.status(500).json({ message: "List stock ledger failed" });
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
router.post("/receipts", requireRole("admin", "inventory_manager"), async (req, res) => {
  try {
    const { productId, warehouseId, destinationLocationId, qty, partnerName, fromText, scheduleDate, status } = req.body;

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

    const normalizedDestinationLocationId = destinationLocationId || null;
    if (normalizedDestinationLocationId) {
      const hasLocation = (warehouse.locations || []).some(
        (loc) => loc._id.toString() === normalizedDestinationLocationId
      );
      if (!hasLocation) {
        return res.status(404).json({ message: "Destination location not found" });
      }
    }

    const documentNo = await nextDocumentNo("receipt");

    const doc = await InventoryDoc.create({
      type: "receipt",
      status: status || "waiting",
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
          destinationLocationId: normalizedDestinationLocationId,
        },
      ],
    });

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

// PUT /api/operations/receipts/:id/confirm — Warehouse staff confirms receipt
router.put("/receipts/:id/confirm", requireRole("admin", "inventory_manager", "warehouse_staff"), async (req, res) => {
  try {
    const doc = await InventoryDoc.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Receipt not found" });
    if (doc.type !== "receipt") return res.status(400).json({ message: "Invalid document type" });
    if (doc.status === "done") return res.status(400).json({ message: "Receipt already confirmed" });

    const line = doc.lines[0];
    if (!line) return res.status(400).json({ message: "Receipt has no items" });

    const product = await Product.findById(line.productId);
    const warehouse = await Warehouse.findById(doc.warehouseId);

    if (!product || !warehouse) {
      return res.status(404).json({ message: "Product or Warehouse not found" });
    }

    const [balance, productBalanceCount] = await Promise.all([
      StockBalance.findOne({
        productId: product._id,
        warehouseId: warehouse._id,
        locationId: line.destinationLocationId || null,
      }),
      StockBalance.countDocuments({ productId: product._id }),
    ]);

    let balanceAfter;
    if (balance) {
      balance.qtyOnHand += line.qty;
      await balance.save();
      balanceAfter = balance.qtyOnHand;
    } else {
      // If no balance exists, we just create one. 
      // We don't seed initialStock here because it's usually handled during the first ever stock entry or product creation.
      const created = await StockBalance.create({
        productId: product._id,
        warehouseId: warehouse._id,
        locationId: line.destinationLocationId || null,
        qtyOnHand: line.qty,
        qtyReserved: 0,
      });
      balanceAfter = created.qtyOnHand;
    }

    await StockLedger.create({
      productId: product._id,
      warehouseId: warehouse._id,
      locationId: line.destinationLocationId || null,
      documentId: doc._id,
      type: "receipt",
      qtyIn: line.qty,
      qtyOut: 0,
      balanceAfter,
    });

    doc.status = "done";
    doc.validatedBy = req.user._id;
    doc.validatedAt = new Date();
    await doc.save();
    
    await syncProductOnHand(product._id);

    return res.json({ message: "Receipt confirmed, stock updated", status: doc.status });
  } catch (error) {
    console.error("Confirm receipt failed", error);
    return res.status(500).json({ message: "Confirm receipt failed" });
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
router.post("/deliveries", requireRole("admin", "inventory_manager"), async (req, res) => {
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

    const [balance, productBalanceCount] = await Promise.all([
      StockBalance.findOne({
        productId: product._id,
        warehouseId: warehouse._id,
        locationId: null,
      }),
      StockBalance.countDocuments({ productId: product._id }),
    ]);

    const seededOnHand = !balance && productBalanceCount === 0 ? Number(product.initialStock) || 0 : 0;
    const available = balance
      ? balance.qtyOnHand - (balance.qtyReserved || 0)
      : seededOnHand;
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

// PUT /api/operations/deliveries/:id/confirm — Warehouse staff confirms dispatch
router.put("/deliveries/:id/confirm", requireRole("admin", "inventory_manager", "warehouse_staff"), async (req, res) => {
  try {
    const doc = await InventoryDoc.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Delivery order not found" });
    if (doc.type !== "delivery") return res.status(400).json({ message: "Invalid document type" });
    if (doc.status === "done") return res.status(400).json({ message: "Delivery already dispatched" });

    const line = doc.lines[0];
    if (!line) return res.status(400).json({ message: "Delivery has no items" });

    const product = await Product.findById(line.productId);
    const warehouse = await Warehouse.findById(doc.warehouseId);

    if (!product || !warehouse) {
      return res.status(404).json({ message: "Product or Warehouse not found" });
    }

    const [balance, productBalanceCount] = await Promise.all([
      StockBalance.findOne({
        productId: product._id,
        warehouseId: warehouse._id,
        locationId: line.sourceLocationId || null,
      }),
      StockBalance.countDocuments({ productId: product._id }),
    ]);

    const available = balance ? balance.qtyOnHand : 0;

    if (line.qty > available) {
      return res.status(400).json({
        message: `Stock level dropped before confirmation. Available: ${available}, Required: ${line.qty}.`,
      });
    }

    let balanceAfter;
    if (balance) {
      balance.qtyOnHand -= line.qty;
      await balance.save();
      balanceAfter = balance.qtyOnHand;
    } else {
      const created = await StockBalance.create({
        productId: product._id,
        warehouseId: warehouse._id,
        locationId: line.sourceLocationId || null,
        qtyOnHand: -line.qty,
        qtyReserved: 0,
      });
      balanceAfter = created.qtyOnHand;
    }

    await StockLedger.create({
      productId: product._id,
      warehouseId: warehouse._id,
      locationId: line.sourceLocationId || null,
      documentId: doc._id,
      type: "delivery",
      qtyIn: 0,
      qtyOut: line.qty,
      balanceAfter,
    });

    doc.status = "done";
    doc.validatedBy = req.user._id;
    doc.validatedAt = new Date();
    await doc.save();
    
    await syncProductOnHand(product._id);

    return res.json({ message: "Delivery dispatched, stock reduced", status: doc.status });
  } catch (error) {
    console.error("Confirm delivery failed", error);
    return res.status(500).json({ message: "Confirm delivery failed" });
  }
});

// GET /api/operations/transfers
router.get("/transfers", async (req, res) => {
  try {
    const docs = await InventoryDoc.find({ type: "transfer" })
      .populate("sourceWarehouseId", "name code")
      .populate("destinationWarehouseId", "name code")
      .sort({ createdAt: -1 })
      .lean();

    const productIds = [
      ...new Set(
        docs.flatMap((d) => d.lines.map((l) => l.productId?.toString()).filter(Boolean))
      ),
    ];
    const products = await Product.find({ _id: { $in: productIds } }).lean();
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    const warehouseIds = [
      ...new Set(
        docs
          .flatMap((doc) => [doc.sourceWarehouseId?._id?.toString(), doc.destinationWarehouseId?._id?.toString()])
          .filter(Boolean)
      ),
    ];
    const warehouses = await Warehouse.find({ _id: { $in: warehouseIds } }).lean();
    const warehouseMap = new Map(warehouses.map((wh) => [wh._id.toString(), wh]));

    const findLocationName = (warehouseId, locationId) => {
      if (!warehouseId || !locationId) return "";
      const wh = warehouseMap.get(warehouseId);
      if (!wh) return "";
      const loc = (wh.locations || []).find((l) => l._id.toString() === locationId);
      return loc ? `${loc.name} (${loc.code})` : "";
    };

    const result = docs.map((doc) => {
      const line = doc.lines[0];
      const product = line ? productMap.get(line.productId?.toString()) : null;
      const sourceWarehouseId = doc.sourceWarehouseId?._id?.toString() || null;
      const destinationWarehouseId = doc.destinationWarehouseId?._id?.toString() || null;
      const sourceLocationId = line?.sourceLocationId?.toString() || null;
      const destinationLocationId = line?.destinationLocationId?.toString() || null;
      const sourceWarehouseLabel = doc.sourceWarehouseId
        ? `${doc.sourceWarehouseId.name} (${doc.sourceWarehouseId.code})`
        : "Unknown Warehouse";
      const destinationWarehouseLabel = doc.destinationWarehouseId
        ? `${doc.destinationWarehouseId.name} (${doc.destinationWarehouseId.code})`
        : "Unknown Warehouse";
      const sourceLocationName = findLocationName(sourceWarehouseId, sourceLocationId);
      const destinationLocationName = findLocationName(destinationWarehouseId, destinationLocationId);

      const fromLabel = sourceLocationName ? `${sourceWarehouseLabel} • ${sourceLocationName}` : sourceWarehouseLabel;
      const toLabel = destinationLocationName ? `${destinationWarehouseLabel} • ${destinationLocationName}` : destinationWarehouseLabel;
      return {
        id: doc._id,
        reference: doc.documentNo,
        productId: line?.productId?.toString() || null,
        productName: product?.name || "Unknown",
        productSku: product?.sku || "",
        quantity: line?.qty || 0,
        from: fromLabel,
        to: toLabel,
        sourceWarehouseId,
        destinationWarehouseId,
        sourceLocationId,
        destinationLocationId,
        sourceLocationName,
        destinationLocationName,
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
    console.error("List transfers failed", error);
    return res.status(500).json({ message: "List transfers failed" });
  }
});

// POST /api/operations/transfers
router.post("/transfers", requireRole("admin", "inventory_manager"), async (req, res) => {
  try {
    const {
      productId,
      sourceWarehouseId,
      destinationWarehouseId,
      sourceLocationId,
      destinationLocationId,
      qty,
      partnerName,
      scheduleDate,
      status,
    } = req.body;

    if (!productId || !sourceWarehouseId || !destinationWarehouseId || !qty) {
      return res.status(400).json({ message: "productId, sourceWarehouseId, destinationWarehouseId, and qty are required" });
    }

    const normalizedSourceLocationId = sourceLocationId || null;
    const normalizedDestinationLocationId = destinationLocationId || null;

    if (
      String(sourceWarehouseId) === String(destinationWarehouseId) &&
      String(normalizedSourceLocationId || "") === String(normalizedDestinationLocationId || "")
    ) {
      return res.status(400).json({ message: "Transfer must change warehouse or location" });
    }

    const quantity = Number(qty);
    if (Number.isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ message: "qty must be a positive number" });
    }

    const [product, sourceWarehouse, destinationWarehouse] = await Promise.all([
      Product.findById(productId).lean(),
      Warehouse.findById(sourceWarehouseId).lean(),
      Warehouse.findById(destinationWarehouseId).lean(),
    ]);

    if (!product) return res.status(404).json({ message: "Product not found" });
    if (!sourceWarehouse) return res.status(404).json({ message: "Source warehouse not found" });
    if (!destinationWarehouse) return res.status(404).json({ message: "Destination warehouse not found" });

    if (normalizedSourceLocationId) {
      const hasLocation = (sourceWarehouse.locations || []).some(
        (loc) => loc._id.toString() === normalizedSourceLocationId
      );
      if (!hasLocation) {
        return res.status(404).json({ message: "Source location not found" });
      }
    }

    if (normalizedDestinationLocationId) {
      const hasLocation = (destinationWarehouse.locations || []).some(
        (loc) => loc._id.toString() === normalizedDestinationLocationId
      );
      if (!hasLocation) {
        return res.status(404).json({ message: "Destination location not found" });
      }
    }

    // Stock check disabled as per request
    /*
    const sourceBalance = await StockBalance.findOne({
      productId: product._id,
      warehouseId: sourceWarehouse._id,
      locationId: normalizedSourceLocationId,
    });

    if (!sourceBalance) {
      const scopeLabel = normalizedSourceLocationId ? "selected location" : "warehouse level";
      return res.status(400).json({
        message: `No stock at ${scopeLabel}. Choose a location that has stock.`,
      });
    }

    const available = sourceBalance.qtyOnHand - (sourceBalance.qtyReserved || 0);
    if (quantity > available) {
      return res.status(400).json({
        message: `Insufficient stock at ${sourceWarehouse.name}. Available: ${available}, Requested: ${quantity}.`,
      });
    }
    */

    const documentNo = await nextDocumentNo("transfer");

    const doc = await InventoryDoc.create({
      type: "transfer",
      status: status || "ready",
      documentNo,
      partnerName: partnerName || "",
      scheduledDate: scheduleDate ? new Date(scheduleDate) : new Date(),
      sourceWarehouseId: sourceWarehouse._id,
      destinationWarehouseId: destinationWarehouse._id,
      createdBy: req.user._id,
      lines: [
        {
          productId: product._id,
          uom: product.uom,
          qty: quantity,
          sourceLocationId: normalizedSourceLocationId,
          destinationLocationId: normalizedDestinationLocationId,
        },
      ],
    });

    return res.status(201).json({
      id: doc._id,
      reference: documentNo,
      productId: product._id,
      productName: product.name,
      sourceWarehouseId: sourceWarehouse._id,
      destinationWarehouseId: destinationWarehouse._id,
      quantity,
      status: doc.status,
    });
  } catch (error) {
    console.error("Create transfer failed", error);
    return res.status(500).json({ message: "Create transfer failed" });
  }
});

// PUT /api/operations/transfers/:id/confirm — Warehouse staff confirms internal transfer
router.put("/transfers/:id/confirm", requireRole("admin", "inventory_manager", "warehouse_staff"), async (req, res) => {
  try {
    const doc = await InventoryDoc.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Transfer order not found" });
    if (doc.type !== "transfer") return res.status(400).json({ message: "Invalid document type" });
    if (doc.status === "done") return res.status(400).json({ message: "Transfer already completed" });

    const line = doc.lines[0];
    if (!line) return res.status(400).json({ message: "Transfer has no items" });

    const product = await Product.findById(line.productId);
    const sourceWarehouse = await Warehouse.findById(doc.sourceWarehouseId);
    const destinationWarehouse = await Warehouse.findById(doc.destinationWarehouseId);

    if (!product || !sourceWarehouse || !destinationWarehouse) {
      return res.status(404).json({ message: "Product or Warehouse not found" });
    }

    // Double check stock check disabled as per request
    let sourceBalance = await StockBalance.findOne({
      productId: product._id,
      warehouseId: sourceWarehouse._id,
      locationId: line.sourceLocationId || null,
    });

    if (!sourceBalance) {
      // Create record if it doesn't exist
      sourceBalance = await StockBalance.create({
        productId: product._id,
        warehouseId: sourceWarehouse._id,
        locationId: line.sourceLocationId || null,
        qtyOnHand: 0,
        qtyReserved: 0
      });
    }

    // 1. Deduct from source
    sourceBalance.qtyOnHand -= line.qty;
    await sourceBalance.save();

    // 2. Add to destination
    let destinationBalance = await StockBalance.findOne({
      productId: product._id,
      warehouseId: destinationWarehouse._id,
      locationId: line.destinationLocationId || null,
    });

    if (destinationBalance) {
      destinationBalance.qtyOnHand += line.qty;
      await destinationBalance.save();
    } else {
      destinationBalance = await StockBalance.create({
        productId: product._id,
        warehouseId: destinationWarehouse._id,
        locationId: line.destinationLocationId || null,
        qtyOnHand: line.qty,
        qtyReserved: 0,
      });
    }

    // 3. Record in ledger
    await StockLedger.create([
      {
        productId: product._id,
        warehouseId: sourceWarehouse._id,
        locationId: line.sourceLocationId || null,
        documentId: doc._id,
        type: "transfer",
        qtyIn: 0,
        qtyOut: line.qty,
        balanceAfter: sourceBalance.qtyOnHand,
      },
      {
        productId: product._id,
        warehouseId: destinationWarehouse._id,
        locationId: line.destinationLocationId || null,
        documentId: doc._id,
        type: "transfer",
        qtyIn: line.qty,
        qtyOut: 0,
        balanceAfter: destinationBalance.qtyOnHand,
      },
    ]);

    // 4. Update status
    doc.status = "done";
    doc.validatedBy = req.user._id;
    doc.validatedAt = new Date();
    await doc.save();

    await syncProductOnHand(product._id);

    return res.json({ message: "Transfer confirmed and stock moved", status: doc.status });
  } catch (error) {
    console.error("Confirm transfer failed", error);
    return res.status(500).json({ message: "Confirm transfer failed" });
  }
});

export default router;
