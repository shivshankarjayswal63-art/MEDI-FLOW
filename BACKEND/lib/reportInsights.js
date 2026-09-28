const fs = require("fs");

const SPECIALTY_RULES = [
  {
    spec: "cardiology",
    keys: ["cardio", "heart", "ecg", "ekg", "lipid", "cholesterol", "chest", "hypertension", "bp"],
  },
  { spec: "dermatology", keys: ["derm", "skin", "rash", "eczema", "psoriasis", "acne"] },
  { spec: "pediatrics", keys: ["pediatric", "child", "infant", "vaccination"] },
  { spec: "orthopedic", keys: ["ortho", "bone", "joint", "fracture", "spine", "knee", "x-ray", "xray"] },
  { spec: "ent", keys: ["ent", "ear", "throat", "sinus", "hearing"] },
  {
    spec: "general",
    keys: ["blood", "cbc", "urine", "thyroid", "diabetes", "hba1c", "glucose", "vitamin", "liver", "kidney"],
  },
];

function extractLoosePdfText(filePath) {
  try {
    if (!filePath || !fs.existsSync(filePath)) return "";
    const buf = fs.readFileSync(filePath);
    if (buf.length < 50) return "";
    const raw = buf.toString("latin1");
    const parts = [];
    const paren = /\(([^()\\]{4,200})\)/g;
    let m;
    while ((m = paren.exec(raw)) !== null) {
      const t = m[1].replace(/\\n/g, " ").trim();
      if (/[a-zA-Z]{3}/.test(t)) parts.push(t);
      if (parts.length > 40) break;
    }
    return parts.join(" ").slice(0, 4000);
  } catch {
    return "";
  }
}

function inferFromText(text) {
  const t = String(text || "").toLowerCase();
  const specialties = new Set();
  const tags = [];

  for (const rule of SPECIALTY_RULES) {
    for (const k of rule.keys) {
      if (t.includes(k)) {
        specialties.add(rule.spec);
        tags.push(k);
      }
    }
  }

  return {
    specialties: [...specialties],
    tags: [...new Set(tags)].slice(0, 12),
  };
}

/**
 * Build a short summary + specialty hints from filename, optional notes, and PDF text.
 */
function analyzeReport({ fileName, filePath, patientNotes, fileBuffer }) {
  let pdfText = "";
  if (fileBuffer && fileBuffer.length > 0) {
    try {
      const raw = fileBuffer.toString("latin1");
      const parts = [];
      const paren = /\(([^()\\]{4,200})\)/g;
      let m;
      while ((m = paren.exec(raw)) !== null) {
        const t = m[1].replace(/\\n/g, " ").trim();
        if (/[a-zA-Z]{3}/.test(t)) parts.push(t);
        if (parts.length > 40) break;
      }
      pdfText = parts.join(" ").slice(0, 4000);
    } catch {
      pdfText = "";
    }
  }
  if (!pdfText) {
    pdfText = extractLoosePdfText(filePath);
  }
  const combined = `${fileName || ""} ${patientNotes || ""} ${pdfText}`;
  const { specialties, tags } = inferFromText(combined);

  const nameHint = String(fileName || "Medical report")
    .replace(/^\d+-/, "")
    .replace(/[_-]/g, " ")
    .replace(/\.(pdf|png|jpe?g)$/i, "");

  let summary = `Report: **${nameHint}**`;
  if (patientNotes?.trim()) {
    summary += `. Notes: ${patientNotes.trim().slice(0, 200)}`;
  }
  if (specialties.length) {
    summary += `. Suggests follow-up areas: ${specialties.join(", ")}.`;
  } else if (tags.length) {
    summary += `. Keywords: ${tags.slice(0, 6).join(", ")}.`;
  } else {
    summary += `. Stored for your MEDI FLOW health record.`;
  }

  return {
    reportSummary: summary.slice(0, 500),
    aiTags: tags,
    specialties,
    extractedSnippet: pdfText.slice(0, 500),
  };
}

function mergeSpecialtyHints(...lists) {
  const scores = {};
  for (const list of lists) {
    for (const s of list || []) {
      scores[s] = (scores[s] || 0) + 1;
    }
  }
  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([spec]) => spec);
}

module.exports = {
  analyzeReport,
  inferFromText,
  mergeSpecialtyHints,
  extractLoosePdfText,
};
