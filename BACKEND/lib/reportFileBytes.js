const fs = require("fs");
const path = require("path");

function readReportBuffer(report) {
  const b64 = report.fileContentBase64 || report.file_content_base64;
  if (b64 && String(b64).length > 0) {
    try {
      return Buffer.from(String(b64), "base64");
    } catch {
      return null;
    }
  }

  const relPath = (report.filePath || report.file_path || "").replace(/\\/g, "/");
  if (!relPath || relPath.startsWith("memory://")) return null;

  const absPath = path.join(__dirname, "..", relPath.replace(/^\//, ""));
  if (fs.existsSync(absPath)) {
    try {
      return fs.readFileSync(absPath);
    } catch {
      return null;
    }
  }
  return null;
}

function bufferFromUploadFile(file) {
  if (file?.buffer && file.buffer.length) return file.buffer;
  if (Buffer.isBuffer(file)) return file;
  if (file?.path && fs.existsSync(file.path)) {
    try {
      return fs.readFileSync(file.path);
    } catch {
      return null;
    }
  }
  return null;
}

function shouldPersistBytesInDb() {
  return Boolean(process.env.VERCEL || process.env.SUPABASE_URL);
}

module.exports = {
  readReportBuffer,
  bufferFromUploadFile,
  shouldPersistBytesInDb,
};
