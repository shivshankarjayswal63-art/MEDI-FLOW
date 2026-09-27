const express = require("express");
const router = express.Router();
const authMiddleware = require("../Middleware/authMiddleware");
const {
  getMyNotifications,
  markRead,
} = require("../Controllers/NotificationController");

router.get("/", authMiddleware, getMyNotifications);
router.patch("/:id/read", authMiddleware, markRead);

module.exports = router;
