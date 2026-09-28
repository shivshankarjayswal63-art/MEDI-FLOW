const { getSupabase } = require("../config/supabase");
const { useSupabase } = require("../config/supabase");

async function safeList(supabase, table, column, userId, orderBy, limit) {
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq(column, userId)
    .order(orderBy, { ascending: false })
    .limit(limit);
  if (error) return [];
  return data || [];
}

/**
 * Compact health summary for medical assistant (authenticated patient only).
 */
function formatMedicineField(medicine) {
  if (medicine == null || medicine === "") return "Medicines on file";
  if (typeof medicine === "string") return medicine;
  if (Array.isArray(medicine)) {
    return medicine
      .map((m) => {
        if (typeof m === "string") return m;
        const name = m.medicineName || m.name || m.medicine || "";
        const dose = m.dosage || m.dose || "";
        return `${name} ${dose}`.trim();
      })
      .filter(Boolean)
      .join(", ");
  }
  if (typeof medicine === "object") {
    try {
      return JSON.stringify(medicine);
    } catch {
      return "Medicines on file";
    }
  }
  return String(medicine);
}

async function getPatientHealthContextMongo(userId) {
  const User = require("../Models/UserModel");
  const Vitals = require("../Models/VitalsModel");
  const Analysis = require("../Models/AnalysisModel");
  const MedicalReport = require("../Models/MedicalReport");
  const Appointment = require("../Models/AppoinmentModel");

  const user = await User.findById(userId);
  const vitalsRows = await Vitals.find({ userId });
  const vitals = [...(vitalsRows || [])].sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  );
  const analysesRows = await Analysis.find({ userId });
  const analyses = [...(analysesRows || [])].sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  );
  const reportsRows = await MedicalReport.find({ userId });
  const reports = [...(reportsRows || [])].sort(
    (a, b) => new Date(b.uploadedAt || 0) - new Date(a.uploadedAt || 0)
  );
  const apptsRows = await Appointment.find({ user_id: userId });
  const appointments = [...(apptsRows || [])].sort(
    (a, b) => new Date(b.date || 0) - new Date(a.date || 0)
  );

  const latestVitals = vitals[0]
    ? { bp: vitals[0].bp, pulse: vitals[0].pulse, sugar: vitals[0].sugar, at: vitals[0].createdAt }
    : null;

  const { inferFromText } = require("./reportInsights");
  const medicalReports = reports.map((r) => {
    const fileName = r.fileName || r.file_name;
    const summary = r.reportSummary || r.report_summary;
    const tags = r.aiTags || r.ai_tags || [];
    const notes = r.patientNotes || r.patient_notes;
    const { specialties } = inferFromText(`${fileName} ${summary || ""} ${(tags || []).join(" ")} ${notes || ""}`);
    return {
      fileName,
      reportSummary: summary,
      aiTags: tags,
      patientNotes: notes,
      uploadedAt: r.uploadedAt || r.uploaded_at,
      specialties,
    };
  });

  const appts = appointments.map((a) => ({
    doctor: a.doctorName || a.doctor_name,
    specialization: a.specialization,
    date: a.date,
    time: a.time,
    status: a.status,
  }));

  const upcoming = appts.filter(
    (a) => a.status !== "Completed" && new Date(a.date).getTime() >= Date.now() - 86400000
  );

  return {
    profile: user
      ? {
          name: user.name,
          bloodGroup: user.bloodGroup || user.blood_group,
          city: user.city,
          gender: user.gender,
          mobile: user.mobile,
          allergies: user.allergies,
          chronicConditions: user.chronicConditions || user.chronic_conditions,
          healthNotes: user.healthNotes || user.health_notes,
        }
      : {},
    latestVitals,
    recentAnalyses: analyses.slice(0, 5).map((a) => ({
      prediction: a.prediction,
      symptoms: a.symptoms,
      at: a.createdAt,
    })),
    prescriptions: [],
    upcomingAppointments: upcoming.slice(0, 3),
    recentAppointments: appts.slice(0, 3),
    medicalReports,
  };
}

