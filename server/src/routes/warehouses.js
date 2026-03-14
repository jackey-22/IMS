import { Router } from "express";
import Warehouse from "../models/Warehouse.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(authenticate, requireRole("admin"));

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
    if (error?.code === 11000) {
      return res.status(409).json({ message: "Warehouse code already exists" });
    }
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
    if (error?.code === 11000) {
      return res.status(409).json({ message: "Warehouse code already exists" });
    }
    return res.status(500).json({ message: "Update warehouse failed" });
  }
});

router.post("/:id/locations", async (req, res) => {
  try {
    const { name, code, type, isActive } = req.body;

    if (!name || !code) {
      return res.status(400).json({ message: "Location name and code are required" });
    }

    const warehouse = await Warehouse.findById(req.params.id);
    if (!warehouse) {
      return res.status(404).json({ message: "Warehouse not found" });
    }

    const trimmedCode = String(code).trim();
    const codeExists = warehouse.locations.some((loc) => loc.code.toLowerCase() === trimmedCode.toLowerCase());
    if (codeExists) {
      return res.status(409).json({ message: "Location code already exists in this warehouse" });
    }

    warehouse.locations.push({
      name: String(name).trim(),
      code: trimmedCode,
      type: type || "rack",
      isActive: isActive ?? true
    });

    await warehouse.save();
    return res.status(201).json(warehouse);
  } catch (error) {
    console.error("Create location failed", error);
    return res.status(500).json({ message: "Create location failed" });
  }
});

router.put("/:id/locations/:locationId", async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);
    if (!warehouse) {
      return res.status(404).json({ message: "Warehouse not found" });
    }

    const location = warehouse.locations.id(req.params.locationId);
    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }

    const { name, code, type, isActive } = req.body;

    if (name !== undefined) location.name = String(name).trim();
    if (type !== undefined) location.type = type;
    if (isActive !== undefined) location.isActive = Boolean(isActive);
    if (code !== undefined) {
      const trimmedCode = String(code).trim();
      const codeExists = warehouse.locations.some(
        (loc) => loc._id.toString() !== req.params.locationId && loc.code.toLowerCase() === trimmedCode.toLowerCase()
      );
      if (codeExists) {
        return res.status(409).json({ message: "Location code already exists in this warehouse" });
      }
      location.code = trimmedCode;
    }

    await warehouse.save();
    return res.json(warehouse);
  } catch (error) {
    console.error("Update location failed", error);
    return res.status(500).json({ message: "Update location failed" });
  }
});

router.delete("/:id/locations/:locationId", async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);
    if (!warehouse) {
      return res.status(404).json({ message: "Warehouse not found" });
    }

    const location = warehouse.locations.id(req.params.locationId);
    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }

    location.deleteOne();
    await warehouse.save();
    return res.json(warehouse);
  } catch (error) {
    console.error("Delete location failed", error);
    return res.status(500).json({ message: "Delete location failed" });
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
