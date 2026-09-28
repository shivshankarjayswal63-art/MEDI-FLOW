const formidable = require("formidable");
const fs = require("fs");

const MAX_BYTES = 10 * 1024 * 1024;

function fieldValue(fields, name) {
  const v = fields?.[name];
  if (Array.isArray(v)) return v[0];
  return v;
}

function isAllowedUpload(file) {
  const name = String(file.originalFilename || file.newFilename || "").toLowerCase();
  const mime = String(file.mimetype || "").toLowerCase();
  const okMime = ["application/pdf", "image/jpeg", "image/png", "image/jpg"].includes(mime);
  const okExt = /\.(pdf|jpe?g|png)$/i.test(name);
  const octet = mime === "application/octet-stream" && okExt;
  return okMime || octet || okExt;
}

/** Express middleware: parses multipart field `report` into req.file (buffer) + req.body notes. */
function parseReportUpload(req, res, next) {
  (async () => {
    const form = formidable({
      maxFileSize: MAX_BYTES,
      maxFiles: 1,
      allowEmptyFiles: false,
    });

    const [fields, files] = await form.parse(req);
    const raw = files.report;
    const file = Array.isArray(raw) ? raw[0] : raw;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded. Use field name 'report'." });
    }

    if (!isAllowedUpload(file)) {
      return res.status(400).json({ message: "Invalid file type. Use PDF, JPEG, or PNG." });
    }

    let buffer;
    if (typeof file.toBuffer === "function") {
      buffer = await file.toBuffer();
    } else if (file.filepath && fs.existsSync(file.filepath)) {
      buffer = fs.readFileSync(file.filepath);
      try {
        fs.unlinkSync(file.filepath);
      } catch {
        /* ignore */
      }
    } else {
      return res.status(400).json({ message: "Could not read uploaded file." });
    }

    const originalname = file.originalFilename || "report.pdf";
    req.file = {
      originalname,
      mimetype: file.mimetype || "application/pdf",
      buffer,
      size: buffer.length,
    };

    const notes = fieldValue(fields, "patientNotes") || fieldValue(fields, "notes") || "";
    req.body = { ...(req.body || {}), patientNotes: notes, notes };
    next();
  })().catch((err) => {
    const message =
      err?.code === 1009 || /maxFileSize|too large/i.test(String(err?.message || ""))
        ? "File too large (max 10MB)."
        : err.message || "Upload parse error";
    if (!res.headersSent) {
      res.status(400).json({ message });
    }
  });
}

module.exports = { parseReportUpload };
