const mongoose = require("mongoose");

const vitalsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  bp: Number,           // Blood Pressure
  pulse: Number,        // Pulse Rate
  sugar: Number,        // Blood Sugar
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const { useSupabase, createModel } = require("../lib/supabaseModel");

module.exports = useSupabase()
  ? createModel("vitals")
  : mongoose.model("Vitals", vitalsSchema);