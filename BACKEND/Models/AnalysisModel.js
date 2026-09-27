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

const { useSupabase, createModel } = require("../lib/supabaseModel");

module.exports = useSupabase()
  ? createModel("analyses")
  : mongoose.model("Analysis", analysisSchema);