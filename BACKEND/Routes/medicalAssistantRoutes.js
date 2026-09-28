const express = require("express");
const optionalAuth = require("../Middleware/optionalAuthMiddleware");
const authMiddleware = require("../Middleware/authMiddleware");
const { requireRole } = require("../Middleware/roleMiddleware");
const {
  chat,
  book,
  session,
  clearSession,
  healthSummary,
} = require("../Controllers/medicalAssistantController");

const router = express.Router();

router.get("/session", optionalAuth, session);
router.delete("/session", authMiddleware, requireRole("patient"), clearSession);
router.post("/chat", optionalAuth, chat);
router.get("/health-summary", authMiddleware, requireRole("patient"), healthSummary);
router.post("/book", authMiddleware, requireRole("patient"), book);

module.exports = router;
