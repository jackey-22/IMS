import { Router } from "express";
import Warehouse from "../models/Warehouse.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

// Basic browsing allowed for all staff, management restricted
router.use(authenticate);

const normalizeLocationPayload = (location) => ({
  name: String(location?.name || "").trim(),
  code: String(location?.code || "").trim(),
  type: String(location?.type || "location").trim() || "location",
  parentCode: location?.parentCode ? String(location.parentCode).trim() : null,
  isActive: location?.isActive ?? true
});

const getChildrenMap = (locations) => {
  const childrenMap = new Map();

  for (const loc of locations) {
    const key = loc.parentCode ? loc.parentCode.toLowerCase() : null;
    if (!childrenMap.has(key)) {
      childrenMap.set(key, []);
    }
    childrenMap.get(key).push(loc.code.toLowerCase());
  }

  return childrenMap;
};

const hasCycle = (locations) => {
  const childrenMap = getChildrenMap(locations);
  const visited = new Set();
  const inPath = new Set();

  const dfs = (code) => {
    if (inPath.has(code)) return true;
    if (visited.has(code)) return false;

    visited.add(code);
    inPath.add(code);

    for (const childCode of childrenMap.get(code) || []) {
      if (dfs(childCode)) return true;
    }

    inPath.delete(code);
    return false;
  };

  for (const loc of locations) {
    if (dfs(loc.code.toLowerCase())) {
      return true;
    }
  }

  return false;
};

const validateHierarchy = (locations) => {
  const normalized = locations.map(normalizeLocationPayload);

  const missingNameOrCode = normalized.find((loc) => !loc.name || !loc.code);
  if (missingNameOrCode) {
    return { ok: false, message: "Each location requires a name and code" };
  }

  const codeSet = new Set();
  for (const loc of normalized) {
    const key = loc.code.toLowerCase();
    if (codeSet.has(key)) {
      return { ok: false, message: `Duplicate location code: ${loc.code}` };
    }
    codeSet.add(key);
  }

  for (const loc of normalized) {
    if (!loc.parentCode) continue;

    const parentKey = loc.parentCode.toLowerCase();
    const selfKey = loc.code.toLowerCase();

    if (parentKey === selfKey) {
      return { ok: false, message: `Location ${loc.code} cannot be its own parent` };
    }

    if (!codeSet.has(parentKey)) {
      return {
        ok: false,
        message: `Parent location code "${loc.parentCode}" not found for "${loc.code}"`
      };
    }
  }

  if (hasCycle(normalized)) {
    return { ok: false, message: "Location hierarchy contains a cycle" };
  }

  return { ok: true, normalized };
};

const collectDescendantCodes = (locations, rootCode) => {
  const childrenMap = getChildrenMap(locations.map(normalizeLocationPayload));
  const descendants = new Set();
  const queue = [String(rootCode).trim().toLowerCase()];

  while (queue.length) {
    const parent = queue.shift();
    const children = childrenMap.get(parent) || [];

    for (const child of children) {
      if (!descendants.has(child)) {
        descendants.add(child);
        queue.push(child);
      }
    }
  }

  return descendants;
};

