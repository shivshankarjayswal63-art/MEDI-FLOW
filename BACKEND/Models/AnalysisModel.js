const mongoose = require("mongoose");

const analysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  symptoms: [String],
  prediction: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const { lazyModel } = require("../lib/supabaseModel");

module.exports = lazyModel("analyses", () =>
  mongoose.models.Analysis || mongoose.model("Analysis", analysisSchema)
);