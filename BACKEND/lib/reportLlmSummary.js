const NVIDIA_BASE = "https://integrate.api.nvidia.com/v1/chat/completions";
const DEFAULT_MODEL = "nvidia/nemotron-3-ultra-550b-a55b";

async function callNemotronShort(system, user, maxTokens = 600) {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) return null;

  const model = process.env.NVIDIA_NEMOTRON_MODEL || DEFAULT_MODEL;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(NVIDIA_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.4,
        max_tokens: maxTokens,
        stream: false,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    return content ? String(content).trim() : null;
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

/**
 * Patient-friendly lab report summary (educational, not a diagnosis).
 */
async function summarizeReportWithAI({ fileName, patientNotes, extractedSnippet, ruleSummary }) {
  const fallback = ruleSummary || `Report **${fileName || "uploaded"}** saved to your record.`;
  const snippet = String(extractedSnippet || "").slice(0, 2500);
  const notes = String(patientNotes || "").slice(0, 500);

  const system = `You are MEDI FLOW lab report assistant. Summarize uploaded reports in plain English for patients.
Rules: under 180 words; bullet key findings if text allows; mention when values look outside typical ranges only as "ask your doctor";
never diagnose; no disclaimers about being an AI; if text is empty, summarize from filename and patient notes only.`;

  const user = `File: ${fileName || "report"}
Patient notes: ${notes || "(none)"}
Extracted PDF text (may be partial): ${snippet || "(none)"}
Baseline summary: ${fallback}

Write a clear **Report summary** for the patient.`;

  const llm = await callNemotronShort(system, user);
  return llm || fallback;
}

async function polishHealthSummaryReply(builtReply, patientContext) {
  const system = `You are MEDI FLOW. Rewrite the patient health record summary to be clear and friendly.
Keep all factual data; use short sections with **bold** labels; under 220 words; no legal disclaimers.`;
  const user = `Record JSON (reference only):\n${JSON.stringify(patientContext || {}).slice(0, 3500)}\n\nDraft:\n${builtReply}`;
  const llm = await callNemotronShort(system, user, 700);
  return llm || builtReply;
}

module.exports = { summarizeReportWithAI, polishHealthSummaryReply };
