const { spawn } = require("child_process");
const path = require("path");

const AI_API_URL = process.env.AI_API_URL || "http://localhost:8000";

exports.analyzeSymptoms = async (req, res) => {
  const { symptoms } = req.body;

  try {
    const response = await fetch(`${AI_API_URL}/api/novelty/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symptoms }),
    });
    if (response.ok) {
      const data = await response.json();
      return res.json(data);
    }
  } catch (err) {
    console.warn("AI API unavailable, falling back to local Python:", err.message);
  }

  const pythonCmd = process.env.PYTHON_PATH || "python";
  const scriptPath = path.join(__dirname, "..", "ai-model", "model.py");
  const python = spawn(pythonCmd, [scriptPath, JSON.stringify(symptoms)]);

  let result = "";
  python.stdout.on("data", (data) => {
    result += data.toString();
  });

  python.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
  });

  python.on("error", (err) => {
    console.error("Python spawn failed:", err.message);
    if (!res.headersSent) {
      res.status(503).json({
        error:
          "AI service unavailable. Start FastAPI (AI_API_URL) or set PYTHON_PATH to a valid python.exe.",
      });
    }
  });

  python.on("close", (code) => {
    if (res.headersSent) return;
    if (code !== 0 && !result.trim()) {
      return res.status(503).json({ error: "Local AI model failed to run." });
    }
    return res.json({ prediction: result.trim() });
  });
};
