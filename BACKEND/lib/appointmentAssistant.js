const Doctor = require("../Models/DoctorManagement/doctorModel");
const { filterApprovedDoctors } = require("./doctorApproval");
const { getSupabase } = require("../config/supabase");
const { useSupabase } = require("../config/supabase");

let doctorsCache = { at: 0, list: [] };
const CACHE_MS = 5 * 60 * 1000;

const BOOKING_STEPS = ["choose_doctor", "choose_date", "choose_time", "choose_visit_mode", "confirm"];

function detectBookingIntent(message) {
  const t = message.toLowerCase();
  if (/\b(book( an?)?\s+appointment|schedule\s+(an?\s+)?appointment|make\s+(an?\s+)?appointment|book\s+(for\s+)?me|reschedule|available doctor|which doctor|pick a doctor|open slot|recommend (a )?doctor|best doctor|suggest (a )?doctor)\b/.test(t)) {
    return true;
  }
  if (/\b(book|schedule|appointment)\b/.test(t) && !/\b(when to|should i|how to|why|what)\s+(visit|see)\b/.test(t)) {
    return true;
  }
  if (/\b(cardiolog|dermatolog|pediatr|general practice|gp|ent|orthoped)\b/.test(t) && /\b(book|appointment|available|when|need)\b/.test(t)) {
    return true;
  }
  return false;
}

function isBookingContinuation(message, bookingState) {
  if (bookingState?.step && BOOKING_STEPS.includes(bookingState.step)) return true;
  const t = message.toLowerCase();
  if (/^(yes|confirm|ok|okay|proceed|book it)\b/.test(t) && bookingState?.step === "confirm") return true;
  if (bookingState?.doctorId && /\b(in[- ]?person|video|phone|call|telehealth|clinic)\b/.test(t)) return true;
  return false;
}

function isActiveBookingWizard(history, bookingState) {
  if (bookingState?.step && BOOKING_STEPS.includes(bookingState.step)) return true;
  if (!Array.isArray(history) || !history.length) return false;
  const lastAssistant = [...history].reverse().find((m) => m.role === "assistant");
  if (!lastAssistant?.content) return false;
  return /\b(Step [1-5]|MEDI FLOW doctors|tap a doctor|Choose a time|Confirm booking|In-person|Video call)\b/i.test(
    String(lastAssistant.content)
  );
}

function shouldRunBookingFlow(message, bookingState, selection, options = {}) {
  const { forceBooking = false, history = [] } = options;
  if (forceBooking) return true;
  if (selection?.kind) return true;
  if (isBookingContinuation(message, bookingState)) return true;
  if (detectBookingIntent(message)) return true;
  if (isActiveBookingWizard(history, bookingState)) return true;
  return false;
}

function llmRefusedBooking(reply) {
  if (!reply) return false;
  return /\b(not able to book|cannot book|can't book|unable to book|don't book|do not book|i'm not able to book|cannot directly book)\b/i.test(
    reply
  );
}

function matchSpecialization(message) {
  const t = message.toLowerCase();
  if (t.includes("cardio") || t.includes("heart")) return "cardiology";
  if (t.includes("derm") || t.includes("skin") || t.includes("rash")) return "dermatology";
  if (t.includes("pediatr") || t.includes("child") || t.includes("baby")) return "pediatrics";
  if (t.includes("ortho") || t.includes("bone") || t.includes("joint")) return "orthopedic";
  if (t.includes("ent") || t.includes("ear") || t.includes("throat")) return "ent";
  if (t.includes("gp") || t.includes("general") || t.includes("fever") || t.includes("checkup")) return "general";
  return null;
}

const { rankDoctorsForPatient, buildPersonalizedIntro } = require("./doctorRecommendation");

async function listDoctorsForChat() {
  const now = Date.now();
  if (doctorsCache.list.length && now - doctorsCache.at < CACHE_MS) {
    return doctorsCache.list;
  }
  const doctors = filterApprovedDoctors(await Doctor.find());
  const list = doctors.map((d) => ({
    id: d._id || d.id,
    name: d.name,
    specialization: d.specialization,
    availability: d.availability || "Mon–Fri 9:00–17:00",
    phone: d.phone,
  }));
  doctorsCache = { at: now, list };
  return list;
}

function formatDateISO(d) {
  return d.toISOString().slice(0, 10);
}

