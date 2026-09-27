const express = require("express");
const router = express.Router();
const auth = require("../Middleware/authMiddleware");
const { requireRole } = require("../Middleware/roleMiddleware");
const upload = require("../Middleware/upload");
const {
  uploadReport,
  getUserReports,
  deleteReport,
  downloadReport,
} = require("../Controllers/medicalReportController");

router.post("/upload", auth, requireRole("patient"), upload.single("report"), uploadReport);
router.get("/", auth, requireRole("patient"), getUserReports);
router.get("/:id/download", auth, requireRole("patient"), downloadReport);
router.delete("/:id", auth, requireRole("patient"), deleteReport);

module.exports = router;
