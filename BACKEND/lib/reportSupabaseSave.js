const { getSupabase } = require("../config/supabase");
const { fromDb } = require("./supabaseModel");

function stripUndefined(row) {
  const out = {};
  for (const [k, v] of Object.entries(row)) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}

/**
 * Insert medical_reports row with fallbacks when optional columns are missing.
 */
async function saveReportViaSupabase(fields) {
  const supabase = getSupabase();
  const {
    userId,
    fileName,
    filePath,
    fileType,
    reportSummary,
    aiTags,
    patientNotes,
    fileContentBase64,
    fileBuffer,
  } = fields;

  // choose bucket from env or default
  const bucket = process.env.SUPABASE_REPORTS_BUCKET || "medical-reports";

  const attempts = [
    stripUndefined({
      user_id: userId,
      file_name: fileName,
      file_path: filePath,
      file_type: fileType,
      report_summary: reportSummary,
      ai_tags: aiTags?.length ? aiTags : undefined,
      patient_notes: patientNotes || undefined,
      file_content_base64: fileContentBase64 || undefined,
    }),
    stripUndefined({
      user_id: userId,
      file_name: fileName,
      file_path: filePath,
      file_type: fileType,
      report_summary: reportSummary,
      ai_tags: aiTags?.length ? aiTags : undefined,
      patient_notes: patientNotes || undefined,
    }),
    stripUndefined({
      user_id: userId,
      file_name: fileName,
      file_path: filePath,
      file_type: fileType,
      report_summary: reportSummary,
    }),
    {
      user_id: userId,
      file_name: fileName,
      file_path: filePath,
      file_type: fileType,
    },
  ];

  let lastError;
  for (const row of attempts) {
    // If we have a file buffer, try uploading to Supabase storage first.
    try {
      if (fileBuffer && fileBuffer.length) {
        const ts = Date.now();
        const safeName = String(fileName || "file").replace(/\s+/g, "_");
        const objectPath = `reports/${userId}/${ts}-${safeName}`;
        try {
          const up = await supabase.storage.from(bucket).upload(objectPath, fileBuffer, {
            contentType: fileType || "application/octet-stream",
            upsert: false,
          });
          if (up.error) {
            console.warn("supabase storage upload error:", up.error.message, up.error);
            // Surface the storage error to caller via thrown error so frontend can see it
            throw new Error(up.error.message || "Supabase storage upload failed");
          } else {
            // Save logical storage path in file_path so download logic can detect it
            row.file_path = `storage://${bucket}/${objectPath}`;
          }
        } catch (e) {
          console.error("supabase storage upload threw:", e?.message || e);
          // rethrow to let outer handler decide — this will be logged by controller
          throw e;
        }
      }
    } catch (e) {
      console.warn("report upload pre-insert hook failed:", e?.message || e);
    }

    const { data, error } = await supabase.from("medical_reports").insert(row).select().single();
    if (!error && data) {
      return fromDb(data);
    }
    lastError = error;
    console.warn("saveReportViaSupabase attempt:", error?.message);
  }

  throw new Error(lastError?.message || "Could not save report to database");
}

async function fetchReportFileBase64(reportId) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("medical_reports")
    .select("file_content_base64")
    .eq("id", reportId)
    .maybeSingle();
  if (error || !data?.file_content_base64) return null;
  return data.file_content_base64;
}

module.exports = { saveReportViaSupabase, fetchReportFileBase64 };
