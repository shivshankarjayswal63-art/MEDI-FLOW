const { processMedicalChat } = require("../lib/medicalAssistant");
const { getPatientHealthContext } = require("../lib/patientHealthContext");
const { loadChatSession, appendChatMessages, clearChatSession } = require("../lib/medicalAssistantChatStore");
const User = require("../Models/UserModel");
const Appointment = require("../Models/AppoinmentModel");

exports.session = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.json({ messages: [], bookingState: null });
    }
    const session = await loadChatSession(userId);
    return res.json(session);
  } catch (err) {
    console.error("medical-assistant session:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.clearSession = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Sign in required" });
    await clearChatSession(userId);
    return res.json({ ok: true });
  } catch (err) {
    console.error("medical-assistant clear:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.chat = async (req, res) => {
  try {
    const { message, history, bookingState, selection, forceBooking } = req.body || {};
    if (!message || !String(message).trim()) {
      return res.status(400).json({ error: "message is required" });
    }

    const userId = req.user?.id || null;
    const patientContext = userId ? await getPatientHealthContext(userId) : null;

    let effectiveHistory = Array.isArray(history) ? history : [];
    let effectiveBookingState = bookingState || null;

    if (userId && effectiveHistory.length === 0) {
      const session = await loadChatSession(userId);
      if (session.messages?.length) {
        effectiveHistory = session.messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));
      }
      if (!effectiveBookingState && session.bookingState) {
        effectiveBookingState = session.bookingState;
      }
    }

    const result = await processMedicalChat(String(message).trim(), effectiveHistory, {
      userId,
      patientContext,
      bookingState: effectiveBookingState,
      selection: selection || null,
      forceBooking: Boolean(forceBooking),
    });

    if (userId) {
      await appendChatMessages(userId, String(message).trim(), result);
    }

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

    const { doctorId, date, time, doctorName, specialization, visitMode } = req.body || {};
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

    const visitLabel =
      visitMode === "video_call" ? "Video call" : visitMode === "in_person" ? "In-person" : "In-person";

    return res.status(201).json({
      message: "Appointment booked successfully",
      appointment: newAppointment,
      reply: `✅ **MEDI FLOW booking confirmed**\n\n**${user.name}** with **${doctorName || "the doctor"}** on **${date}** at **${time}** (${visitLabel}). Status: **Pending** — check **My appointments** in the menu.`,
      bookingState: null,
    });
  } catch (err) {
    console.error("medical-assistant book:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
