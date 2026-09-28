const MedicalReport = require("../Models/MedicalReport");
const fs = require("fs");
const path = require("path");
const { buildDemoPdf } = require("../lib/demoPdf");
const { analyzeReport } = require("../lib/reportInsights");
const { summarizeReportWithAI } = require("../lib/reportLlmSummary");
const {
  readReportBuffer,
  bufferFromUploadFile,
  shouldPersistBytesInDb,
} = require("../lib/reportFileBytes");
const { serializeMedicalReport } = require("../lib/serializeMedicalReport");
const { useSupabase, getSupabase } = require("../config/supabase");
const { fromDb } = require("../lib/supabaseModel");

async function persistMedicalReport(fields) {
  const variants = [
    fields,
    { ...fields, fileContentBase64: undefined },
    {
      userId: fields.userId,
      fileName: fields.fileName,
      filePath: fields.filePath,
      fileType: fields.fileType,
      reportSummary: fields.reportSummary,
      aiTags: fields.aiTags,
      patientNotes: fields.patientNotes,
    },
    {
      userId: fields.userId,
      fileName: fields.fileName,
      filePath: fields.filePath,
      fileType: fields.fileType,
    },
  ];
  let lastErr;
  for (const payload of variants) {
    const doc = new MedicalReport(payload);
    try {
      await doc.save();
      return doc;
    } catch (err) {
      lastErr = err;
      console.warn("persistMedicalReport:", err.message);
    }
  }
  throw lastErr || new Error("Could not save report");
}

function sortReportsNewestFirst(rows) {
  return [...(rows || [])].sort(
    (a, b) =>
      new Date(b.uploadedAt || b.uploaded_at || 0) -
      new Date(a.uploadedAt || a.uploaded_at || 0)
  );
}

exports.uploadReport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded. Use field name 'report'." });
    }

    const patientNotes = req.body?.patientNotes || req.body?.notes || "";
    const diskPath = req.file.path || `memory://${req.file.originalname}`;
    const fileBuffer = bufferFromUploadFile(req.file);

    const insight = analyzeReport({
      fileName: req.file.originalname,
      filePath: req.file.path || diskPath,
      patientNotes,
      fileBuffer,
    });

    const ruleSummary = insight.reportSummary;
    let reportSummary = ruleSummary;
    try {
      reportSummary = await Promise.race([
        summarizeReportWithAI({
          fileName: req.file.originalname,
          patientNotes,
          extractedSnippet: insight.extractedSnippet,
          ruleSummary,
        }),
        new Promise((resolve) => setTimeout(() => resolve(ruleSummary), 6000)),
      ]);
    } catch {
      reportSummary = ruleSummary;
    }

    let fileContentBase64 = null;
    if (shouldPersistBytesInDb() && fileBuffer && fileBuffer.length > 0) {
      if (fileBuffer.length <= 8 * 1024 * 1024) {
        fileContentBase64 = fileBuffer.toString("base64");
      }
    }

    const newReport = await persistMedicalReport({
      userId: req.user.id,
      fileName: req.file.originalname,
      filePath: diskPath,
      fileType: req.file.mimetype || "application/pdf",
      reportSummary,
      aiTags: insight.aiTags || [],
      patientNotes: patientNotes || null,
      fileContentBase64,
    });

    res.status(201).json({
      ...serializeMedicalReport(newReport),
      specialties: insight.specialties,
      reportSummary,
      assistantSummary: reportSummary,
    });
  } catch (err) {
    console.error("uploadReport:", err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
};

exports.getUserReports = async (req, res) => {
  try {
    const userId = req.user.id;

    if (useSupabase()) {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("medical_reports")
        .select(
          "id, user_id, file_name, file_path, file_type, uploaded_at, report_summary, ai_tags, patient_notes"
        )
        .eq("user_id", userId)
        .order("uploaded_at", { ascending: false });

      if (error) {
        console.warn("getUserReports primary select:", error.message);
        const fallback = await supabase
          .from("medical_reports")
          .select("id, user_id, file_name, file_path, file_type, uploaded_at")
          .eq("user_id", userId)
          .order("uploaded_at", { ascending: false });
        if (fallback.error) {
          console.error("getUserReports:", fallback.error.message);
          return res.status(500).json({ message: "Failed to fetch reports", error: fallback.error.message });
        }
        const reports = (fallback.data || []).map((row) => serializeMedicalReport(fromDb(row)));
        return res.status(200).json(reports);
      }

      const reports = (data || []).map((row) => serializeMedicalReport(fromDb(row)));
      return res.status(200).json(reports);
    }

    const reports = await MedicalReport.find({ userId });
    const sorted = sortReportsNewestFirst(reports).map((r) => serializeMedicalReport(r));
    res.status(200).json(sorted);
  } catch (err) {
    console.error("getUserReports:", err);
    res.status(500).json({ message: "Failed to fetch reports", error: err.message });
  }
};

exports.downloadReport = async (req, res) => {
  try {
    const report = await MedicalReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    const ownerId = report.userId || report.user_id;
    if (String(ownerId) !== String(req.user.id)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const fileName = report.fileName || report.file_name || "report.pdf";
    const mime = report.fileType || report.file_type || "application/pdf";

    const buf = readReportBuffer(report);
    if (buf && buf.length > 0) {
      const isPdf = mime === "application/pdf" || fileName.toLowerCase().endsWith(".pdf");
      const sendType = isPdf ? "application/pdf" : mime;
      res.setHeader("Content-Type", sendType);
      res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);
      return res.send(buf);
    }

    const pdf = buildDemoPdf(fileName);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);
    return res.send(pdf);
  } catch (err) {
    console.error("downloadReport:", err);
    res.status(500).json({ message: "Failed to download report", error: err.message });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    const report = await MedicalReport.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    const ownerId = report.userId || report.user_id;
    if (String(ownerId) !== String(req.user.id)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const relPath = report.filePath || report.file_path;
    if (relPath && !String(relPath).startsWith("memory://")) {
      const rel = String(relPath).replace(/^\/+/, "");
      const abs = path.resolve(path.join(__dirname, "..", rel));
      if (fs.existsSync(abs)) {
        try {
          fs.unlinkSync(abs);
        } catch {
          /* ignore */
        }
      }
    }

    if (typeof report.deleteOne === "function") {
      await report.deleteOne();
    } else {
      await MedicalReport.findByIdAndDelete(req.params.id);
    }
    res.status(200).json({ message: "Report deleted" });
  } catch (err) {
    console.error("deleteReport:", err);
    res.status(500).json({ message: "Failed to delete report", error: err.message });
  }
};
