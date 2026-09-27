const { getSupabase, useSupabase } = require("../config/supabase");

const MAX_STORED_MESSAGES = 80;

function tableMissing(error) {
  const msg = String(error?.message || error || "").toLowerCase();
  return msg.includes("does not exist") || msg.includes("schema cache");
}

async function loadChatSession(userId) {
  if (!userId || !useSupabase()) return { messages: [], bookingState: null };

  const supabase = getSupabase();

  const { data: thread, error: threadErr } = await supabase
    .from("medical_assistant_threads")
    .select("booking_state")
    .eq("user_id", userId)
    .maybeSingle();

  if (threadErr && tableMissing(threadErr)) {
    return { messages: [], bookingState: null, storageReady: false };
  }

  const { data: rows, error: msgErr } = await supabase
    .from("medical_assistant_messages")
    .select("role, content, meta, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(MAX_STORED_MESSAGES);

  if (msgErr && tableMissing(msgErr)) {
    return { messages: [], bookingState: null, storageReady: false };
  }

  const messages = (rows || []).map((r) => ({
    role: r.role,
    content: r.content,
    meta: r.meta || {},
    actions: r.meta?.actions || [],
  }));

  return {
    messages,
    bookingState: thread?.booking_state || null,
    storageReady: true,
  };
}

async function appendChatMessages(userId, userMessage, assistantPayload) {
  if (!userId || !useSupabase()) return;

  const supabase = getSupabase();
  const assistantContent = assistantPayload.reply || assistantPayload.response || "";
  const assistantMeta = {
    source: assistantPayload.source,
    urgent: assistantPayload.urgent,
    actions: assistantPayload.actions || [],
  };

  const inserts = [
    { user_id: userId, role: "user", content: userMessage, meta: {} },
    { user_id: userId, role: "assistant", content: assistantContent, meta: assistantMeta },
  ];

  const { error: insErr } = await supabase.from("medical_assistant_messages").insert(inserts);
  if (insErr) {
    if (!tableMissing(insErr)) console.warn("medical_assistant_messages insert:", insErr.message);
    return;
  }

  const { count } = await supabase
    .from("medical_assistant_messages")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (count && count > MAX_STORED_MESSAGES + 10) {
    const { data: old } = await supabase
      .from("medical_assistant_messages")
      .select("id")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(count - MAX_STORED_MESSAGES);
    const ids = (old || []).map((r) => r.id);
    if (ids.length) await supabase.from("medical_assistant_messages").delete().in("id", ids);
  }

  await supabase.from("medical_assistant_threads").upsert({
    user_id: userId,
    booking_state: assistantPayload.bookingState ?? null,
    updated_at: new Date().toISOString(),
  });
}

async function clearChatSession(userId) {
  if (!userId || !useSupabase()) return;
  const supabase = getSupabase();
  await supabase.from("medical_assistant_messages").delete().eq("user_id", userId);
  await supabase.from("medical_assistant_threads").delete().eq("user_id", userId);
}

module.exports = {
  loadChatSession,
  appendChatMessages,
  clearChatSession,
  MAX_STORED_MESSAGES,
};
