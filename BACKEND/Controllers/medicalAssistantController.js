const { processMedicalChat } = require("../lib/medicalAssistant");
const { getPatientHealthContext } = require("../lib/patientHealthContext");
const User = require("../Models/UserModel");
const Appointment = require("../Models/AppoinmentModel");

exports.chat = async (req, res) => {
  try {
    const { message, history } = req.body || {};
    if (!message || !String(message).trim()) {
      return res.status(400).json({ error: "message is required" });
    }

    const userId = req.user?.id || null;
    const patientContext = userId ? await getPatientHealthContext(userId) : null;

    const result = await processMedicalChat(String(message).trim(), history, {
      userId,
      patientContext,
    });
    return res.json(result);
  } catch (err) {
    console.error("medical-assistant chat:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.book = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Sign in as a patient to book appointments." });
    }

    const { doctorId, date, time, doctorName, specialization } = req.body || {};
    if (!doctorId || !date || !time) {
      return res.status(400).json({ message: "doctorId, date, and time are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const appointmentCount = await Appointment.countDocuments();
    const indexno = `APP${String(appointmentCount + 1).padStart(4, "0")}`;

    const newAppointment = new Appointment({
      indexno,
      name: user.name,
      address: user.city || user.country || "Colombo",
      nic: user.nic || "",
      phone: user.mobile || "0000000000",
      email: user.email,
      doctorName: doctorName || "Doctor",
      doctor_id: doctorId,
      specialization: specialization || "General Practice",
      date: new Date(`${date}T12:00:00`),
      time: String(time).slice(0, 5),
      user_id: userId,
      status: "Pending",
    });

    await newAppointment.save();

    return res.status(201).json({
      message: "Appointment booked successfully",
      appointment: newAppointment,
      reply: `Your appointment with **${doctorName || "the doctor"}** is booked for **${date}** at **${time}** (status: Pending).`,
    });
  } catch (err) {
    console.error("medical-assistant book:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
