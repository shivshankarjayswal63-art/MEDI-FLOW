/** Contextual question suggestions for the medical assistant (client-side). */

export const DEFAULT_PROMPTS = [
  "Summarize my health history",
  "Summarize my lab report",
  "What are stroke warning signs?",
  "I have chest pain and shortness of breath",
  "Difference between heartburn and a heart attack?",
  "When should I see a doctor for a fever?",
  "What helps with migraine symptoms?",
  "Is wheezing always asthma?",
];

const RULES = [
  {
    keys: ["chest", "heart", "cardiac", "arm pain", "jaw"],
    prompts: [
      "When is chest pain a medical emergency?",
      "Heart attack symptoms vs anxiety — how to tell?",
      "What should I do if chest pain comes with shortness of breath?",
      "Difference between heartburn and heart attack?",
    ],
  },
  {
    keys: ["head", "migraine", "dizz"],
    prompts: [
      "When is a headache an emergency?",
      "Common migraine triggers and relief tips",
      "Could dizziness with headache be serious?",
      "What is a tension headache vs migraine?",
    ],
  },
  {
    keys: ["stomach", "nausea", "vomit", "gastri", "heartburn", "reflux", "bloat"],
    prompts: [
      "GERD vs gastritis — what is the difference?",
      "When is stomach pain urgent?",
      "Foods that often worsen acid reflux",
      "Nausea after meals — what could it mean?",
    ],
  },
  {
    keys: ["cough", "breath", "wheez", "asthma", "pneum"],
    prompts: [
      "When should I seek care for a persistent cough?",
      "Asthma attack warning signs",
      "Pneumonia symptoms to watch for",
      "Shortness of breath at rest — is it urgent?",
    ],
  },
  {
    keys: ["fever", "cold", "flu", "sick"],
    prompts: [
      "How high a fever needs medical attention?",
      "Cold vs flu — key differences",
      "When to rest at home vs see a doctor",
      "Dehydration signs with fever",
    ],
  },
  {
    keys: ["stroke", "confus", "vision", "weak"],
    prompts: [
      "Explain the FAST stroke checklist",
      "Sudden vision changes — when to call emergency?",
      "Weakness on one side — what should I do?",
    ],
  },
  {
    keys: ["blood pressure", "hypertension", "bp"],
    prompts: [
      "What is considered high blood pressure?",
      "Lifestyle tips to support healthy BP",
      "Headache with high BP — when to worry?",
    ],
  },
  {
    keys: ["panic", "anxiety", "stress"],
    prompts: [
      "Panic attack symptoms vs heart problems",
      "Breathing techniques during anxiety",
      "When should anxiety symptoms be evaluated medically?",
    ],
  },
  {
    keys: ["diabetes", "sugar", "glucose"],
    prompts: [
      "Low blood sugar warning signs",
      "When to test blood sugar if I feel unwell",
      "Diabetes and frequent urination — what to ask a doctor",
    ],
  },
  {
    keys: ["skin", "rash", "allerg"],
    prompts: [
      "When is a rash an emergency?",
      "Allergic reaction symptoms to watch for",
      "Hives with breathing difficulty — what to do?",
    ],
  },
];

function scorePrompt(prompt, query) {
  const p = prompt.toLowerCase();
  const words = query.split(/\s+/).filter((w) => w.length > 2);
  if (!words.length) return 1;
  return words.reduce((acc, w) => (p.includes(w) ? acc + 2 : acc), 0);
}

/**
 * @param {string} input - current text field value
 * @returns {string[]} up to 3 suggestions (empty when input too short)
 */
export function getMedicalQuestionSuggestions(input) {
  const query = (input || "").trim().toLowerCase();
  if (query.length < 2) {
    return [];
  }

  const pool = [];
  for (const rule of RULES) {
    if (rule.keys.some((k) => query.includes(k) || k.includes(query))) {
      pool.push(...rule.prompts);
    }
  }
  if (!pool.length) {
    pool.push(
      `What could cause ${input.trim()}?`,
      `When should I see a doctor for ${input.trim()}?`,
      `Is ${input.trim()} a common symptom of serious illness?`,
      `Home care tips for ${input.trim()} (when safe)?`
    );
  }

  const ranked = [...new Set(pool)]
    .map((p) => ({ p, s: scorePrompt(p, query) }))
    .sort((a, b) => b.s - a.s);

  const top = ranked.filter((r) => r.s > 0).slice(0, 3).map((r) => r.p);
  if (top.length >= 1) return top;
  return ranked.slice(0, 3).map((r) => r.p);
}
