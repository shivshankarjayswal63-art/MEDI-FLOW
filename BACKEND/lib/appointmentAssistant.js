const Doctor = require("../Models/DoctorManagement/doctorModel");
const { getSupabase } = require("../config/supabase");
const { useSupabase } = require("../config/supabase");

let doctorsCache = { at: 0, list: [] };
const CACHE_MS = 5 * 60 * 1000;

function detectBookingIntent(message) {
  const t = message.toLowerCase();
  if (/\b(book|schedule|appointment|see a doctor|available doctor|which doctor|slot|visit)\b/.test(t)) {
    return true;
  }
  return (
    /\b(cardiolog|dermatolog|pediatr|general practice|gp)\b/.test(t) &&
    /\b(book|appointment|available|when)\b/.test(t)
  );
}

function matchSpecialization(message) {
  const t = message.toLowerCase();
  if (t.includes("cardio") || t.includes("heart doctor")) return "cardiology";
  if (t.includes("derm") || t.includes("skin")) return "dermatology";
  if (t.includes("pediatr") || t.includes("child")) return "pediatrics";
  if (t.includes("gp") || t.includes("general")) return "general";
  return null;
}

async function listDoctorsForChat() {
  const now = Date.now();
  if (doctorsCache.list.length && now - doctorsCache.at < CACHE_MS) {
    return doctorsCache.list;
  }
  const doctors = await Doctor.find();
  const list = (Array.isArray(doctors) ? doctors : []).map((d) => ({
    id: d._id || d.id,
    name: d.name,
    specialization: d.specialization,
    availability: d.availability || "Mon-Fri 9-17",
    phone: d.phone,
  }));
  doctorsCache = { at: now, list };
  return list;
}

function formatDateISO(d) {
  return d.toISOString().slice(0, 10);
}

function generateTimeSlots() {
  const slots = [];
  for (let h = 9; h <= 16; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
    if (h < 16) slots.push(`${String(h).padStart(2, "0")}:30`);
  }
  return slots;
}

async function getTakenSlots(doctorId, dateIso) {
  if (!useSupabase()) return new Set();
  const supabase = getSupabase();
  const { data } = await supabase
    .from("appointments")
    .select("time")
    .eq("doctor_id", doctorId)
    .gte("date", `${dateIso}T00:00:00`)
    .lte("date", `${dateIso}T23:59:59`);
  const taken = new Set();
  for (const row of data || []) {
    if (row.time) taken.add(String(row.time).slice(0, 5));
  }
  return taken;
}

async function suggestSlotsForDoctor(doctor, daysAhead = 7) {
  const results = [];
  const times = generateTimeSlots();
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  for (let d = 0; d < daysAhead && results.length < 8; d++) {
    const day = new Date(start);
    day.setDate(start.getDate() + d);
    if (day.getDay() === 0) continue; // skip Sunday heuristic
    const dateIso = formatDateISO(day);
    const taken = await getTakenSlots(doctor.id, dateIso);
    for (const time of times) {
      if (taken.has(time)) continue;
      results.push({ date: dateIso, time, label: `${dateIso} at ${time}` });
      if (results.length >= 8) break;
    }
  }
  return results;
}

async function handleBookingRequest(message, userId) {
  if (!userId) {
    return {
      reply:
        "To book an appointment through chat, please **sign in** to your patient account first. You can also use **Book appointment** in the menu.",
      actions: [],
      source: "rules",
    };
  }

  const doctors = await listDoctorsForChat();
  if (!doctors.length) {
    return {
      reply: "No doctors are listed right now. Try **Book appointment** from the menu or contact the hospital.",
      actions: [],
      source: "rules",
    };
  }

  const spec = matchSpecialization(message);
  let filtered = doctors;
  if (spec === "cardiology") {
    filtered = doctors.filter((d) => /cardio/i.test(d.specialization));
  } else if (spec === "dermatology") {
    filtered = doctors.filter((d) => /derm/i.test(d.specialization));
  } else if (spec === "pediatrics") {
    filtered = doctors.filter((d) => /pediatr/i.test(d.specialization));
  } else if (spec === "general") {
    filtered = doctors.filter((d) => /general/i.test(d.specialization));
  }
  if (!filtered.length) filtered = doctors.slice(0, 3);

  const primary = filtered[0];
  const slots = await suggestSlotsForDoctor(primary);

  const lines = filtered
    .slice(0, 4)
    .map((d) => `• **${d.name}** — ${d.specialization} (${d.availability})`)
    .join("\n");

  const reply = `Here are available doctors:\n\n${lines}\n\n**${primary.name}** has open slots soon — tap a time below to book:`;

  const actions = [
    {
      type: "pick_slot",
      doctorId: primary.id,
      doctorName: primary.name,
      specialization: primary.specialization,
      slots: slots.map((s) => ({
        date: s.date,
        time: s.time,
        label: s.label,
      })),
    },
  ];

  return { reply, actions, source: "rules" };
}

module.exports = {
  detectBookingIntent,
  handleBookingRequest,
  listDoctorsForChat,
};
