const MedicalReport = require("../Models/MedicalReport");
const fs = require("fs");
const path = require("path");
const { buildDemoPdf } = require("../lib/demoPdf");

exports.uploadReport = async (req, res) => {
  try {
    const newReport = new MedicalReport({
      userId: req.user.id,
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileType: req.file.mimetype,
    });
    await newReport.save();
    res.status(201).json(newReport);
  } catch (err) {
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
};

exports.getUserReports = async (req, res) => {
  try {
    const reports = await MedicalReport.find({ userId: req.user.id });
    res.status(200).json(reports);
  } catch (err) {
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
    const relPath = (report.filePath || report.file_path || "").replace(/\\/g, "/");
    const absPath = relPath
      ? path.join(__dirname, "..", relPath.replace(/^\//, ""))
      : null;

    if (absPath && fs.existsSync(absPath)) {
      const buf = fs.readFileSync(absPath);
      if (buf.length > 100 && buf[0] === 0x25) {
        res.setHeader("Content-Type", report.fileType || "application/pdf");
        res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);
        return res.send(buf);
      }
    }

    const pdf = buildDemoPdf(fileName);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);
    return res.send(pdf);
  } catch (err) {
    res.status(500).json({ message: "Failed to download report", error: err.message });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    const report = await MedicalReport.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    fs.unlinkSync(path.resolve(report.filePath));
    await report.deleteOne();
    res.status(200).json({ message: "Report deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete report", error: err.message });
  }
};
