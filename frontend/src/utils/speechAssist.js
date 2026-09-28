const SOUND_PREF_KEY = "mf_sound_enabled";

export function isSoundEnabled() {
  try {
    const v = localStorage.getItem(SOUND_PREF_KEY);
    return v !== "0";
  } catch {
    return true;
  }
}

export function setSoundEnabled(enabled) {
  try {
    localStorage.setItem(SOUND_PREF_KEY, enabled ? "1" : "0");
  } catch {
    /* ignore */
  }
}

export function isSpeechRecognitionSupported() {
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function isSpeechSynthesisSupported() {
  return Boolean(window.speechSynthesis);
}

let activeRecognition = null;

export function stopListening() {
  if (activeRecognition) {
    try {
      activeRecognition.abort();
    } catch {
      /* ignore */
    }
    activeRecognition = null;
  }
}

/**
 * @param {{ onResult: (transcript: string) => void, onError?: (msg: string) => void, onStart?: () => void, onEnd?: () => void }} handlers
 */
export function startListening(handlers) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    handlers.onError?.("Voice input is not supported in this browser. Try Chrome or Edge.");
    return false;
  }

  stopListening();
  const recognition = new SR();
  activeRecognition = recognition;
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.continuous = false;

  recognition.onstart = () => handlers.onStart?.();
  recognition.onend = () => {
    activeRecognition = null;
    handlers.onEnd?.();
  };
  recognition.onerror = (event) => {
    const msg =
      event.error === "not-allowed"
        ? "Microphone permission denied. Allow mic access in browser settings."
        : event.error === "no-speech"
          ? "No speech detected. Try again."
          : "Voice input failed. Try again.";
    handlers.onError?.(msg);
  };
  recognition.onresult = (event) => {
    const text = event.results?.[0]?.[0]?.transcript || "";
    if (text.trim()) handlers.onResult(text.trim());
  };

  try {
    recognition.start();
    return true;
  } catch {
    handlers.onError?.("Could not start microphone.");
    activeRecognition = null;
    return false;
  }
}

export function stopSpeaking() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

export function speak(text, { rate = 0.95, pitch = 1 } = {}) {
  if (!isSpeechSynthesisSupported() || !text) return false;
  stopSpeaking();
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = rate;
  utter.pitch = pitch;
  utter.lang = "en-US";
  window.speechSynthesis.speak(utter);
  return true;
}

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = new Ctx();
  }
  return audioCtx;
}

/** Short UI tones (no external files). */
export function playUiSound(type = "tap") {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  const presets = {
    tap: { f: 520, dur: 0.08, vol: 0.12 },
    listen: { f: 640, dur: 0.12, vol: 0.14 },
    success: { f: 880, dur: 0.18, vol: 0.15 },
    error: { f: 220, dur: 0.22, vol: 0.14 },
  };
  const p = presets[type] || presets.tap;
  osc.type = type === "success" ? "sine" : "triangle";
  osc.frequency.setValueAtTime(p.f, now);
  if (type === "success") {
    osc.frequency.exponentialRampToValueAtTime(p.f * 1.4, now + p.dur * 0.5);
  }
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(p.vol, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + p.dur);
  osc.start(now);
  osc.stop(now + p.dur + 0.02);
}

const VOICE_PHRASE_MAP = [
  { patterns: ["chest pain", "chest hurts", "tight chest"], symptom: "Chest Pain" },
  { patterns: ["shortness of breath", "short of breath", "breathless", "hard to breathe"], symptom: "Shortness of Breath" },
  { patterns: ["racing heart", "fast heartbeat", "palpitation"], symptom: "Racing Heart" },
  { patterns: ["left arm", "arm pain"], symptom: "Left Arm Pain" },
  { patterns: ["jaw pain"], symptom: "Jaw Pain" },
  { patterns: ["sweating", "sweat"], symptom: "Sweating" },
  { patterns: ["nausea", "feel sick"], symptom: "Nausea" },
  { patterns: ["vomiting", "throwing up"], symptom: "Vomiting" },
  { patterns: ["stomach pain", "belly pain", "tummy"], symptom: "Stomach Pain" },
  { patterns: ["bloating", "bloated"], symptom: "Bloating" },
  { patterns: ["heartburn", "acid reflux"], symptom: "Heartburn" },
  { patterns: ["loss of appetite", "not hungry"], symptom: "Loss of Appetite" },
  { patterns: ["dizzy", "dizziness"], symptom: "Dizziness" },
  { patterns: ["fainting", "passed out"], symptom: "Fainting" },
  { patterns: ["headache", "head pain"], symptom: "Headache" },
  { patterns: ["confusion", "confused"], symptom: "Confusion" },
  { patterns: ["blurred vision", "blurry vision"], symptom: "Blurred Vision" },
  { patterns: ["cough", "coughing"], symptom: "Coughing" },
  { patterns: ["blood in cough", "bloody cough"], symptom: "Coughing Blood" },
  { patterns: ["wheezing", "wheeze"], symptom: "Wheezing" },
  { patterns: ["sudden shortness"], symptom: "Sudden Shortness of Breath" },
  { patterns: ["swallow", "swallowing"], symptom: "Difficulty Swallowing" },
  { patterns: ["regurgitation"], symptom: "Regurgitation" },
];

/**
 * @param {string} transcript
 * @param {string[]} catalog — canonical symptom names
 */
export function matchSymptomsFromSpeech(transcript, catalog) {
  const lower = transcript.toLowerCase();
  const found = new Set();

  for (const name of catalog) {
    if (lower.includes(name.toLowerCase())) {
      found.add(name);
    }
  }

  for (const { patterns, symptom } of VOICE_PHRASE_MAP) {
    if (!catalog.includes(symptom)) continue;
    if (patterns.some((p) => lower.includes(p))) {
      found.add(symptom);
    }
  }

  return [...found];
}
