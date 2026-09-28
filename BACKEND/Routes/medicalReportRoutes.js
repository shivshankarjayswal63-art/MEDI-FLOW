const express = require("express");
const router = express.Router();
const auth = require("../Middleware/authMiddleware");
const { requireRole } = require("../Middleware/roleMiddleware");
const { parseReportUpload } = require("../lib/parseMultipartFile");
const {
  uploadReport,
  uploadReportBase64,
  getUserReports,
  deleteReport,
  downloadReport,
} = require("../Controllers/medicalReportController");

router.post("/upload-base64", auth, requireRole("patient"), uploadReportBase64);
router.post("/upload", auth, requireRole("patient"), parseReportUpload, uploadReport);
router.get("/", auth, requireRole("patient"), getUserReports);
router.get("/:id/download", auth, requireRole("patient"), downloadReport);
router.delete("/:id", auth, requireRole("patient"), deleteReport);

module.exports = router;
