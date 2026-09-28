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
// Debug endpoint to check Supabase storage connectivity (call this from your browser or curl)
router.get("/_debug_supabase", async (req, res) => {
  try {
    const { createClient } = require("@supabase/supabase-js");
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return res.status(400).json({ ok: false, message: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" });
    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const bucket = process.env.SUPABASE_REPORTS_BUCKET || "medical-reports";
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      if (error) return res.status(500).json({ ok: false, message: error.message || error });
      const exists = Array.isArray(buckets) && buckets.find((b) => b.name === bucket);
      return res.json({ ok: true, bucketExists: Boolean(exists), bucketName: bucket });
    } catch (e) {
      return res.status(500).json({ ok: false, message: e.message || e });
    }
  } catch (err) {
    return res.status(500).json({ ok: false, message: err.message || err });
  }
});
router.get("/", auth, requireRole("patient"), getUserReports);
router.get("/:id/download", auth, requireRole("patient"), downloadReport);
router.delete("/:id", auth, requireRole("patient"), deleteReport);

module.exports = router;
