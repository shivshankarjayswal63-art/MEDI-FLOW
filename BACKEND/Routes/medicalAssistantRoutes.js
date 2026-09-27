const express = require("express");
const optionalAuth = require("../Middleware/optionalAuthMiddleware");
const authMiddleware = require("../Middleware/authMiddleware");
const { chat, book } = require("../Controllers/medicalAssistantController");

const router = express.Router();

router.post("/chat", optionalAuth, chat);
router.post("/book", authMiddleware, book);

module.exports = router;
