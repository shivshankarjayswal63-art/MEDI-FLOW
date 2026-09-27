const express = require("express");
const optionalAuth = require("../Middleware/optionalAuthMiddleware");
const authMiddleware = require("../Middleware/authMiddleware");
const { chat, book, session, clearSession } = require("../Controllers/medicalAssistantController");

const router = express.Router();

router.get("/session", optionalAuth, session);
router.delete("/session", authMiddleware, clearSession);
router.post("/chat", optionalAuth, chat);
router.post("/book", authMiddleware, book);

module.exports = router;
