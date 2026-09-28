const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const useMemory =
  Boolean(process.env.VERCEL) ||
  Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

const storage = useMemory
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (_req, _file, cb) => cb(null, uploadDir),
      filename: (_req, file, cb) =>
        cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`),
    });

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
  const name = String(file.originalname || "").toLowerCase();
  const okType = allowedTypes.includes(file.mimetype);
  const okExt = /\.(pdf|jpe?g|png)$/i.test(name);
  const octetPdf = file.mimetype === "application/octet-stream" && okExt;
  if (okType || octetPdf || (okExt && !file.mimetype)) {
    return cb(null, true);
  }
  cb(new Error("Invalid file type. Use PDF, JPEG, or PNG."));
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter,
});

module.exports = upload;
