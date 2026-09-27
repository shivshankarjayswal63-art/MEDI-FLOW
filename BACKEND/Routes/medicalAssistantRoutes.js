const express = require("express");
const { chat } = require("../Controllers/medicalAssistantController");

const router = express.Router();

router.post("/chat", chat);

module.exports = router;
