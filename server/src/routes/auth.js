import { Router } from "express";
import bcrypt from "bcryptjs";
import validator from "validator";
import User from "../models/User.js";
import PasswordResetOtp from "../models/PasswordResetOtp.js";
import { isEmailConfigured, sendResetOtpEmail } from "../utils/email.js";
import { signToken, sanitizeUser } from "../utils/jwt.js";

const router = Router();

const normalizeEmail = (email) => email.trim().toLowerCase();
const normalizeLoginId = (loginId) => loginId.trim();

const getOtpTtlMinutes = () => {
  const ttl = Number(process.env.OTP_TTL_MINUTES || 10);
  return Number.isNaN(ttl) || ttl <= 0 ? 10 : ttl;
};

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));
const loginIdPattern = /^[A-Za-z0-9_]{6,12}$/;
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{9,}$/;

const validatePassword = (password) => passwordPattern.test(String(password));

const getDuplicateKeyMessage = (error) => {
  const key = error?.keyPattern ? Object.keys(error.keyPattern)[0] : null;

  if (key === "email") {
    return "Email ID already exists";
  }

  if (key === "loginId") {
    return "Login ID already exists";
  }

  return "A unique field already exists";
};

router.post("/register", async (req, res) => {
  try {
    const { name, loginId, email, password, confirmPassword, role } = req.body;

    if (!loginId || !email || !password || !confirmPassword) {
      return res.status(400).json({
        message: "Login ID, email, password, and confirm password are required"
      });
    }

    if (!validator.isEmail(String(email))) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    const normalizedLoginId = normalizeLoginId(String(loginId));
    if (!loginIdPattern.test(normalizedLoginId)) {
      return res.status(400).json({
        message: "Login ID must be 6 to 12 characters using letters, numbers, or underscore"
      });
    }

    if (String(password) !== String(confirmPassword)) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 9 characters and include uppercase, lowercase, and special character"
      });
    }

    const normalizedEmail = normalizeEmail(String(email));
    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { loginId: normalizedLoginId }]
    });
    if (existingUser?.email === normalizedEmail) {
      return res.status(409).json({ message: "Email ID already exists" });
    }

    if (existingUser?.loginId === normalizedLoginId) {
      return res.status(409).json({ message: "Login ID already exists" });
    }

    const passwordHash = await bcrypt.hash(String(password), 12);
    const user = await User.create({
      name: String(name || normalizedLoginId).trim(),
      loginId: normalizedLoginId,
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
    if (error?.code === 11000) {
      return res.status(409).json({ message: getDuplicateKeyMessage(error) });
    }
    return res.status(500).json({ message: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { loginId, password } = req.body;

    if (!loginId || !password) {
      return res.status(400).json({ message: "Login ID and password are required" });
    }

    const normalizedLoginId = normalizeLoginId(String(loginId));
    const user = await User.findOne({ loginId: normalizedLoginId });
    if (!user) {
      return res.status(401).json({ message: "Invalid Login ID or Password" });
    }

    const passwordMatch = await bcrypt.compare(String(password), user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid Login ID or Password" });
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
      const emailConfigured = isEmailConfigured();

      await PasswordResetOtp.updateMany(
        { email: normalizedEmail, used: false },
        { $set: { used: true } }
      );

      await PasswordResetOtp.create({
        email: normalizedEmail,
        otpHash,
        expiresAt
      });

      if (emailConfigured) {
        await sendResetOtpEmail({
          to: normalizedEmail,
          otp,
          name: user.name
        });
      } else {
        console.warn(`SMTP not configured. Password reset OTP for ${normalizedEmail}: ${otp}`);
      }

      return res.json({
        message: "OTP sent successfully",
        otpSent: true,
        delivery: emailConfigured ? "email" : "development-console",
        ...(process.env.NODE_ENV !== "production" ? { devOtp: otp } : {})
      });
    }

    return res.json({ message: "If that email exists, an OTP was sent.", otpSent: true });
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

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        message:
          "Password must be at least 9 characters and include uppercase, lowercase, and special character"
      });
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