async function getPatientHealthContext(userId) {
  if (!userId) return null;
  if (!useSupabase()) {
    try {
      return await getPatientHealthContextMongo(userId);
    } catch (err) {
      console.warn("patientHealthContext mongo:", err.message);
      return null;
    }
  }

  const supabase = getSupabase();

  const [userRow, vitals, analyses, prescriptions, appointments, reports] = await Promise.all([
    supabase
      .from("users")
      .select("name, email, blood_group, city, gender, mobile, allergies, chronic_conditions, health_notes")
      .eq("id", userId)
      .maybeSingle()
      .then(async (r) => {
        if (!r.error) return r.data;
        const fallback = await supabase
          .from("users")
          .select("name, email, blood_group, city, gender, mobile")
          .eq("id", userId)
          .maybeSingle();
        return fallback.error ? null : fallback.data;
      }),
    safeList(supabase, "vitals", "user_id", userId, "created_at", 5),
    safeList(supabase, "analyses", "user_id", userId, "created_at", 5),
    safeList(supabase, "prescriptions", "patient_id", userId, "date_issued", 5),
    safeList(supabase, "appointments", "user_id", userId, "date", 5),
    safeList(supabase, "medical_reports", "user_id", userId, "uploaded_at", 10),
  ]);

  const latestVitals = vitals[0]
    ? { bp: vitals[0].bp, pulse: vitals[0].pulse, sugar: vitals[0].sugar, at: vitals[0].created_at }
    : null;

  const recentAnalyses = analyses.map((a) => ({
    prediction: a.prediction,
    symptoms: a.symptoms,
    at: a.created_at,
  }));

  const meds = prescriptions.map((p) => ({
    medicine: formatMedicineField(p.medicine),
    notes: p.notes,
    issued: p.date_issued,
  }));

  const appts = appointments.map((a) => ({
    doctor: a.doctor_name,
    specialization: a.specialization,
    date: a.date,
    time: a.time,
    status: a.status,
  }));

  const upcoming = appts.filter(
    (a) => a.status !== "Completed" && new Date(a.date).getTime() >= Date.now() - 86400000
  );

  const { inferFromText } = require("./reportInsights");
  const medicalReports = reports.map((r) => {
    const fileName = r.file_name || r.fileName;
    const summary = r.report_summary || r.reportSummary;
    const tags = r.ai_tags || r.aiTags || [];
    const notes = r.patient_notes || r.patientNotes;
    const { specialties } = inferFromText(`${fileName} ${summary || ""} ${(tags || []).join(" ")} ${notes || ""}`);
    return {
      fileName,
      reportSummary: summary,
      aiTags: tags,
      patientNotes: notes,
      uploadedAt: r.uploaded_at || r.uploadedAt,
      specialties,
    };
  });

  return {
    profile: userRow
      ? {
          name: userRow.name,
          bloodGroup: userRow.blood_group,
          city: userRow.city,
          gender: userRow.gender,
          mobile: userRow.mobile,
          allergies: userRow.allergies,
          chronicConditions: userRow.chronic_conditions,
          healthNotes: userRow.health_notes,
        }
      : {},
    latestVitals,
    recentAnalyses,
    prescriptions: meds,
    upcomingAppointments: upcoming.slice(0, 3),
    recentAppointments: appts.slice(0, 3),
    medicalReports,
  };
}

function detectHealthSummaryIntent(message) {
  const t = message.toLowerCase();
  return (
    /\b(my health|my history|health history|my records|summarize my|my diseases|my condition)\b/.test(t) ||
    /\b(ai health summary|health summary|summarize my health)\b/.test(t) ||
    /\bwhat do you know about me\b/.test(t)
  );
}

function detectReportSummaryIntent(message) {
  const t = message.toLowerCase();
  return (
    /\b(summarize|summary|explain|interpret|what does).*(report|lab|pdf|result)\b/.test(t) ||
    /\b(my|uploaded) (lab |medical )?report\b/.test(t) ||
    /\breport summary\b/.test(t)
  );
}

