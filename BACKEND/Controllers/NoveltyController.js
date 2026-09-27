const { spawn } = require("child_process");
const path = require("path");
const { analyzeSymptoms } = require("../lib/symptomAnalyzer");

const AI_API_URL = process.env.AI_API_URL || "http://localhost:8000";

function respondWithAnalysis(res, symptoms) {
  const result = analyzeSymptoms(symptoms);
  return res.json(result);
}

exports.analyzeSymptoms = async (req, res) => {
  const { symptoms } = req.body;

  if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
    return res.status(400).json({
      error: "Please provide a symptoms array with at least one symptom.",
    });
  }

  // Primary path: Node engine (production / Vercel)
  try {
    return respondWithAnalysis(res, symptoms);
  } catch (err) {
    console.error("symptomAnalyzer error:", err);
  }

  // Optional: external FastAPI service
  try {
    const response = await fetch(`${AI_API_URL}/api/novelty/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symptoms }),
    });
    if (response.ok) {
      const data = await response.json();
      if (data.prediction) return res.json(data);
    }
  } catch (err) {
    console.warn("AI API unavailable:", err.message);
  }

  // Local dev fallback: Python rules
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

  python.on("error", () => {
    if (!res.headersSent) respondWithAnalysis(res, symptoms);
  });

  python.on("close", (code) => {
    if (res.headersSent) return;
    if (code !== 0 || !result.trim()) {
      return respondWithAnalysis(res, symptoms);
    }
    const nodeResult = analyzeSymptoms(symptoms);
    return res.json({
      ...nodeResult,
      prediction: result.trim(),
    });
  });
};
