const express = require("express");
const router = express.Router();
const authMiddleware = require("../Middleware/authMiddleware");
const { globalSearch } = require("../Controllers/SearchController");

router.get("/", authMiddleware, globalSearch);

module.exports = router;
