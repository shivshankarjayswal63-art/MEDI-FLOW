const express = require("express");
const router = express.Router();
const {
  getDoctorProfile,
  getAllDoctors,
  getPublicDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
} = require("../../Controllers/DoctorManagement/doctorController");
const authMiddleware = require("../../Middleware/authMiddleware");
const optionalAuthMiddleware = require("../../Middleware/optionalAuthMiddleware");
const { requireRole } = require("../../Middleware/roleMiddleware");

router.get("/profile", authMiddleware, requireRole("doctor"), getDoctorProfile);
router.get("/public", getPublicDoctors);
router.get("/", authMiddleware, requireRole("user_admin"), getAllDoctors);
router.get("/:id", optionalAuthMiddleware, getDoctorById);
router.put("/:id", updateDoctor);
router.delete("/:id", deleteDoctor);


module.exports = router;
