const Doctor = require("../../Models/DoctorManagement/doctorModel");
const {
  APPROVED,
  PENDING,
  REJECTED,
  getApprovalStatus,
} = require("../../lib/doctorApproval");
const { invalidateDoctorsCache } = require("../../lib/appointmentAssistant");

function stripDoctorPassword(doc) {
  const d = doc?.toObject ? doc.toObject() : { ...doc };
  delete d.password;
  return d;
}

function mapDoctorForAdmin(doc) {
  const d = stripDoctorPassword(doc);
  return {
    ...d,
    id: d._id || d.id,
    approvalStatus: getApprovalStatus(d),
    rejectionReason: d.rejectionReason || d.rejection_reason || null,
  };
}

exports.listDoctorsForAdmin = async (req, res) => {
  try {
    const status = req.query.status;
    let doctors = await Doctor.find();
    if (status) {
      const want = String(status).toLowerCase();
      doctors = (doctors || []).filter((d) => getApprovalStatus(d) === want);
    }
    res.json((doctors || []).map(mapDoctorForAdmin));
  } catch (err) {
    console.error("listDoctorsForAdmin:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.listPendingDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ approvalStatus: PENDING });
    res.json((doctors || []).map(mapDoctorForAdmin));
  } catch (err) {
    console.error("listPendingDoctors:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.setDoctorApproval = async (req, res) => {
  const id = req.params.id;
  const { status, rejectionReason } = req.body || {};

  const next = String(status || "").toLowerCase();
  if (![APPROVED, REJECTED, PENDING].includes(next)) {
    return res.status(400).json({
      message: "status must be approved, rejected, or pending",
    });
  }

  try {
    const existing = await Doctor.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const update = {
      approvalStatus: next,
      rejectionReason: next === REJECTED ? rejectionReason || "Not approved by platform admin." : null,
      approvedAt: next === APPROVED ? new Date() : null,
      approvedBy: next === APPROVED ? req.user?.id : null,
    };

    const updated = await Doctor.findByIdAndUpdate(id, update, { new: true });
    invalidateDoctorsCache();

    res.json({
      message:
        next === APPROVED
          ? "Doctor approved and visible to patients."
          : next === REJECTED
            ? "Doctor registration rejected."
            : "Doctor moved back to pending review.",
      doctor: mapDoctorForAdmin(updated),
    });
  } catch (err) {
    console.error("setDoctorApproval:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
};
