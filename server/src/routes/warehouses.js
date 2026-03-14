import { Router } from "express";
import Warehouse from "../models/Warehouse.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { name, code, address, isActive, locations } = req.body;

    if (!name || !code) {
      return res.status(400).json({ message: "Name and code are required" });
    }

    const warehouse = await Warehouse.create({
      name: String(name).trim(),
      code: String(code).trim(),
      address,
      isActive: isActive ?? true,
      locations: Array.isArray(locations) ? locations : []
    });

    return res.status(201).json(warehouse);
  } catch (error) {
    console.error("Create warehouse failed", error);
    return res.status(500).json({ message: "Create warehouse failed" });
  }
});

router.get("/", async (req, res) => {
  try {
    const { q, isActive } = req.query;
    const filter = {};

    if (q) {
      filter.$or = [
        { name: new RegExp(String(q), "i") },
        { code: new RegExp(String(q), "i") }
      ];
    }

    if (isActive !== undefined) {
      filter.isActive = String(isActive).toLowerCase() === "true";
    }

    const warehouses = await Warehouse.find(filter).sort({ createdAt: -1 });
    return res.json(warehouses);
  } catch (error) {
    console.error("List warehouses failed", error);
    return res.status(500).json({ message: "List warehouses failed" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);
    if (!warehouse) {
      return res.status(404).json({ message: "Warehouse not found" });
    }

    return res.json(warehouse);
  } catch (error) {
    console.error("Get warehouse failed", error);
    return res.status(500).json({ message: "Get warehouse failed" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updates = req.body;
    if (updates.name) {
      updates.name = String(updates.name).trim();
    }
    if (updates.code) {
      updates.code = String(updates.code).trim();
    }

    const warehouse = await Warehouse.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    if (!warehouse) {
      return res.status(404).json({ message: "Warehouse not found" });
    }

    return res.json(warehouse);
  } catch (error) {
    console.error("Update warehouse failed", error);
    return res.status(500).json({ message: "Update warehouse failed" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const warehouse = await Warehouse.findByIdAndDelete(req.params.id);
    if (!warehouse) {
      return res.status(404).json({ message: "Warehouse not found" });
    }

    return res.json({ message: "Warehouse deleted" });
  } catch (error) {
    console.error("Delete warehouse failed", error);
    return res.status(500).json({ message: "Delete warehouse failed" });
  }
});

export default router;
