const express = require("express");
const router = express.Router();
const {
  getUserProfile,
  getAllUsers,
  getById,
  updateUser,
  deleteUser,
} = require("../Controllers/UserController");
const authMiddleware = require("../Middleware/authMiddleware");
const { requireRole, requireSelfOrRole } = require("../Middleware/roleMiddleware");

// Protected Route to get logged-in user's profile
router.get("/profile", authMiddleware, getUserProfile);

// Get all users (platform admin only)
router.get("/", authMiddleware, requireRole("user_admin"), getAllUsers);

// Get user by ID
router.get("/:id", authMiddleware, requireSelfOrRole("id", "user_admin"), getById);

// Update user by ID (self or platform admin)
router.put("/:id", authMiddleware, requireSelfOrRole("id", "user_admin"), updateUser);

// Delete currently logged-in user (uses token for ID)
router.delete("/delete", authMiddleware, deleteUser);

module.exports = router;
