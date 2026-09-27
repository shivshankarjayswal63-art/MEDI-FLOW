import React, { useEffect, useRef, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";
import { brand } from "../../theme/brand";
import { pageContainerSx, pageSubtitleSx, pageTitleSx } from "../../theme/responsive";
import { sendMedicalAssistantMessage } from "../../utils/medicalAssistantApi";

const STARTERS = [
  "I have chest pain and shortness of breath",
  "What are stroke warning signs?",
  "Difference between heartburn and heart attack?",
  "I feel nausea and stomach pain after meals",
];

const INITIAL_MESSAGES = [
  {
    role: "assistant",
    content:
      "Hi! I'm your MEDI FLOW medical assistant. Ask about symptoms, diseases, or when to seek care. I'll give educational guidance—not a diagnosis.",
  },
];

function toHistory(messages) {
  return messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({ role: m.role, content: m.content }));
}

export default function MedicalAssistantChat() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [urgent, setUrgent] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setError("");
    const userMsg = { role: "user", content: trimmed };
    const historyBefore = toHistory(messages);
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const data = await sendMedicalAssistantMessage(trimmed, historyBefore);
      const reply = data.reply || data.response || "Sorry, I could not generate a reply.";
      setUrgent(Boolean(data.urgent));
      setMessages((prev) => [...prev, { role: "assistant", content: reply, meta: data }]);
    } catch (err) {
      const isTimeout = err.name === "AbortError";
      const api = import.meta.env.VITE_API_URL || "(not set)";
      setError(
        isTimeout
          ? `Request timed out (API: ${api}). Try again or use a shorter question.`
          : `${err.message || "Could not reach the server."} (API: ${api})`
      );
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm having trouble connecting right now. You can still use Symptom AI for a structured check, or try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <Box sx={pageContainerSx}>
      <Typography sx={pageTitleSx} color={brand.primary}>
        Medical assistant
      </Typography>
      <Typography sx={pageSubtitleSx} color="text.secondary">
        Chat about symptoms and conditions—powered by screening logic and optional NVIDIA Nemotron on the server.
      </Typography>

      <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
        Educational screening only—not medical advice. Call emergency services if you have severe or sudden symptoms.
      </Alert>

      {urgent && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          Urgent screening flag — seek emergency care if symptoms are severe or worsening.
        </Alert>
      )}

      {error && (
        <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          display: "flex",
          flexDirection: "column",
          height: { xs: "calc(100dvh - 280px)", md: "min(65vh, 560px)" },
          minHeight: 320,
          overflow: "hidden",
          bgcolor: brand.lightBg,
        }}
      >
        <Box sx={{ flex: 1, overflowY: "auto", p: { xs: 1.5, sm: 2 } }}>
          {messages.map((msg, idx) => {
            const isUser = msg.role === "user";
            return (
              <Box
                key={idx}
                sx={{
                  display: "flex",
                  justifyContent: isUser ? "flex-end" : "flex-start",
                  mb: 1.5,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    maxWidth: "92%",
                    flexDirection: isUser ? "row-reverse" : "row",
                  }}
                >
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: isUser ? brand.primary : brand.success,
                      color: "#fff",
                      flexShrink: 0,
                    }}
                  >
                    {isUser ? <PersonIcon fontSize="small" /> : <SmartToyIcon fontSize="small" />}
                  </Box>
                  <Paper
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: isUser ? brand.primary : "#fff",
                      color: isUser ? "#fff" : "text.primary",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                    elevation={isUser ? 0 : 1}
                  >
                    <Typography variant="body2" sx={{ fontSize: { xs: "0.875rem", sm: "0.9375rem" } }}>
                      {msg.content}
                    </Typography>
                    {msg.meta?.source && !isUser && (
                      <Chip
                        size="small"
                        label={msg.meta.source === "nemotron" ? "AI enhanced" : "Screening engine"}
                        sx={{ mt: 1, fontSize: "0.65rem", height: 22 }}
                      />
                    )}
                  </Paper>
                </Box>
              </Box>
            );
          })}
          {loading && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, pl: 5 }}>
              <CircularProgress size={20} sx={{ color: brand.success }} />
              <Typography variant="body2" color="text.secondary">Thinking…</Typography>
            </Box>
          )}
          <div ref={bottomRef} />
        </Box>

        <Box sx={{ p: { xs: 1.5, sm: 2 }, bgcolor: "#fff", borderTop: "1px solid", borderColor: "divider" }}>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 1.5 }}>
            {STARTERS.map((s) => (
              <Chip
                key={s}
                label={s}
                size="small"
                onClick={() => sendMessage(s)}
                disabled={loading}
                sx={{ maxWidth: "100%", height: "auto", py: 0.5, "& .MuiChip-label": { whiteSpace: "normal" } }}
              />
            ))}
          </Box>
          <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              placeholder="Ask about symptoms or a condition…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              size="small"
            />
            <IconButton
              color="primary"
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              sx={{ bgcolor: brand.success, color: "#fff", "&:hover": { bgcolor: "#259a84" }, mb: 0.25 }}
            >
              <SendIcon />
            </IconButton>
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1.5 }}>
            <Button component={RouterLink} to="/symptom-analysis" size="small" variant="outlined">
              Symptom AI (detailed)
            </Button>
            <Button component={RouterLink} to="/Book-Appointment" size="small" variant="outlined">
              Book appointment
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
