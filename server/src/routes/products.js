import { Router } from "express";
import Product from "../models/Product.js";
import StockBalance from "../models/StockBalance.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

async function getOnHandMap(productIds) {
  if (!productIds.length) {
    return new Map();
  }

  const balances = await StockBalance.aggregate([
    {
      $match: {
        productId: {
          $in: productIds,
        },
      },
    },
    {
      $group: {
        _id: "$productId",
        qtyOnHand: {
          $sum: "$qtyOnHand",
        },
      },
    },
  ]);

  return new Map(
    balances.map((item) => [item._id.toString(), Number(item.qtyOnHand) || 0])
  );
}

router.post("/", requireRole("admin", "inventory_manager"), async (req, res) => {
  try {
    const {
      name,
      sku,
      categoryId,
      uom,
      initialStock,
      description,
      barcode,
      reorderPoint,
      reorderQty,
      isActive
    } =
      req.body;

    if (!name || !sku || !uom) {
      return res.status(400).json({ message: "Name, SKU, and UOM are required" });
    }

    const product = await Product.create({
      name: String(name).trim(),
      sku: String(sku).trim(),
      categoryId: categoryId || null,
      uom: String(uom).trim(),
      initialStock:
        initialStock === undefined || initialStock === null || initialStock === ""
          ? 0
          : Number(initialStock),
      description,
      barcode,
      reorderPoint: reorderPoint ?? 0,
      reorderQty: reorderQty ?? 0,
      isActive: isActive ?? true
    });

    return res.status(201).json(product);
  } catch (error) {
    console.error("Create product failed", error);
    return res.status(500).json({ message: "Create product failed" });
  }
});

router.get("/", async (req, res) => {
  try {
    const { q, categoryId, isActive } = req.query;
    const filter = {};

    if (q) {
      filter.$or = [
        { name: new RegExp(String(q), "i") },
        { sku: new RegExp(String(q), "i") }
      ];
    }

    if (categoryId) {
      filter.categoryId = categoryId;
    }

    if (isActive !== undefined) {
      filter.isActive = String(isActive).toLowerCase() === "true";
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    const onHandMap = await getOnHandMap(products.map((product) => product._id));

    return res.json(
      products.map((product) => {
        const currentOnHand = onHandMap.has(product._id.toString())
          ? onHandMap.get(product._id.toString())
          : product.initialStock;

        return {
          ...product.toObject(),
          currentOnHand,
        };
      })
    );
  } catch (error) {
    console.error("List products failed", error);
    return res.status(500).json({ message: "List products failed" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    const onHandMap = await getOnHandMap([product._id]);
    const currentOnHand = onHandMap.has(product._id.toString())
      ? onHandMap.get(product._id.toString())
      : product.initialStock;

    return res.json({
      ...product.toObject(),
      currentOnHand,
    });
  } catch (error) {
    console.error("Get product failed", error);
    return res.status(500).json({ message: "Get product failed" });
  }
});

router.put("/:id", requireRole("admin", "inventory_manager"), async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.name) {
      updates.name = String(updates.name).trim();
    }
    if (updates.sku) {
      updates.sku = String(updates.sku).trim();
    }
    if (updates.uom) {
      updates.uom = String(updates.uom).trim();
    }
    if (Object.prototype.hasOwnProperty.call(updates, "initialStock")) {
      updates.initialStock =
        updates.initialStock === undefined || updates.initialStock === null || updates.initialStock === ""
          ? 0
          : Number(updates.initialStock);
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const onHandMap = await getOnHandMap([product._id]);
    const currentOnHand = onHandMap.has(product._id.toString())
      ? onHandMap.get(product._id.toString())
      : product.initialStock;

    return res.json({
      ...product.toObject(),
      currentOnHand,
    });
  } catch (error) {
    console.error("Update product failed", error);
    return res.status(500).json({ message: "Update product failed" });
  }
});

router.delete("/:id", requireRole("admin", "inventory_manager"), async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json({ message: "Product deleted" });
  } catch (error) {
    console.error("Delete product failed", error);
    return res.status(500).json({ message: "Delete product failed" });
  }
});

export default router;
