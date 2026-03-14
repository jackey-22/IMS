import { Router } from "express";
import Product from "../models/Product.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { name, sku, categoryId, uom, description, barcode, reorderPoint, reorderQty, isActive } =
      req.body;

    if (!name || !sku || !uom) {
      return res.status(400).json({ message: "Name, SKU, and UOM are required" });
    }

    const product = await Product.create({
      name: String(name).trim(),
      sku: String(sku).trim(),
      categoryId: categoryId || null,
      uom: String(uom).trim(),
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
    return res.json(products);
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

    return res.json(product);
  } catch (error) {
    console.error("Get product failed", error);
    return res.status(500).json({ message: "Get product failed" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updates = req.body;
    if (updates.name) {
      updates.name = String(updates.name).trim();
    }
    if (updates.sku) {
      updates.sku = String(updates.sku).trim();
    }
    if (updates.uom) {
      updates.uom = String(updates.uom).trim();
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json(product);
  } catch (error) {
    console.error("Update product failed", error);
    return res.status(500).json({ message: "Update product failed" });
  }
});

router.delete("/:id", async (req, res) => {
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
