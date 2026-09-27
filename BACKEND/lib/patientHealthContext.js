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

  const [userRow, vitals, analyses, prescriptions, appointments] = await Promise.all([
    supabase
      .from("users")
      .select("name, email, blood_group, city, gender, mobile")
      .eq("id", userId)
      .maybeSingle()
      .then((r) => (r.error ? null : r.data)),
    safeList(supabase, "vitals", "user_id", userId, "created_at", 5),
    safeList(supabase, "analyses", "user_id", userId, "created_at", 5),
    safeList(supabase, "prescriptions", "patient_id", userId, "date_issued", 5),
    safeList(supabase, "appointments", "user_id", userId, "date", 5),
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

  return {
    profile: userRow
      ? {
          name: userRow.name,
          bloodGroup: userRow.blood_group,
          city: userRow.city,
          gender: userRow.gender,
        }
      : {},
    latestVitals,
    recentAnalyses,
    prescriptions: meds,
    upcomingAppointments: upcoming.slice(0, 3),
    recentAppointments: appts.slice(0, 3),
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
