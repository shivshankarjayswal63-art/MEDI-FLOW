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

const { lazyModel } = require("../lib/supabaseModel");

module.exports = lazyModel("vitals", () =>
  mongoose.models.Vitals || mongoose.model("Vitals", vitalsSchema)
);