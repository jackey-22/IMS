import { Router } from "express";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

// GET /api/notifications?unreadOnly=true&limit=20
router.get("/", async (req, res) => {
  try {
    const { unreadOnly, limit } = req.query;
    const criteria = { userId: req.user._id };

    if (String(unreadOnly).toLowerCase() === "true") {
      criteria.readAt = null;
    }

    const items = await Notification.find(criteria)
      .sort({ createdAt: -1 })
      .limit(Number(limit) > 0 ? Number(limit) : 50)
      .lean();

    return res.json(items);
  } catch (error) {
    console.error("List notifications failed", error);
    return res.status(500).json({ message: "Failed to load notifications" });
  }
});

// PATCH /api/notifications/:id/read
router.patch("/:id/read", async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    return res.json(notification);
  } catch (error) {
    console.error("Mark notification read failed", error);
    return res.status(500).json({ message: "Failed to update notification" });
  }
});

// PATCH /api/notifications/read-all
router.patch("/read-all", async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { userId: req.user._id, readAt: null },
      { readAt: new Date() }
    );

    return res.json({ updated: result.modifiedCount || 0 });
  } catch (error) {
    console.error("Mark all notifications read failed", error);
    return res.status(500).json({ message: "Failed to update notifications" });
  }
});

// POST /api/notifications (admin only) - simple manual push
router.post("/", requireRole("admin"), async (req, res) => {
  try {
    const { title, message, type, link, userIds, roles } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: "Title and message are required" });
    }

    let recipients = [];

    if (Array.isArray(userIds) && userIds.length > 0) {
      recipients = await User.find({ _id: { $in: userIds } }).select("_id");
    } else if (Array.isArray(roles) && roles.length > 0) {
      recipients = await User.find({ role: { $in: roles } }).select("_id");
    }

    if (recipients.length === 0) {
      return res.status(400).json({ message: "No recipients found" });
    }

    const payload = recipients.map((user) => ({
      userId: user._id,
      title: String(title).trim(),
      message: String(message).trim(),
      type: type || "info",
      link: link || ""
    }));

    const created = await Notification.insertMany(payload, { ordered: false });
    return res.status(201).json(created);
  } catch (error) {
    console.error("Create notification failed", error);
    return res.status(500).json({ message: "Failed to create notification" });
  }
});

export default router;
