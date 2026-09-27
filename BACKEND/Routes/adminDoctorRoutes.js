const express = require("express");
const router = express.Router();
const authMiddleware = require("../Middleware/authMiddleware");
const { requireRole } = require("../Middleware/roleMiddleware");
const {
  listDoctorsForAdmin,
  listPendingDoctors,
  setDoctorApproval,
} = require("../Controllers/DoctorManagement/adminDoctorController");

router.use(authMiddleware, requireRole("user_admin"));

router.get("/pending", listPendingDoctors);
router.get("/", listDoctorsForAdmin);
router.patch("/:id/approval", setDoctorApproval);

module.exports = router;