router.post("/", requireRole("admin", "inventory_manager"), async (req, res) => {
  try {
    const { name, code, address, isActive, locations } = req.body;

    if (!name || !code) {
      return res.status(400).json({ message: "Name and code are required" });
    }

    let validatedLocations = [];
    if (Array.isArray(locations)) {
      const validation = validateHierarchy(locations);
      if (!validation.ok) {
        return res.status(400).json({ message: validation.message });
      }
      validatedLocations = validation.normalized;
    }

    const warehouse = await Warehouse.create({
      name: String(name).trim(),
      code: String(code).trim(),
      address,
      isActive: isActive ?? true,
      locations: validatedLocations
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
      filter.$or = [{ name: new RegExp(String(q), "i") }, { code: new RegExp(String(q), "i") }];
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

router.put("/:id", requireRole("admin", "inventory_manager"), async (req, res) => {
  try {
    const updates = req.body;
    if (updates.name) {
      updates.name = String(updates.name).trim();
    }
    if (updates.code) {
      updates.code = String(updates.code).trim();
    }

    if (Array.isArray(updates.locations)) {
      const validation = validateHierarchy(updates.locations);
      if (!validation.ok) {
        return res.status(400).json({ message: validation.message });
      }
      updates.locations = validation.normalized;
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

router.post("/:id/locations", requireRole("admin", "inventory_manager"), async (req, res) => {
  try {
    const { name, code, type, parentCode, isActive } = req.body;

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

    const trimmedParentCode = parentCode ? String(parentCode).trim() : null;
    if (trimmedParentCode) {
      const parentExists = warehouse.locations.some((loc) => loc.code.toLowerCase() === trimmedParentCode.toLowerCase());
      if (!parentExists) {
        return res.status(400).json({ message: "Parent location code does not exist" });
      }
    }

    warehouse.locations.push({
      name: String(name).trim(),
      code: trimmedCode,
      type: String(type || "location").trim() || "location",
      parentCode: trimmedParentCode,
      isActive: isActive ?? true
    });

    await warehouse.save();
    return res.status(201).json(warehouse);
  } catch (error) {
    console.error("Create location failed", error);
    return res.status(500).json({ message: "Create location failed" });
  }
});

router.put("/:id/locations/:locationId", requireRole("admin", "inventory_manager"), async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);
    if (!warehouse) {
      return res.status(404).json({ message: "Warehouse not found" });
    }

    const location = warehouse.locations.id(req.params.locationId);
    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }

    const { name, code, type, parentCode, isActive } = req.body;
    const originalCode = location.code;

    if (name !== undefined) location.name = String(name).trim();
    if (type !== undefined) location.type = String(type).trim() || "location";
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

      // Keep descendants attached when a parent's code changes.
      for (const loc of warehouse.locations) {
        if (loc._id.toString() !== req.params.locationId && loc.parentCode?.toLowerCase() === originalCode.toLowerCase()) {
          loc.parentCode = trimmedCode;
        }
      }
    }

    if (parentCode !== undefined) {
      const trimmedParentCode = parentCode ? String(parentCode).trim() : null;
      const currentCode = (code !== undefined ? String(code).trim() : location.code).toLowerCase();

      if (trimmedParentCode?.toLowerCase() === currentCode) {
        return res.status(400).json({ message: "Location cannot be its own parent" });
      }

      if (trimmedParentCode) {
        const parentExists = warehouse.locations.some((loc) => loc.code.toLowerCase() === trimmedParentCode.toLowerCase());
        if (!parentExists) {
          return res.status(400).json({ message: "Parent location code does not exist" });
        }

        const descendants = collectDescendantCodes(warehouse.locations, location.code);
        if (descendants.has(trimmedParentCode.toLowerCase())) {
          return res.status(400).json({ message: "Cannot move a location under its own descendant" });
        }
      }

      location.parentCode = trimmedParentCode;
    }

    const hierarchyValidation = validateHierarchy(warehouse.locations);
    if (!hierarchyValidation.ok) {
      return res.status(400).json({ message: hierarchyValidation.message });
    }

    warehouse.locations = hierarchyValidation.normalized;

    await warehouse.save();
    return res.json(warehouse);
  } catch (error) {
    console.error("Update location failed", error);
    return res.status(500).json({ message: "Update location failed" });
  }
});

router.delete("/:id/locations/:locationId", requireRole("admin", "inventory_manager"), async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);
    if (!warehouse) {
      return res.status(404).json({ message: "Warehouse not found" });
    }

    const location = warehouse.locations.id(req.params.locationId);
    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }

    const descendantCodes = collectDescendantCodes(warehouse.locations, location.code);
    const codesToDelete = new Set([location.code.toLowerCase(), ...descendantCodes]);

    warehouse.locations = warehouse.locations.filter((loc) => !codesToDelete.has(loc.code.toLowerCase()));

    await warehouse.save();
    return res.json(warehouse);
  } catch (error) {
    console.error("Delete location failed", error);
    return res.status(500).json({ message: "Delete location failed" });
  }
});

router.delete("/:id", requireRole("admin", "inventory_manager"), async (req, res) => {
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
