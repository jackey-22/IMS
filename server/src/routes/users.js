import { Router } from "express";
import bcrypt from "bcryptjs";
import validator from "validator";
import User from "../models/User.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { sanitizeUser } from "../utils/jwt.js";

const router = Router();

const loginIdPattern = /^[A-Za-z0-9_-]{6,24}$/;
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{9,}$/;

// All users routes require authentication + admin role
router.use(authenticate, requireRole("admin"));

// GET /api/users — list all users except the requesting admin
router.get("/", async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select("-passwordHash")
      .sort({ createdAt: -1 });
    return res.json(users.map(sanitizeUser));
  } catch (error) {
    console.error("List users failed", error);
    return res.status(500).json({ message: "Failed to retrieve users" });
  }
});

// POST /api/users — admin creates a new user
router.post("/", async (req, res) => {
  try {
    const { name, loginId, email, password, role } = req.body;

    if (!loginId || !email || !password) {
      return res.status(400).json({ message: "Login ID, email, and password are required" });
    }

    if (!validator.isEmail(String(email))) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    const normalizedLoginId = String(loginId).trim();
    if (!loginIdPattern.test(normalizedLoginId)) {
      return res.status(400).json({
        message: "Login ID must be 6 to 24 characters using letters, numbers, hyphen, or underscore"
      });
    }

    if (!passwordPattern.test(String(password))) {
      return res.status(400).json({
        message: "Password must be at least 9 characters and include uppercase, lowercase, and special character"
      });
    }

    const allowedRoles = ["admin", "inventory_manager", "warehouse_staff"];
    const assignedRole = allowedRoles.includes(role) ? role : "inventory_manager";

    const normalizedEmail = String(email).trim().toLowerCase();
    const passwordHash = await bcrypt.hash(String(password), 12);
    const user = await User.create({
      name: String(name || normalizedLoginId).trim(),
      loginId: normalizedLoginId,
      email: normalizedEmail,
      passwordHash,
      role: assignedRole
    });

    return res.status(201).json(sanitizeUser(user));
  } catch (error) {
    console.error("Create user failed", error);
    if (error?.code === 11000) {
      const key = error?.keyPattern ? Object.keys(error.keyPattern)[0] : null;
      const msg = key === "email" ? "Email ID already exists" : key === "loginId" ? "Login ID already exists" : "A unique field already exists";
      return res.status(409).json({ message: msg });
    }
    return res.status(500).json({ message: "Failed to create user" });
  }
});

// PATCH /api/users/:id/role — change a user's role
router.patch("/:id/role", async (req, res) => {
  try {
    const { role } = req.body;
    const allowedRoles = ["admin", "inventory_manager", "warehouse_staff"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role. Must be admin, inventory_manager, or warehouse_staff" });
    }

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot change your own role" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select("-passwordHash");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(sanitizeUser(user));
  } catch (error) {
    console.error("Update role failed", error);
    return res.status(500).json({ message: "Failed to update role" });
  }
});

// PATCH /api/users/:id/status — enable or disable a user account
router.patch("/:id/status", async (req, res) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({ message: "isActive must be a boolean" });
    }

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot change your own account status" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select("-passwordHash");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(sanitizeUser(user));
  } catch (error) {
    console.error("Update status failed", error);
    return res.status(500).json({ message: "Failed to update account status" });
  }
});

// PATCH /api/users/:id/password — admin resets a user's password
router.patch("/:id/password", async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || !passwordPattern.test(String(newPassword))) {
      return res.status(400).json({
        message: "Password must be at least 9 characters and include uppercase, lowercase, and special character"
      });
    }

    const passwordHash = await bcrypt.hash(String(newPassword), 12);
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { passwordHash },
      { new: true }
    ).select("-passwordHash");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Reset password failed", error);
    return res.status(500).json({ message: "Failed to reset password" });
  }
});

// DELETE /api/users/:id — permanently delete a user
router.delete("/:id", async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user failed", error);
    return res.status(500).json({ message: "Failed to delete user" });
  }
});

export default router;
