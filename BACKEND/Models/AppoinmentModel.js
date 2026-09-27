const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  indexno: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  nic: {
    type: String,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  doctorName: {
    type: String,
    required: true,
  },
  doctor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  specialization: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Accepted", "Completed", "Reviewed"],
    default: "Pending",
  },
});

const { lazyModel } = require("../lib/supabaseModel");

module.exports = lazyModel("appointments", () =>
  mongoose.models.Appointment ||
  mongoose.model("Appointment", appointmentSchema)
);