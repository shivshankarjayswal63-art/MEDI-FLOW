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
  } = fields;

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
