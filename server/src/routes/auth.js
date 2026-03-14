import { Router } from "express";
import bcrypt from "bcryptjs";
import validator from "validator";
import User from "../models/User.js";
import PasswordResetOtp from "../models/PasswordResetOtp.js";
import { sendResetOtpEmail } from "../utils/email.js";
import { signToken, sanitizeUser } from "../utils/jwt.js";

const router = Router();

const normalizeEmail = (email) => email.trim().toLowerCase();

const getOtpTtlMinutes = () => {
  const ttl = Number(process.env.OTP_TTL_MINUTES || 10);
  return Number.isNaN(ttl) || ttl <= 0 ? 10 : ttl;
};

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    if (!validator.isEmail(String(email))) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    if (String(password).length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const normalizedEmail = normalizeEmail(String(email));
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const passwordHash = await bcrypt.hash(String(password), 12);
    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      passwordHash,
      role: role || "inventory_manager"
    });

    const token = signToken(user);

    return res.status(201).json({
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    console.error("Register failed", error);
    return res.status(500).json({ message: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = normalizeEmail(String(email));
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const passwordMatch = await bcrypt.compare(String(password), user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(user);
    return res.json({ token, user: sanitizeUser(user) });
  } catch (error) {
    console.error("Login failed", error);
    return res.status(500).json({ message: "Login failed" });
  }
});

router.post("/password-reset/request", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !validator.isEmail(String(email))) {
      return res.status(400).json({ message: "Valid email is required" });
    }

    const normalizedEmail = normalizeEmail(String(email));
    const user = await User.findOne({ email: normalizedEmail });

    if (user) {
      const otp = generateOtp();
      const otpHash = await bcrypt.hash(otp, 10);
      const ttlMinutes = getOtpTtlMinutes();
      const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

      await PasswordResetOtp.updateMany(
        { email: normalizedEmail, used: false },
        { $set: { used: true } }
      );

      await PasswordResetOtp.create({
        email: normalizedEmail,
        otpHash,
        expiresAt
      });

      await sendResetOtpEmail({
        to: normalizedEmail,
        otp,
        name: user.name
      });
    }

    return res.json({ message: "If that email exists, an OTP was sent." });
  } catch (error) {
    console.error("Password reset request failed", error);
    return res.status(500).json({ message: "Password reset request failed" });
  }
});

router.post("/password-reset/confirm", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Email, OTP, and new password are required" });
    }

    if (!validator.isEmail(String(email))) {
      return res.status(400).json({ message: "Valid email is required" });
    }

    if (String(newPassword).length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const normalizedEmail = normalizeEmail(String(email));
    const record = await PasswordResetOtp.findOne({
      email: normalizedEmail,
      used: false,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    if (!record) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const otpMatch = await bcrypt.compare(String(otp), record.otpHash);
    if (!otpMatch) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.passwordHash = await bcrypt.hash(String(newPassword), 12);
    await user.save();

    record.used = true;
    await record.save();

    return res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Password reset confirm failed", error);
    return res.status(500).json({ message: "Password reset failed" });
  }
});

export default router;
