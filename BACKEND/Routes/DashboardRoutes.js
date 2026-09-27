const express = require("express");
const router = express.Router();
const authMiddleware = require("../Middleware/authMiddleware");
const { getSummary } = require("../Controllers/DashboardController");

router.get("/summary", authMiddleware, getSummary);

module.exports = router;
