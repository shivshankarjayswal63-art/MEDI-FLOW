const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const { useSupabase, createModel } = require("../lib/supabaseModel");

module.exports = useSupabase()
  ? createModel("notifications")
  : mongoose.model("Notification", notificationSchema);