function formatDateLabel(iso) {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
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

async function getOpenSlotsOnDate(doctorId, dateIso) {
  const times = generateTimeSlots();
  const taken = await getTakenSlots(doctorId, dateIso);
  return times.filter((t) => !taken.has(t));
}

async function getAvailableDatesForDoctor(doctorId, daysAhead = 14, maxDates = 6) {
  const dates = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  for (let d = 0; d < daysAhead && dates.length < maxDates; d++) {
    const day = new Date(start);
    day.setDate(start.getDate() + d);
    if (day.getDay() === 0) continue;
    const dateIso = formatDateISO(day);
    const open = await getOpenSlotsOnDate(doctorId, dateIso);
    if (open.length) {
      dates.push({ date: dateIso, label: formatDateLabel(dateIso), slotCount: open.length });
    }
  }
  return dates;
}

async function suggestNextSlotsForDoctor(doctor, limit = 8) {
  const results = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  for (let d = 0; d < 14 && results.length < limit; d++) {
    const day = new Date(start);
    day.setDate(start.getDate() + d);
    if (day.getDay() === 0) continue;
    const dateIso = formatDateISO(day);
    const open = await getOpenSlotsOnDate(doctor.id, dateIso);
    for (const time of open) {
      results.push({ date: dateIso, time, label: `${formatDateLabel(dateIso)} · ${time}` });
      if (results.length >= limit) break;
    }
  }
  return results;
}

function findDoctorById(doctors, id) {
  return doctors.find((d) => String(d.id) === String(id));
}

function findDoctorByMessage(message, doctors) {
  const t = message.toLowerCase();
  for (const d of doctors) {
    const name = String(d.name || "").toLowerCase();
    if (name && t.includes(name)) return d;
    const last = name.split(" ").pop();
    if (last && last.length > 2 && t.includes(last)) return d;
  }
  const spec = matchSpecialization(message);
  if (spec) {
    const match = doctors.find((d) => String(d.specialization || "").toLowerCase().includes(spec.slice(0, 5)));
    if (match) return match;
  }
  return null;
}

function parseDateFromMessage(message) {
  const iso = message.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
  if (iso) return iso[1];
  const t = message.toLowerCase();
  if (t.includes("tomorrow")) {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return formatDateISO(d);
  }
  if (t.includes("today")) return formatDateISO(new Date());
  return null;
}

function parseTimeFromMessage(message) {
  const m = message.match(/\b(\d{1,2}):(\d{2})\b/);
  if (m) {
    const h = Math.min(23, parseInt(m[1], 10));
    const min = m[2];
    return `${String(h).padStart(2, "0")}:${min}`;
  }
  const m2 = message.match(/\b(\d{1,2})\s*(am|pm)\b/i);
  if (m2) {
    let h = parseInt(m2[1], 10);
    const pm = m2[2].toLowerCase() === "pm";
    if (pm && h < 12) h += 12;
    if (!pm && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:00`;
  }
  return null;
}

function parseVisitMode(message) {
  const t = message.toLowerCase();
  if (/\b(in[- ]?person|clinic|office|face)\b/.test(t)) return "in_person";
  if (/\b(video|call|phone|telehealth|virtual)\b/.test(t)) return "video_call";
  return null;
}

function patientDisplayName(patientContext) {
  return patientContext?.profile?.name || patientContext?.name || "Patient";
}

async function buildDoctorListStep(message, doctors, patientContext, history = []) {
  const { doctors: rankedList, rankedSpecs } = rankDoctorsForPatient(
    message,
    doctors,
    patientContext,
    history
  );
  const ranked = rankedList.slice(0, 5);
  const lines = [];
  for (const d of ranked) {
    const dates = await getAvailableDatesForDoctor(d.id, 14, 3);
    const dayHint =
      dates.length > 0
        ? dates.map((x) => x.label).join(", ")
        : "checking schedule — pick doctor to see times";
    const matchTag =
      rankedSpecs.length && String(d.specialization || "").toLowerCase().includes(rankedSpecs[0].slice(0, 5))
        ? " ⭐ Best match"
        : "";
    lines.push(`• **${d.name}** — ${d.specialization}${matchTag}\n  Open: ${dayHint}`);
  }

  let intro =
    patientContext?.profile?.name || patientContext?.medicalReports?.length
      ? buildPersonalizedIntro(patientContext, rankedSpecs, [])
      : `I can book **only inside MEDI FLOW** — choose a doctor below. I'll use your profile for your name and contact details.`;

  if (!patientContext?.medicalReports?.length) {
    intro += "\n\n💡 Upload past lab reports under **My profile** or **Lab results** for smarter doctor matching.";
  }

  const reply = `${intro}\n\n${lines.join("\n\n")}\n\n**Step 1:** Tap a doctor, or type their name.`;

  const actions = [
    {
      type: "pick_doctor",
      doctors: ranked.map((d) => ({
        doctorId: d.id,
        doctorName: d.name,
        specialization: d.specialization,
      })),
    },
  ];

  return {
    reply,
    actions,
    bookingState: { step: "choose_doctor" },
    source: "rules",
  };
}

async function buildDateStep(doctor, patientContext) {
  const dates = await getAvailableDatesForDoctor(doctor.id, 14, 8);
  if (!dates.length) {
    return {
      reply: `**${doctor.name}** has no open days in the next two weeks. Pick another doctor or try **Book appointment** in the menu.`,
      actions: [{ type: "pick_doctor", doctors: [] }],
      bookingState: { step: "choose_doctor", doctorId: doctor.id, doctorName: doctor.name, specialization: doctor.specialization },
      source: "rules",
    };
  }

  const reply = `**${doctor.name}** (${doctor.specialization})\n\n**Step 2:** Which day works for you? (${patientDisplayName(patientContext)} — we'll confirm your name from your profile.)\n\nAvailable days:`;

  return {
    reply,
    actions: [
      {
        type: "pick_date",
        doctorId: doctor.id,
        doctorName: doctor.name,
        specialization: doctor.specialization,
        dates,
      },
    ],
    bookingState: {
      step: "choose_date",
      doctorId: doctor.id,
      doctorName: doctor.name,
      specialization: doctor.specialization,
    },
    source: "rules",
  };
}

async function buildTimeStep(doctor, dateIso, patientContext) {
  const open = await getOpenSlotsOnDate(doctor.id, dateIso);
  if (!open.length) {
    return buildDateStep(doctor, patientContext);
  }

  const reply = `**${formatDateLabel(dateIso)}** with **${doctor.name}**\n\n**Step 3:** Choose a time:`;

  return {
    reply,
    actions: [
      {
        type: "pick_time",
        doctorId: doctor.id,
        doctorName: doctor.name,
        specialization: doctor.specialization,
        date: dateIso,
        times: open.map((time) => ({ time, label: time })),
      },
    ],
    bookingState: {
      step: "choose_time",
      doctorId: doctor.id,
      doctorName: doctor.name,
      specialization: doctor.specialization,
      date: dateIso,
    },
    source: "rules",
  };
}

function buildVisitModeStep(state, patientContext) {
  const reply = `**Step 4:** How would you like the visit on **${formatDateLabel(state.date)}** at **${state.time}** with **${state.doctorName}**?\n\nChoose **In-person** at the clinic or **Video call**.`;

  return {
    reply,
    actions: [
      {
        type: "pick_visit_mode",
        doctorId: state.doctorId,
        doctorName: state.doctorName,
        specialization: state.specialization,
        date: state.date,
        time: state.time,
        modes: [
          { mode: "in_person", label: "In-person" },
          { mode: "video_call", label: "Video call" },
        ],
      },
    ],
    bookingState: { ...state, step: "choose_visit_mode" },
    source: "rules",
  };
}

function buildConfirmStep(state, patientContext, userId) {
  const name = patientDisplayName(patientContext);
  const modeLabel = state.visitMode === "video_call" ? "Video call" : "In-person";

  if (!userId) {
    return {
      reply: `Almost done. Please **sign in** to your patient account to confirm:\n\n**${name}** · **${state.doctorName}** · ${formatDateLabel(state.date)} · **${state.time}** · ${modeLabel}\n\nAfter sign-in, open Medical assistant again and say **confirm booking**.`,
      actions: [],
      bookingState: { ...state, step: "confirm" },
      source: "rules",
    };
  }

  const reply = `**Step 5 — Confirm** (MEDI FLOW booking)\n\n**Patient:** ${name} (from your profile)\n**Doctor:** ${state.doctorName} (${state.specialization})\n**When:** ${formatDateLabel(state.date)} at **${state.time}**\n**Visit:** ${modeLabel}\n\nTap **Confirm booking** or type **confirm**.`;

  return {
    reply,
    actions: [
      {
        type: "confirm_booking",
        doctorId: state.doctorId,
        doctorName: state.doctorName,
        specialization: state.specialization,
        date: state.date,
        time: state.time,
        visitMode: state.visitMode,
        patientName: name,
      },
    ],
    bookingState: { ...state, step: "confirm" },
    source: "rules",
  };
}

/**
 * Multi-step in-app booking (never external portals).
 */
async function processBookingFlow({ message, userId, patientContext, bookingState, selection, history = [] }) {
  if (/\b(cancel|stop booking|never mind)\b/i.test(message) && !selection?.kind) {
    return {
      reply: "Booking cancelled. Ask any health question or say **book appointment** when you're ready.",
      actions: [],
      bookingState: null,
      source: "rules",
    };
  }

  const doctors = await listDoctorsForChat();
  if (!doctors.length) {
    return {
      reply: "No doctors are listed in MEDI FLOW right now. Ask your hospital admin to add doctors, or use **Book appointment** in the menu.",
      actions: [],
      bookingState: null,
      source: "rules",
    };
  }

  let state = bookingState ? { ...bookingState } : null;

  if (selection?.kind === "doctor" && selection.doctorId) {
    const doctor = findDoctorById(doctors, selection.doctorId);
    if (!doctor) {
      return buildDoctorListStep(message, doctors, patientContext, history);
    }
    return buildDateStep(doctor, patientContext);
  }

  if (selection?.kind === "date" && selection.date && (selection.doctorId || state?.doctorId)) {
    const doctor = findDoctorById(doctors, selection.doctorId || state.doctorId);
    if (!doctor) return buildDoctorListStep(message, doctors, patientContext, history);
    return buildTimeStep(doctor, selection.date, patientContext);
  }

  if (selection?.kind === "time" && selection.time) {
    const doctor = findDoctorById(doctors, selection.doctorId || state?.doctorId);
    const dateIso = selection.date || state?.date;
    if (!doctor || !dateIso) return buildDoctorListStep(message, doctors, patientContext, history);
    const nextState = {
      step: "choose_visit_mode",
      doctorId: doctor.id,
      doctorName: doctor.name,
      specialization: doctor.specialization,
      date: dateIso,
      time: selection.time,
    };
    return buildVisitModeStep(nextState, patientContext);
  }

  if (selection?.kind === "visit_mode" && selection.visitMode) {
    const doctor = findDoctorById(doctors, selection.doctorId || state?.doctorId);
    if (!doctor || !state?.date || !state?.time) {
      return buildDoctorListStep(message, doctors, patientContext, history);
    }
    const nextState = {
      ...state,
      doctorId: doctor.id,
      doctorName: doctor.name,
      specialization: doctor.specialization,
      visitMode: selection.visitMode,
    };
    return buildConfirmStep(nextState, patientContext, userId);
  }

  if (selection?.kind === "confirm") {
    return {
      reply: "Use the **Confirm booking** button to finish, or ensure you are signed in.",
      actions: state?.step === "confirm"
        ? [
            {
              type: "confirm_booking",
              doctorId: state.doctorId,
              doctorName: state.doctorName,
              specialization: state.specialization,
              date: state.date,
              time: state.time,
              visitMode: state.visitMode,
              patientName: patientDisplayName(patientContext),
            },
          ]
        : [],
      bookingState: state,
      source: "rules",
    };
  }

  if (!state || state.step === "choose_doctor" || detectBookingIntent(message)) {
    const picked = findDoctorByMessage(message, doctors);
    if (picked && state?.step === "choose_doctor") {
      return buildDateStep(picked, patientContext);
    }
    if (!state || detectBookingIntent(message)) {
      return buildDoctorListStep(message, doctors, patientContext, history);
    }
  }

  const doctor = state.doctorId ? findDoctorById(doctors, state.doctorId) : null;

  if (state.step === "choose_date" && doctor) {
    const dateIso = parseDateFromMessage(message);
    if (dateIso) return buildTimeStep(doctor, dateIso, patientContext);
    return buildDateStep(doctor, patientContext);
  }

  if (state.step === "choose_time" && doctor && state.date) {
    const time = parseTimeFromMessage(message);
    if (time) {
      const open = await getOpenSlotsOnDate(doctor.id, state.date);
      if (!open.includes(time)) {
        return {
          reply: `That time isn't available. Pick one of the open slots below.`,
          actions: [
            {
              type: "pick_time",
              doctorId: doctor.id,
              doctorName: doctor.name,
              specialization: doctor.specialization,
              date: state.date,
              times: open.map((t) => ({ time: t, label: t })),
            },
          ],
          bookingState: state,
          source: "rules",
        };
      }
      return buildVisitModeStep({ ...state, time }, patientContext);
    }
    return buildTimeStep(doctor, state.date, patientContext);
  }

  if (state.step === "choose_visit_mode") {
    const mode = parseVisitMode(message);
    if (mode) {
      return buildConfirmStep({ ...state, visitMode: mode }, patientContext, userId);
    }
    return buildVisitModeStep(state, patientContext);
  }

  if (state.step === "confirm" && /^(yes|confirm|ok|okay|proceed|book)/i.test(message.trim())) {
    return buildConfirmStep(state, patientContext, userId);
  }

  return buildDoctorListStep(message, doctors, patientContext, history);
}

/** @deprecated use processBookingFlow */
async function handleBookingRequest(message, userId, patientContext, history = []) {
  const result = await processBookingFlow({
    message,
    userId,
    patientContext,
    bookingState: null,
    selection: null,
    history,
  });
  return result;
}

function invalidateDoctorsCache() {
  doctorsCache = { at: 0, list: [] };
}

module.exports = {
  detectBookingIntent,
  shouldRunBookingFlow,
  isBookingContinuation,
  isActiveBookingWizard,
  llmRefusedBooking,
  processBookingFlow,
  handleBookingRequest,
  listDoctorsForChat,
  suggestNextSlotsForDoctor,
  invalidateDoctorsCache,
};
