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
async function getPatientHealthContext(userId) {
  if (!userId || !useSupabase()) return null;

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
    medicine: p.medicine,
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
    /\bwhat do you know about me\b/.test(t)
  );
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
      .map((p) => `• ${p.medicine}${p.notes ? ` — ${p.notes}` : ""}`)
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
  buildHealthSummaryReply,
};
