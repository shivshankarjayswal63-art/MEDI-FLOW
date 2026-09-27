import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import TipsAndUpdatesOutlinedIcon from "@mui/icons-material/TipsAndUpdatesOutlined";
import { brand } from "../../theme/brand";
import { pageContainerSx } from "../../theme/responsive";
import { sendMedicalAssistantMessage } from "../../utils/medicalAssistantApi";
import { getMedicalQuestionSuggestions } from "../../utils/medicalChatSuggestions";

const INITIAL_MESSAGES = [
  {
    role: "assistant",
    content:
      "Hello! I answer **health and medical questions only** — symptoms, conditions, and when to get care. What would you like to know?",
  },
];

function toHistory(messages) {
  return messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({ role: m.role, content: m.content }));
}

function renderMessageText(text, isUser) {
  const parts = String(text).split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <Box component="span" key={i} sx={{ fontWeight: 700 }}>
          {part.slice(2, -2)}
        </Box>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default function MedicalAssistantChat() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [urgent, setUrgent] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  const suggestions = useMemo(() => getMedicalQuestionSuggestions(input), [input]);
  const showSuggestions = !loading;

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
      setError(
        isTimeout
          ? "Request timed out. Try a shorter question or tap a suggested question below."
          : err.message || "Could not reach the server."
      );
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Connection issue — please try again. You can also use **Symptom AI** for a structured check from the menu.",
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
    <Box
      sx={{
        ...pageContainerSx,
        display: "flex",
        flexDirection: "column",
        minHeight: { xs: "calc(100dvh - 120px)", md: "calc(100dvh - 140px)" },
        maxWidth: 960,
        mx: "auto",
        width: "100%",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          borderRadius: { xs: 2, md: 3 },
          overflow: "hidden",
          border: `1px solid ${alpha(brand.primary, 0.12)}`,
          boxShadow: `0 12px 40px ${alpha(brand.primary, 0.08)}`,
          minHeight: 0,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: { xs: 2, sm: 2.5 },
            py: { xs: 1.5, sm: 2 },
            background: `linear-gradient(135deg, ${brand.primary} 0%, #3d3f9e 55%, ${brand.success} 120%)`,
            color: "#fff",
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                bgcolor: alpha("#fff", 0.15),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LocalHospitalIcon />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: "1.05rem", sm: "1.2rem" }, lineHeight: 1.2 }}>
                Medical assistant
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.92, fontSize: { xs: "0.75rem", sm: "0.85rem" } }}>
                Health questions only · Educational guidance
              </Typography>
            </Box>
          </Stack>
          <Chip
            size="small"
            label={isMobile ? "Not medical advice" : "Educational only — not a diagnosis. Call emergency services if severe symptoms."}
            sx={{
              mt: 1.5,
              bgcolor: alpha("#fff", 0.18),
              color: "#fff",
              fontSize: "0.7rem",
              height: "auto",
              py: 0.25,
              "& .MuiChip-label": { whiteSpace: "normal", px: 1 },
            }}
          />
        </Box>

        {urgent && (
          <Alert severity="error" sx={{ borderRadius: 0, py: 0.5 }}>
            Urgent screening — seek emergency care if symptoms are severe or worsening.
          </Alert>
        )}

        {error && (
          <Alert severity="warning" sx={{ borderRadius: 0, py: 0.5 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {/* Messages */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            px: { xs: 1.25, sm: 2 },
            py: { xs: 1.5, sm: 2 },
            bgcolor: alpha(brand.lightBg, 0.65),
            backgroundImage: `radial-gradient(${alpha(brand.success, 0.06)} 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        >
          {messages.map((msg, idx) => {
            const isUser = msg.role === "user";
            return (
              <Box
                key={idx}
                sx={{
                  display: "flex",
                  justifyContent: isUser ? "flex-end" : "flex-start",
                  mb: 1.75,
                }}
              >
                <Stack
                  direction={isUser ? "row-reverse" : "row"}
                  spacing={1}
                  alignItems="flex-end"
                  sx={{ maxWidth: { xs: "96%", sm: "88%" } }}
                >
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: isUser ? brand.primary : brand.success,
                      color: "#fff",
                      boxShadow: `0 4px 12px ${alpha(isUser ? brand.primary : brand.success, 0.35)}`,
                    }}
                  >
                    {isUser ? <PersonOutlineIcon fontSize="small" /> : <SmartToyOutlinedIcon fontSize="small" />}
                  </Box>
                  <Paper
                    elevation={0}
                    sx={{
                      px: 1.75,
                      py: 1.25,
                      borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                      bgcolor: isUser ? brand.primary : "#fff",
                      color: isUser ? "#fff" : "text.primary",
                      border: isUser ? "none" : `1px solid ${alpha(brand.primary, 0.08)}`,
                      boxShadow: isUser ? `0 6px 16px ${alpha(brand.primary, 0.25)}` : `0 4px 14px ${alpha("#000", 0.06)}`,
                    }}
                  >
                    <Typography
                      variant="body2"
                      component="div"
                      sx={{
                        fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                        lineHeight: 1.55,
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {renderMessageText(msg.content, isUser)}
                    </Typography>
                    {msg.meta?.source && !isUser && (
                      <Chip
                        size="small"
                        label={msg.meta.source === "nemotron" ? "AI · medical mode" : "Screening engine"}
                        sx={{
                          mt: 1,
                          height: 22,
                          fontSize: "0.65rem",
                          bgcolor: alpha(brand.success, 0.12),
                          color: brand.success,
                        }}
                      />
                    )}
                  </Paper>
                </Stack>
              </Box>
            );
          })}
          {loading && (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ pl: 5, py: 0.5 }}>
              <CircularProgress size={18} sx={{ color: brand.success }} />
              <Typography variant="body2" color="text.secondary">Analyzing your question…</Typography>
            </Stack>
          )}
          <div ref={bottomRef} />
        </Box>

        {/* Composer */}
        <Box
          sx={{
            borderTop: `1px solid ${alpha(brand.primary, 0.1)}`,
            bgcolor: "#fff",
            px: { xs: 1.25, sm: 2 },
            py: { xs: 1.25, sm: 1.5 },
          }}
        >
          {showSuggestions && (
            <Box sx={{ mb: 1.25 }}>
              <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.75 }}>
                <TipsAndUpdatesOutlinedIcon sx={{ fontSize: 18, color: brand.accent }} />
                <Typography variant="caption" sx={{ fontWeight: 600, color: brand.gray, letterSpacing: 0.3 }}>
                  {input.trim() ? "Suggested follow-up questions" : "Try asking"}
                </Typography>
              </Stack>
              <Box
                sx={{
                  display: "flex",
                  gap: 0.75,
                  flexWrap: "wrap",
                  maxHeight: { xs: 120, sm: 96 },
                  overflowY: "auto",
                }}
              >
                {suggestions.map((s) => (
                  <Chip
                    key={s}
                    label={s}
                    onClick={() => sendMessage(s)}
                    disabled={loading}
                    variant="outlined"
                    sx={{
                      height: "auto",
                      py: 0.6,
                      borderColor: alpha(brand.primary, 0.2),
                      bgcolor: alpha(brand.lightBg, 0.8),
                      "&:hover": { bgcolor: alpha(brand.success, 0.1), borderColor: brand.success },
                      "& .MuiChip-label": {
                        whiteSpace: "normal",
                        textAlign: "left",
                        fontSize: { xs: "0.72rem", sm: "0.8rem" },
                        px: 1,
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          <Stack direction="row" spacing={1} alignItems="flex-end">
            <TextField
              fullWidth
              multiline
              maxRows={isMobile ? 3 : 4}
              placeholder="Type a health question (symptoms, conditions, when to see a doctor)…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2.5,
                  bgcolor: alpha(brand.lightBg, 0.5),
                },
              }}
            />
            <IconButton
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              sx={{
                width: 44,
                height: 44,
                flexShrink: 0,
                bgcolor: brand.success,
                color: "#fff",
                "&:hover": { bgcolor: "#259a84" },
                "&.Mui-disabled": { bgcolor: alpha(brand.gray, 0.3), color: "#fff" },
              }}
            >
              <SendIcon fontSize="small" />
            </IconButton>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 1.25 }}>
            <Button
              component={RouterLink}
              to="/symptom-analysis"
              size="small"
              variant="outlined"
              fullWidth={isMobile}
              sx={{ borderColor: alpha(brand.primary, 0.35), color: brand.primary, borderRadius: 2 }}
            >
              Symptom AI (checklist)
            </Button>
            <Button
              component={RouterLink}
              to="/Book-Appointment"
              size="small"
              variant="contained"
              fullWidth={isMobile}
              sx={{ bgcolor: brand.primary, borderRadius: 2, "&:hover": { bgcolor: "#1f2058" } }}
            >
              Book appointment
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
