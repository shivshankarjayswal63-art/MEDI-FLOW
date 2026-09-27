const { inferFromText, mergeSpecialtyHints } = require("./reportInsights");

function matchSpecializationFromText(text) {
  const t = String(text || "").toLowerCase();
  if (t.includes("cardio") || t.includes("heart")) return "cardiology";
  if (t.includes("derm") || t.includes("skin") || t.includes("rash")) return "dermatology";
  if (t.includes("pediatr") || t.includes("child")) return "pediatrics";
  if (t.includes("ortho") || t.includes("bone") || t.includes("joint")) return "orthopedic";
  if (t.includes("ent") || t.includes("ear") || t.includes("throat")) return "ent";
  if (t.includes("gp") || t.includes("general") || t.includes("fever")) return "general";
  return null;
}

function collectPatientSignals(patientContext, message, history = []) {
  const specs = [];
  const reasons = [];

  const msgSpec = matchSpecializationFromText(message);
  if (msgSpec) {
    specs.push(msgSpec);
    reasons.push(`your message (${msgSpec})`);
  }

  const { specialties: msgInferred } = inferFromText(message);
  if (msgInferred.length) {
    specs.push(...msgInferred);
    reasons.push("symptoms or concerns in your message");
  }

  for (const h of (history || []).slice(-6)) {
    if (h.role !== "user") continue;
    const { specialties } = inferFromText(h.content);
    specs.push(...specialties);
  }

  if (patientContext?.profile?.chronicConditions) {
    const { specialties } = inferFromText(patientContext.profile.chronicConditions);
    specs.push(...specialties);
    reasons.push("chronic conditions on profile");
  }
  if (patientContext?.profile?.healthNotes) {
    const { specialties } = inferFromText(patientContext.profile.healthNotes);
    specs.push(...specialties);
  }

  for (const r of patientContext?.medicalReports || []) {
    if (r.specialties?.length) specs.push(...r.specialties);
    else if (r.aiTags?.length) {
      const { specialties } = inferFromText(r.aiTags.join(" "));
      specs.push(...specialties);
    } else if (r.reportSummary) {
      const { specialties } = inferFromText(r.reportSummary);
      specs.push(...specialties);
    }
    if (r.fileName) reasons.push(`report: ${r.fileName}`);
  }

  for (const a of patientContext?.recentAnalyses || []) {
    const { specialties } = inferFromText(`${a.prediction || ""} ${(a.symptoms || []).join(" ")}`);
    specs.push(...specialties);
  }

  const rankedSpecs = mergeSpecialtyHints(specs);
  const uniqueReasons = [...new Set(reasons)].slice(0, 5);
  return { rankedSpecs, reasons: uniqueReasons };
}

function scoreDoctor(doctor, rankedSpecs) {
  const sp = String(doctor.specialization || "").toLowerCase();
  let score = 0;
  for (let i = 0; i < rankedSpecs.length; i++) {
    const spec = rankedSpecs[i];
    if (sp.includes(spec.slice(0, 5))) score += 12 - i * 2;
  }
  if (!rankedSpecs.length && /general|family|medicine/i.test(sp)) score += 3;
  return score;
}

function rankDoctorsForPatient(message, doctors, patientContext, history = []) {
  const { rankedSpecs, reasons } = collectPatientSignals(patientContext, message, history);
  const scored = doctors.map((d) => ({ doctor: d, score: scoreDoctor(d, rankedSpecs) }));
  scored.sort((a, b) => b.score - a.score);
  const withScore = scored.filter((s) => s.score > 0);
  const list = (withScore.length ? withScore : scored).map((s) => s.doctor);
  return { doctors: list, rankedSpecs, reasons };
}

function buildPersonalizedIntro(patientContext, rankedSpecs, reasons) {
  const name = patientContext?.profile?.name;
  const parts = [];
  if (name) parts.push(`Hi **${name}** —`);
  parts.push("here are **personalized** MEDI FLOW doctors based on your profile");
  if (patientContext?.medicalReports?.length) {
    parts.push(`, **${patientContext.medicalReports.length} uploaded report(s)**`);
  }
  if (patientContext?.recentAnalyses?.length) parts.push(", and recent symptom checks");
  parts.push(".");

  if (rankedSpecs.length) {
    parts.push(` Focus areas: **${rankedSpecs.slice(0, 3).join(", ")}**.`);
  }
  if (reasons.length) {
    parts.push(` (Using: ${reasons.slice(0, 3).join("; ")}.)`);
  }
  return parts.join("");
}

module.exports = {
  rankDoctorsForPatient,
  buildPersonalizedIntro,
  collectPatientSignals,
};
