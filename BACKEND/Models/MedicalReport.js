const mongoose = require("mongoose");

const medicalReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  fileType: { type: String },
  uploadedAt: { type: Date, default: Date.now },
});

const { lazyModel } = require("../lib/supabaseModel");

module.exports = lazyModel("medical_reports", () =>
  mongoose.models.MedicalReport ||
  mongoose.model("MedicalReport", medicalReportSchema)
);
