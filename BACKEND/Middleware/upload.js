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
  const name = String(file.originalname || "").toLowerCase();
  // allow explicit PDF mime
  if (file.mimetype === "application/pdf") return cb(null, true);
  // accept any image/* mime
  if (typeof file.mimetype === "string" && file.mimetype.startsWith("image/")) return cb(null, true);

  // fallback to extension check for unknown/opaque mimetypes
  const okExt = /\.(pdf|jpe?g|jpeg|png|gif|webp|tiff|tif|bmp)$/i.test(name);
  const octetPdf = file.mimetype === "application/octet-stream" && okExt;
  if (okExt || octetPdf) return cb(null, true);

  cb(new Error("Invalid file type. Use PDF or common image formats (jpeg, png, gif, webp, tiff, bmp)."));
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter,
});

module.exports = upload;
