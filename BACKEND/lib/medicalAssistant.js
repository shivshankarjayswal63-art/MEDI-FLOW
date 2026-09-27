const { analyzeSymptoms, normalizeSymptom, CONDITION_PROFILES } = require("./symptomAnalyzer");

const NVIDIA_BASE = "https://integrate.api.nvidia.com/v1/chat/completions";
const DEFAULT_MODEL = "nvidia/nemotron-3-ultra-550b-a55b";

function nemotronTimeoutMs() {
  const fromEnv = Number(process.env.MEDICAL_ASSISTANT_LLM_TIMEOUT_MS);
  if (fromEnv > 0) return fromEnv;
  // Vercel serverless often limits ~10s — fail fast and use rules fallback
  return process.env.VERCEL ? 7500 : 55000;
}

const SYNONYM_REPLACEMENTS = [
  { canonical: "shortness of breath", patterns: ["sob", "can't breathe", "cannot breathe", "hard to breathe", "breathless"] },
  { canonical: "stomach pain", patterns: ["tummy ache", "belly pain", "abdominal pain", "stomach ache"] },
  { canonical: "chest pain", patterns: ["chest hurts", "chest discomfort", "tight chest"] },
  { canonical: "left arm pain", patterns: ["arm pain", "left arm hurts", "pain in left arm"] },
  { canonical: "heartburn", patterns: ["acid reflux", "burning chest after eating"] },
  { canonical: "coughing", patterns: ["cough", "dry cough", "wet cough"] },
  { canonical: "coughing blood", patterns: ["blood in cough", "bloody cough", "hemoptysis"] },
  { canonical: "headache", patterns: ["head pain", "migraine headache"] },
  { canonical: "blurred vision", patterns: ["blurry vision", "vision problems", "double vision"] },
  { canonical: "racing heart", patterns: ["fast heartbeat", "palpitations", "heart pounding"] },
  { canonical: "loss of appetite", patterns: ["not hungry", "no appetite"] },
  { canonical: "sudden shortness of breath", patterns: ["suddenly breathless", "sudden breathlessness"] },
];

const CONDITION_INFO = {
  cardiac_emergency: {
    title: "Possible cardiac event",
    blurb:
      "Chest pain with shortness of breath, arm or jaw pain, sweating, or fainting can signal a heart attack. Call emergency services immediately if symptoms are severe or sudden.",
    symptoms: "chest pain, shortness of breath, left arm or jaw pain, sweating, dizziness",
  },
  pulmonary_embolism: {
    title: "Pulmonary embolism (blood clot in lungs)",
    blurb:
      "Sudden shortness of breath, chest pain, and coughing (sometimes with blood) need urgent evaluation. This is a medical emergency when severe.",
    symptoms: "sudden breathlessness, chest pain, cough, coughing blood",
  },
  pneumonia: {
    title: "Pneumonia",
    blurb:
      "Lung infection causing cough, fever, fatigue, and sometimes chest pain or breathlessness. Treatment depends on cause; see a doctor if symptoms persist or worsen.",
    symptoms: "cough, fever, chest pain, shortness of breath, fatigue",
  },
  asthma: {
    title: "Asthma",
    blurb:
      "Airway inflammation causing wheezing, cough, and shortness of breath. Triggers vary; use your action plan or seek care if breathing is difficult.",
    symptoms: "wheezing, shortness of breath, cough, chest tightness",
  },
  gerd_gastritis: {
    title: "GERD / gastritis",
    blurb:
      "Stomach lining or acid reflux issues often cause heartburn, nausea, bloating, or upper abdominal pain, especially after meals.",
    symptoms: "heartburn, nausea, stomach pain, bloating, regurgitation",
  },
  peptic_ulcer: {
    title: "Peptic ulcer",
    blurb:
      "Sores in the stomach or duodenum can cause burning stomach pain, nausea, and loss of appetite. Medical evaluation is recommended.",
    symptoms: "stomach pain, nausea, heartburn, loss of appetite",
  },
  migraine: {
    title: "Migraine",
    blurb:
      "Recurrent headaches often with nausea, light sensitivity, or visual changes. Rest, hydration, and medical advice help management.",
    symptoms: "headache, nausea, blurred vision, dizziness",
  },
  stroke_screening: {
    title: "Stroke warning signs",
    blurb:
      "Sudden confusion, weakness, speech trouble, severe headache, or vision loss may indicate stroke — call emergency services (think FAST: Face, Arms, Speech, Time).",
    symptoms: "confusion, blurred vision, headache, dizziness, fainting",
  },
  anxiety_panic: {
    title: "Anxiety / panic attack",
    blurb:
      "Can mimic heart problems with chest tightness, racing heart, shortness of breath, and dizziness. Still seek care if unsure or if symptoms are new or severe.",
    symptoms: "chest pain, racing heart, shortness of breath, sweating, dizziness",
  },
  hypertension: {
    title: "High blood pressure (screening)",
    blurb:
      "Often silent; sometimes headache, dizziness, or chest discomfort. Regular checks and lifestyle or medication help when diagnosed.",
    symptoms: "headache, dizziness, chest pain, blurred vision",
  },
  common_cold: {
    title: "Common cold / URI",
    blurb:
      "Viral upper respiratory illness with cough, mild fever, congestion, and fatigue. Rest and fluids; see a doctor if high fever or breathing difficulty.",
    symptoms: "cough, headache, mild fever, congestion",
  },
};

