const APPROVED = "approved";
const PENDING = "pending";
const REJECTED = "rejected";

function getApprovalStatus(doc) {
  const raw = doc?.approvalStatus ?? doc?.approval_status;
  if (!raw) return APPROVED;
  return String(raw).toLowerCase();
}

function isDoctorVisibleToPatients(doc) {
  return getApprovalStatus(doc) === APPROVED;
}

function filterApprovedDoctors(doctors) {
  const list = Array.isArray(doctors) ? doctors : [];
  return list.filter(isDoctorVisibleToPatients);
}

async function assertDoctorBookable(Doctor, doctorId) {
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    return { ok: false, status: 404, message: "Doctor not found" };
  }
  if (!isDoctorVisibleToPatients(doctor)) {
    return {
      ok: false,
      status: 400,
      message: "This doctor is not verified yet and cannot receive appointments.",
    };
  }
  return { ok: true, doctor };
}

module.exports = {
  APPROVED,
  PENDING,
  REJECTED,
  getApprovalStatus,
  isDoctorVisibleToPatients,
  filterApprovedDoctors,
  assertDoctorBookable,
};
