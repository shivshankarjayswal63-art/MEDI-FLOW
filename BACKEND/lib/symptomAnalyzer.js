/**
 * Symptom scoring for MEDI FLOW (runs on Node/Vercel — no Python required).
 * Screening aid only; not a medical diagnosis.
 */

function normalizeSymptom(s) {
  return String(s || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

/** UI labels from NoveltyComponent */
const CONDITION_PROFILES = [
  {
    id: "cardiac_emergency",
    label: "Possible cardiac event",
    urgent: true,
    weight: 1.15,
    symptoms: [
      "chest pain",
      "shortness of breath",
      "racing heart",
      "left arm pain",
      "jaw pain",
      "sweating",
      "dizziness",
      "fainting",
    ],
  },
  {
    id: "pulmonary_embolism",
    label: "Possible pulmonary embolism",
    urgent: true,
    weight: 1.2,
    symptoms: ["sudden shortness of breath", "chest pain", "coughing blood", "coughing"],
  },
  {
    id: "pneumonia",
    label: "Pneumonia (possible)",
    weight: 1.05,
    symptoms: ["coughing", "coughing blood", "wheezing", "shortness of breath", "chest pain"],
  },
  {
    id: "asthma",
    label: "Asthma exacerbation (possible)",
    weight: 1.0,
    symptoms: ["wheezing", "shortness of breath", "coughing", "chest pain"],
  },
  {
    id: "gerd_gastritis",
    label: "GERD / Gastritis",
    weight: 1.0,
    symptoms: [
      "nausea",
      "vomiting",
      "stomach pain",
      "bloating",
      "heartburn",
      "loss of appetite",
      "regurgitation",
      "difficulty swallowing",
    ],
  },
  {
    id: "peptic_ulcer",
    label: "Peptic ulcer disease (possible)",
    weight: 0.95,
    symptoms: ["stomach pain", "nausea", "vomiting", "heartburn", "loss of appetite"],
  },
  {
    id: "migraine",
    label: "Migraine (possible)",
    weight: 1.0,
    symptoms: ["headache", "nausea", "blurred vision", "dizziness", "vomiting"],
  },
  {
    id: "stroke_screening",
    label: "Neurological emergency (stroke screening)",
    urgent: true,
    weight: 1.1,
    symptoms: ["confusion", "blurred vision", "headache", "dizziness", "fainting"],
  },
  {
    id: "anxiety_panic",
    label: "Anxiety / panic attack (possible)",
    weight: 0.9,
    symptoms: ["chest pain", "racing heart", "shortness of breath", "dizziness", "sweating"],
  },
  {
    id: "hypertension",
    label: "Hypertension (screening)",
    weight: 0.85,
    symptoms: ["headache", "chest pain", "dizziness", "blurred vision", "racing heart"],
  },
  {
    id: "common_cold",
    label: "Common cold / upper respiratory infection",
    weight: 0.9,
    symptoms: ["coughing", "wheezing", "headache", "nausea"],
  },
];

function scoreCondition(profile, selectedSet) {
  const keys = profile.symptoms.map(normalizeSymptom);
  let matched = 0;
  const matchedLabels = [];
  for (const key of keys) {
    if (selectedSet.has(key)) {
      matched++;
      matchedLabels.push(key);
    }
  }
  if (matched === 0) return null;

  const coverage = matched / keys.length;
  const precision = matched / selectedSet.size;
  const raw = (coverage * 0.65 + precision * 0.35) * (profile.weight || 1);
  const score = Math.min(98, Math.round(raw * 100));

  return {
    id: profile.id,
    condition: profile.label,
    score,
    matched,
    matchedSymptoms: matchedLabels,
    urgent: Boolean(profile.urgent),
  };
}

function severityFromScore(score, urgent) {
  if (urgent && score >= 35) return "high";
  if (score >= 55) return "high";
  if (score >= 32) return "medium";
  return "low";
}

function buildPredictionMessage(top, second, urgentAny) {
  if (!top) {
    return "No matching pattern — please select symptoms or see a clinician.";
  }
  const conf = top.score;
  if (top.urgent && conf >= 40) {
    return `${top.condition} — ${conf}% match (urgent screening). Seek emergency care if symptoms are severe or worsening.`;
  }
  let msg = `Most likely: ${top.condition} (${conf}% symptom match)`;
  if (second && second.score >= 25) {
    msg += `. Also consider: ${second.condition} (${second.score}%)`;
  }
  return msg + ". This is a screening aid, not a diagnosis.";
}

function analyzeSymptoms(symptomList) {
  const raw = Array.isArray(symptomList) ? symptomList : [];
  const selected = raw.map(normalizeSymptom).filter(Boolean);
  const selectedSet = new Set(selected);

  if (selectedSet.size === 0) {
    return {
      prediction:
        "Select at least one symptom for analysis. If you feel very unwell, contact a doctor or emergency services.",
      primaryCondition: null,
      confidence: 0,
      severity: "unknown",
      urgent: false,
      rankings: [],
      matchedCount: 0,
    };
  }

  const rankings = CONDITION_PROFILES
    .map((p) => scoreCondition(p, selectedSet))
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);

  const top = rankings[0] || null;
  const second = rankings[1] || null;
  const urgent = rankings.some((r) => r.urgent && r.score >= 35);

  const severity = top ? severityFromScore(top.score, top.urgent) : "low";

  return {
    prediction: buildPredictionMessage(top, second, urgent),
    primaryCondition: top?.condition || null,
    primaryId: top?.id || null,
    confidence: top?.score || 0,
    severity,
    urgent,
    rankings: rankings.slice(0, 5).map((r) => ({
      condition: r.condition,
      score: r.score,
      id: r.id,
      urgent: r.urgent,
    })),
    matchedCount: selectedSet.size,
  };
}

module.exports = { analyzeSymptoms, normalizeSymptom, CONDITION_PROFILES };
