import { Router } from "express";
import Category from "../models/Category.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.post("/", requireRole("admin", "inventory_manager"), async (req, res) => {
  try {
    const { name, parentId } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const category = await Category.create({
      name: String(name).trim(),
      parentId: parentId || null
    });

    return res.status(201).json(category);
  } catch (error) {
    console.error("Create category failed", error);
    return res.status(500).json({ message: "Create category failed" });
  }
});

router.get("/", async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ createdAt: -1 });
    return res.json(categories);
  } catch (error) {
    console.error("List categories failed", error);
    return res.status(500).json({ message: "List categories failed" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.json(category);
  } catch (error) {
    console.error("Get category failed", error);
    return res.status(500).json({ message: "Get category failed" });
  }
});

router.put("/:id", requireRole("admin", "inventory_manager"), async (req, res) => {
  try {
    const updates = req.body;
    if (updates.name) {
      updates.name = String(updates.name).trim();
    }

    const category = await Category.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.json(category);
  } catch (error) {
    console.error("Update category failed", error);
    return res.status(500).json({ message: "Update category failed" });
  }
});

router.delete("/:id", requireRole("admin", "inventory_manager"), async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.json({ message: "Category deleted" });
  } catch (error) {
    console.error("Delete category failed", error);
    return res.status(500).json({ message: "Delete category failed" });
  }
});

export default router;
