import { Router } from "express";
import bcrypt from "bcryptjs";
import validator from "validator";
import User from "../models/User.js";
import { authenticate } from "../middleware/auth.js";
import { sanitizeUser } from "../utils/jwt.js";

const router = Router();

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{9,}$/;

router.use(authenticate);

router.get("/me", async (req, res) => {
  return res.json({ user: sanitizeUser(req.user) });
});

router.patch("/me", async (req, res) => {
  try {
    const { name, email } = req.body;
    const updates = {};

    if (name !== undefined) {
      const trimmedName = String(name).trim();
      if (!trimmedName) {
        return res.status(400).json({ message: "Name is required" });
      }
      updates.name = trimmedName;
    }

    if (email !== undefined) {
      const normalizedEmail = String(email).trim().toLowerCase();
      if (!validator.isEmail(normalizedEmail)) {
        return res.status(400).json({ message: "Invalid email address" });
      }

      const existingEmailUser = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: req.user._id }
      });
      if (existingEmailUser) {
        return res.status(409).json({ message: "Email ID already exists" });
      }

      updates.email = normalizedEmail;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true
    }).select("-passwordHash");

    return res.json({ user: sanitizeUser(user) });
  } catch (error) {
    console.error("Update profile failed", error);
    return res.status(500).json({ message: "Failed to update profile" });
  }
});

router.patch("/me/password", async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "Current password, new password, and confirm password are required" });
    }

    if (String(newPassword) !== String(confirmPassword)) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (!passwordPattern.test(String(newPassword))) {
      return res.status(400).json({
        message: "Password must be at least 9 characters and include uppercase, lowercase, and special character"
      });
    }

    const user = await User.findById(req.user._id);
    const passwordMatch = await bcrypt.compare(String(currentPassword), user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    user.passwordHash = await bcrypt.hash(String(newPassword), 12);
    await user.save();

    return res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Change password failed", error);
    return res.status(500).json({ message: "Failed to change password" });
  }
});

export default router;