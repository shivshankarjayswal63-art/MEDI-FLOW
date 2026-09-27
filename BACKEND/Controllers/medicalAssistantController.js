const { processMedicalChat } = require("../lib/medicalAssistant");

exports.chat = async (req, res) => {
  try {
    const { message, history } = req.body || {};
    if (!message || !String(message).trim()) {
      return res.status(400).json({ error: "message is required" });
    }

    const result = await processMedicalChat(String(message).trim(), history);
    return res.json(result);
  } catch (err) {
    console.error("medical-assistant chat:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
