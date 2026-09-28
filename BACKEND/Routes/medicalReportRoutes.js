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

function uploadSingle(req, res, next) {
  upload.single("report")(req, res, (err) => {
    if (err) {
      const message =
        err.code === "LIMIT_FILE_SIZE"
          ? "File too large (max 10MB)."
          : err.message || "Upload error";
      return res.status(400).json({ message });
    }
    next();
  });
}

router.post("/upload", auth, requireRole("patient"), uploadSingle, uploadReport);
router.get("/", auth, requireRole("patient"), getUserReports);
router.get("/:id/download", auth, requireRole("patient"), downloadReport);
router.delete("/:id", auth, requireRole("patient"), deleteReport);

module.exports = router;