function buildReportSummaryReply(ctx) {
  if (!ctx) {
    return "Sign in as a patient, then upload a lab report (PDF or image) using **Upload report** here or from **Lab reports** in the menu.";
  }
  const reports = ctx.medicalReports || [];
  if (!reports.length) {
    return "You have no uploaded reports yet. Use **Upload report** below or go to **Lab reports** to add a PDF — I will summarize it for you.";
  }
  const latest = reports[0];
  const parts = [
    `**Latest report:** ${latest.fileName}`,
    latest.reportSummary
      ? String(latest.reportSummary)
      : "Summary is being processed — ask again in a moment.",
  ];
  if (latest.aiTags?.length) {
    parts.push(`**Keywords:** ${latest.aiTags.slice(0, 8).join(", ")}`);
  }
  if (latest.specialties?.length) {
    parts.push(`**Suggested follow-up areas:** ${latest.specialties.join(", ")}`);
  }
  if (reports.length > 1) {
    const older = reports
      .slice(1, 4)
      .map((r) => `• ${r.fileName}`)
      .join("\n");
    parts.push(`**Other recent uploads:**\n${older}`);
  }
  parts.push("Ask **book appointment** if you want help choosing a specialist.");
  return parts.join("\n\n");
}

function buildHealthSummaryReply(ctx) {
  if (!ctx) {
    return "Sign in to your patient account so I can reference your vitals, symptom checks, and appointments safely.";
  }
  const parts = [];
  if (ctx.profile?.name) {
    parts.push(`**${ctx.profile.name}** — here is your recent MEDI FLOW record (educational summary only):`);
  }
  if (ctx.latestVitals) {
    parts.push(
      `**Latest vitals:** BP ${ctx.latestVitals.bp}, pulse ${ctx.latestVitals.pulse}, sugar ${ctx.latestVitals.sugar} mg/dL.`
    );
  }
  if (ctx.recentAnalyses?.length) {
    const lines = ctx.recentAnalyses
      .slice(0, 3)
      .map((a) => `• ${String(a.prediction || "Symptom check").slice(0, 120)}`)
      .join("\n");
    parts.push(`**Recent symptom AI checks:**\n${lines}`);
  }
  if (ctx.prescriptions?.length) {
    const lines = ctx.prescriptions
      .slice(0, 3)
      .map((p) => `• ${formatMedicineField(p.medicine)}${p.notes ? ` — ${p.notes}` : ""}`)
      .join("\n");
    parts.push(`**Prescriptions on file:**\n${lines}`);
  }
  if (ctx.upcomingAppointments?.length) {
    const lines = ctx.upcomingAppointments
      .map((a) => `• ${a.doctor} (${a.specialization}) — ${a.date} ${a.time} [${a.status}]`)
      .join("\n");
    parts.push(`**Upcoming appointments:**\n${lines}`);
  }
  if (ctx.profile?.chronicConditions) {
    parts.push(`**Chronic conditions:** ${ctx.profile.chronicConditions}`);
  }
  if (ctx.profile?.allergies) {
    parts.push(`**Allergies:** ${ctx.profile.allergies}`);
  }
  if (ctx.medicalReports?.length) {
    const lines = ctx.medicalReports
      .slice(0, 5)
      .map((r) => `• ${r.fileName}${r.reportSummary ? ` — ${String(r.reportSummary).replace(/\*\*/g, "")}` : ""}`)
      .join("\n");
    parts.push(`**Uploaded reports:**\n${lines}`);
  }
  if (parts.length <= 1) {
    parts.push("No detailed records found yet. Log vitals or use Symptom AI to build your history.");
  }
  return parts.join("\n\n");
}

module.exports = {
  getPatientHealthContext,
  detectHealthSummaryIntent,
  detectReportSummaryIntent,
  buildHealthSummaryReply,
  buildReportSummaryReply,
};