function getAllCanonicalSymptoms() {
  const set = new Set();
  for (const p of CONDITION_PROFILES) {
    for (const s of p.symptoms) set.add(normalizeSymptom(s));
  }
  return [...set].sort((a, b) => b.length - a.length);
}

function normalizeUserText(text) {
  let t = normalizeSymptom(text);
  for (const { canonical, patterns } of SYNONYM_REPLACEMENTS) {
    for (const p of patterns) {
      const re = new RegExp(`\\b${p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
      t = t.replace(re, canonical);
    }
  }
  return t;
}

function extractSymptomsFromText(text) {
  const normalized = normalizeUserText(text);
  const found = [];
  const used = new Set();
  for (const symptom of getAllCanonicalSymptoms()) {
    if (normalized.includes(symptom) && !used.has(symptom)) {
      found.push(symptom);
      used.add(symptom);
    }
  }
  return found;
}

function findConditionInfoQuery(text) {
  const t = text.toLowerCase();
  const keywordMap = [
    { keys: ["heart attack", "cardiac", "heart problem"], id: "cardiac_emergency" },
    { keys: ["pulmonary embolism", "blood clot lung", "pe "], id: "pulmonary_embolism" },
    { keys: ["pneumonia"], id: "pneumonia" },
    { keys: ["asthma", "wheez"], id: "asthma" },
    { keys: ["gastritis", "gerd", "acid reflux", "heartburn disease"], id: "gerd_gastritis" },
    { keys: ["ulcer", "peptic"], id: "peptic_ulcer" },
    { keys: ["migraine"], id: "migraine" },
    { keys: ["stroke", "fast face"], id: "stroke_screening" },
    { keys: ["panic", "anxiety attack", "anxiety"], id: "anxiety_panic" },
    { keys: ["hypertension", "high blood pressure", "bp high"], id: "hypertension" },
    { keys: ["cold", "flu", "upper respiratory"], id: "common_cold" },
  ];
  for (const { keys, id } of keywordMap) {
    if (keys.some((k) => t.includes(k))) return CONDITION_INFO[id];
  }
  for (const profile of CONDITION_PROFILES) {
    const label = profile.label.toLowerCase();
    const short = label.split("(")[0].trim();
    if (t.includes(short) || t.includes(profile.id.replace(/_/g, " "))) {
      return CONDITION_INFO[profile.id];
    }
  }
  return null;
}

function isOffTopic(text) {
  const t = text.toLowerCase();
  const medicalHints = [
    "pain",
    "symptom",
    "fever",
    "cough",
    "doctor",
    "medic",
    "health",
    "disease",
    "sick",
    "nausea",
    "headache",
    "breath",
    "heart",
    "stomach",
    "what is",
    "how to treat",
    "when to",
  ];
  if (medicalHints.some((h) => t.includes(h))) return false;
  const offTopic = ["weather", "football", "movie", "bitcoin", "homework", "write code"];
  return offTopic.some((o) => t.includes(o));
}

function buildRulesReply(message, analysis, info) {
  const parts = [];
  if (analysis && analysis.matchedCount > 0) {
    parts.push(analysis.prediction);
    if (analysis.urgent) {
      parts.push(
        "⚠️ Urgent screening flag: if symptoms are severe, sudden, or worsening, call emergency services or go to the nearest emergency department."
      );
    }
    if (analysis.rankings?.length > 1) {
      const alts = analysis.rankings
        .slice(1, 3)
        .map((r) => `${r.condition} (${r.score}%)`)
        .join("; ");
      parts.push(`Other patterns to consider: ${alts}.`);
    }
  }
  if (info) {
    parts.push(`${info.title}: ${info.blurb}`);
    parts.push(`Common symptoms include: ${info.symptoms}.`);
  }
  if (parts.length === 0) {
    parts.push(
      "I can help with symptom screening and general information about common conditions. Describe what you feel (e.g. chest pain and shortness of breath), or ask what a condition is (e.g. what is asthma?)."
    );
    parts.push(
      "For a structured check, use Symptom AI in the menu. This is educational only—not a diagnosis."
    );
  } else {
    parts.push("This is educational screening only—not a diagnosis. See a clinician for personal medical advice.");
  }
  return parts.join("\n\n");
}

function buildSystemPrompt(context) {
  return `You are MEDI FLOW Medical Assistant, a helpful but cautious health educator.
Rules:
- You do NOT diagnose, prescribe, or replace a doctor.
- Answer questions about diseases, symptoms, and when to seek care in clear, simple English.
- If urgent screening context is provided, emphasize emergency care when appropriate.
- Keep replies under about 200 words unless the user asks for detail.
- End with a brief reminder to consult a healthcare professional for personal advice.

Structured screening context (may be empty):
${JSON.stringify(context)}`;
}

async function callNemotron(userMessage, history, context) {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) return null;

  const model = process.env.NVIDIA_NEMOTRON_MODEL || DEFAULT_MODEL;
  const trimmedHistory = (history || [])
    .filter((m) => m && m.role && m.content)
    .slice(-8)
    .map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: String(m.content).slice(0, 4000) }));

  const messages = [
    { role: "system", content: buildSystemPrompt(context) },
    ...trimmedHistory,
    { role: "user", content: userMessage },
  ];

  const controller = new AbortController();
  const timeoutMs = nemotronTimeoutMs();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(NVIDIA_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.55,
        top_p: 0.9,
        max_tokens: 1536,
        stream: false,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.warn("Nemotron API error:", res.status, errText.slice(0, 200));
      return null;
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    return content ? String(content).trim() : null;
  } catch (err) {
    clearTimeout(timeout);
    console.warn("Nemotron request failed:", err.message);
    return null;
  }
}

async function processMedicalChat(message, history) {
  if (isOffTopic(message)) {
    return {
      reply:
        "I'm focused on health, symptoms, and disease information. Ask me about how you're feeling or about a medical topic, and I'll do my best to help with educational guidance.",
      urgent: false,
      primaryCondition: null,
      confidence: 0,
      source: "rules",
    };
  }

  const extracted = extractSymptomsFromText(message);
  const analysis = extracted.length > 0 ? analyzeSymptoms(extracted) : null;
  const info = findConditionInfoQuery(message);

  const context = {
    extractedSymptoms: extracted,
    analysis: analysis
      ? {
          primaryCondition: analysis.primaryCondition,
          confidence: analysis.confidence,
          urgent: analysis.urgent,
          severity: analysis.severity,
          rankings: analysis.rankings,
        }
      : null,
    conditionInfo: info ? { title: info.title, blurb: info.blurb } : null,
  };

  const rulesReply = buildRulesReply(message, analysis, info);
  let reply = await callNemotron(message, history, context);
  let source = "nemotron";

  if (!reply) {
    reply = rulesReply;
    source = "rules";
  } else if (analysis?.urgent && !reply.toLowerCase().includes("emergency")) {
    reply +=
      "\n\n⚠️ Screening suggests urgent symptoms — seek emergency care if severe or worsening.";
  }

  return {
    reply,
    response: reply,
    urgent: Boolean(analysis?.urgent),
    primaryCondition: analysis?.primaryCondition || info?.title || null,
    confidence: analysis?.confidence || 0,
    severity: analysis?.severity || "unknown",
    rankings: analysis?.rankings || [],
    source,
  };
}

module.exports = { processMedicalChat, extractSymptomsFromText };
