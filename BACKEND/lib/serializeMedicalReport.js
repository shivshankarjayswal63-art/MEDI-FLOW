/** API-safe report row (no embedded file bytes). */
const { fromDb } = require("./supabaseModel");

function serializeMedicalReport(doc) {
  let raw =
    doc && typeof doc === "object"
      ? { ...(doc.toObject?.() || doc) }
      : {};

  if (raw.file_name && !raw.fileName) {
    raw = fromDb(raw) || raw;
  }

  delete raw._table;
  delete raw.fileContentBase64;
  delete raw.file_content_base64;
  if (!raw.id && raw._id) raw.id = raw._id;
  return raw;
}

module.exports = { serializeMedicalReport };
