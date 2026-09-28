import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Avatar,
  CircularProgress,
  Chip,
  Tooltip,
  Paper,
  Fade,
  Alert,
  Snackbar
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import MicIcon from "@mui/icons-material/Mic";
import AssistantBrandIcon from "./AssistantBrandIcon";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import AssessmentIcon from "@mui/icons-material/Assessment";
import MinimizeIcon from "@mui/icons-material/Minimize";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import { useNavigate } from "react-router-dom";
import { sendMedicalAssistantMessage } from "../../utils/medicalAssistantApi";
import { isBookingMessage, isConsultationIntent, requiresPatientCareIntent } from "../../utils/bookingIntent";
import { loadLocalMedicalChat, saveLocalMedicalChat } from "../../utils/medicalAssistantChatStorage";
import { isAuthenticated, isPatientSession } from "../../utils/auth";
import { getUserFacingApiError } from "../../utils/apiErrors";

const HealthChatBot = ({ open, onClose }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! I'm your MEDI FLOW assistant. Ask about symptoms or say **book appointment**." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const messagesEndRef = useRef(null);

  // Suggested responses for quick access
  const suggestedResponses = [
    "Book appointment",
    "Request a consultation",
    "I have chest pain",
    "Feeling dizzy",
    "Summarize my health history",
  ];

  useEffect(() => {
    if (open) setHasUnread(false);
  }, [open]);

  useEffect(() => {
    const local = loadLocalMedicalChat();
    if (local?.messages?.length) {
      const mapped = local.messages.map((m) => ({
        sender: m.role === "user" ? "user" : "bot",
        text: m.fullContent || m.content,
        actions: m.actions,
      }));
      if (mapped.length) setMessages(mapped);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatChatError = (err) =>
    getUserFacingApiError(
      err,
      "The assistant could not respond right now. Please try again in a moment."
    );

  const submitMessage = async (rawText) => {
    const text = String(rawText || "").trim();
    if (!text) return;

    if (text === "Summarize my health history" && !isAuthenticated()) {
      setMessages((prev) => [
        ...prev,
        { sender: "user", text },
        {
          sender: "bot",
          text: "Sign in as a patient to summarize your vitals, reports, and visit history — or ask a general health question here.",
        },
      ]);
      return;
    }

    if (requiresPatientCareIntent(text)) {
      if (isAuthenticated() && isPatientSession()) {
        if (isBookingMessage(text)) {
          navigate("/medical-assistant", { state: { autoMessage: text } });
          if (onClose) onClose();
        } else if (isConsultationIntent(text)) {
          navigate("/request-consultation");
          if (onClose) onClose();
        }
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: "user", text },
          {
            sender: "bot",
            text:
              "To request a consultant, book an appointment, or speak with a doctor through MEDI FLOW, please **create a patient account** or **log in** first. Use the buttons below — then try again or open Request consultation from the menu.",
          },
        ]);
      }
      setInput("");
      return;
    }
    const userMessage = { sender: "user", text };
    const history = messages
      .filter((m) => !m.temp && (m.sender === "user" || m.sender === "bot"))
      .map((m) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text,
      }));

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Show typing indicator
    setMessages((prev) => [...prev, { sender: "bot", text: "Typing...", temp: true }]);

    try {
      const data = await sendMedicalAssistantMessage(text, history, {
        forceBooking: isBookingMessage(text),
      });

      // Remove typing placeholder
      setMessages((prev) => prev.filter((msg) => !msg.temp));

      const botReply = data.reply || data.response || "Sorry, I couldn't understand that.";
      
      if (data.primaryCondition) {
        localStorage.setItem("lastPrediction", botReply);
      }
      
      setMessages((prev) => {
        const base = prev.filter((m) => !m.temp);
        const next = [...base, { sender: "bot", text: botReply, actions: data.actions || [] }];
        saveLocalMedicalChat({
          messages: next.map((m) => ({
            role: m.sender === "user" ? "user" : "assistant",
            content: m.text,
            fullContent: m.text,
            actions: m.actions || [],
          })),
          bookingState: data.bookingState || null,
        });
        return next;
      });

      if (!open) setHasUnread(true);

      const urgent =
        data.urgent ||
        botReply.toLowerCase().includes("high risk") ||
        botReply.toLowerCase().includes("critical") ||
        botReply.toLowerCase().includes("elevated risk") ||
        botReply.toLowerCase().includes("emergency");

      if (urgent) {
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            { 
              sender: "bot", 
              text: "⚠️ This could be serious. Would you like me to help you?",
              options: [
                { text: "Contact doctor", icon: <LocalHospitalIcon fontSize="small" /> },
                { text: "View health trends", icon: <AssessmentIcon fontSize="small" /> }
              ]
            },
          ]);
          if (!open) setHasUnread(true);
        }, 1000);
      }
    } catch (err) {
      console.error("Error in chat:", err);
      const friendly = formatChatError(err);
      setMessages((prev) => [
        ...prev.filter((msg) => !msg.temp),
        { sender: "bot", text: friendly },
      ]);

      setNotification({
        open: true,
        message: friendly,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    const text = input.trim();
    setInput("");
    submitMessage(text);
  };

  const handleOptionClick = (option) => {
    setMessages((prev) => [...prev, { sender: "user", text: option }]);
    
    // Simulate response based on selected option
    setTimeout(() => {
      if (option === "Contact doctor") {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "I've sent a notification to our on-call doctor. They'll contact you shortly. Would you like to schedule an appointment now?" }
        ]);
      } else if (option === "View health trends") {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "Open Health trends in the patient menu to see your vitals chart, or use Medical assistant for symptom questions.",
          },
        ]);
      }
    }, 1000);
  };

  const handleVoiceInput = () => {
    setIsListening(!isListening);
    
    if (!isListening) {
      // Temporary simulation of voice recognition
      // In a real implementation, you would use the Web Speech API
      setNotification({
        open: true,
        message: "Listening for your voice input...",
        severity: "info",
      });
      
      setTimeout(() => {
        setInput("I have chest pain and shortness of breath");
        setIsListening(false);
        setNotification({
          open: true,
          message: "Voice input received!",
          severity: "success",
        });
      }, 2000);
    }
  };

  const handleSuggestedResponse = (response) => {
    setInput("");
    submitMessage(response);
  };

  const toggleMinimize = () => {
    setMinimized(!minimized);
  };

  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  
  const handleNotificationClose = () => {
    setNotification({ ...notification, open: false });
  };

  if (!open) return null;

  return (
    <>
      <Fade in={open}>
        <Paper
          elevation={6}
          sx={{
            position: "fixed",
            zIndex: 1300,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            transition: "all 0.3s ease",
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
            left: { xs: 8, sm: "auto" },
            right: { xs: 8, sm: 20 },
            bottom: {
              xs: "max(8px, env(safe-area-inset-bottom))",
              sm: 20,
            },
            width: {
              xs: "calc(100vw - 16px)",
              sm: expanded ? 400 : 320,
            },
            maxWidth: {
              xs: "calc(100vw - 16px)",
              sm: expanded ? 400 : 320,
            },
            height: minimized
              ? 60
              : {
                  xs: expanded ? "min(92dvh, 640px)" : "min(72dvh, 460px)",
                  sm: expanded ? 600 : 480,
                },
          }}
        >
          {/* Header */}
          <Box 
            display="flex" 
            justifyContent="space-between" 
            alignItems="center"
            sx={{
              p: 1.5,
              bgcolor: "#2b2c6c",
              color: "white",
              borderBottom: minimized ? "none" : "1px solid rgba(255,255,255,0.1)"
            }}
          >
            <Box display="flex" alignItems="center">
              <AssistantBrandIcon size={32} sx={{ mr: 1 }} />
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 500,
                  fontSize: { xs: "0.8rem", sm: "1rem" },
                  maxWidth: { xs: 140, sm: "none" },
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                MEDI FLOW Assistant
              </Typography>
            </Box>
            <Box display="flex">
              <IconButton 
                size="small" 
                onClick={toggleMinimize} 
                sx={{ color: "white", p: 0.5 }}
                aria-label={minimized ? "Expand chat" : "Minimize chat"}
              >
                <MinimizeIcon fontSize="small" />
              </IconButton>
              <IconButton 
                size="small" 
                onClick={toggleExpand} 
                sx={{ color: "white", p: 0.5 }}
                aria-label={expanded ? "Reduce chat size" : "Enlarge chat"}
              >
                <OpenInFullIcon fontSize="small" />
              </IconButton>
              <IconButton 
                size="small" 
                onClick={onClose} 
                sx={{ color: "white", p: 0.5 }}
                aria-label="Close chat"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {/* Messages Area - Only shown when not minimized */}
          {!minimized && (
            <>
              <Box 
                flex={1} 
                sx={{ 
                  overflowY: "auto", 
                  p: 2,
                  backgroundColor: "#fafafa",
                  backgroundImage: "radial-gradient(#e8e8e8 0.5px, transparent 0.5px), radial-gradient(#e8e8e8 0.5px, #fafafa 0.5px)",
                  backgroundSize: "20px 20px",
                  backgroundPosition: "0 0, 10px 10px"
                }}
              >
                {messages.map((msg, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: "flex",
                      justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
                      mb: 1.5,
                    }}
                  >
                    {msg.sender === "bot" && (
                      <Box sx={{ mr: 1, mt: 0.5 }}>
                        <AssistantBrandIcon size={28} />
                      </Box>
                    )}
                    
                    <Box
                      sx={{
                        maxWidth: "75%",
                        display: "flex",
                        flexDirection: "column"
                      }}
                    >
                      <Box
                        sx={{
                          p: 1.5,
                          bgcolor: msg.sender === "user" ? "#2b2c6c" : "white",
                          color: msg.sender === "user" ? "white" : "#333",
                          borderRadius: msg.sender === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                          maxWidth: "100%",
                          fontStyle: msg.temp ? "italic" : "normal",
                          opacity: msg.temp ? 0.6 : 1,
                          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                          fontSize: "14px"
                        }}
                      >
                        <Typography variant="body2" sx={{ fontSize: "13px", lineHeight: 1.5 }}>
                          {msg.text}
                        </Typography>
                      </Box>
                      
                      {/* Option buttons for bot messages */}
                      {msg.options && (
                        <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                          {msg.options.map((option, idx) => (
                            <Button
                              key={idx}
                              variant="outlined"
                              size="small"
                              startIcon={option.icon}
                              onClick={() => handleOptionClick(option.text)}
                              sx={{
                                borderRadius: "16px",
                                borderColor: "#2fb297",
                                color: "#2fb297",
                                fontSize: "11px",
                                py: 0.5,
                                "&:hover": {
                                  borderColor: "#2b2c6c",
                                  backgroundColor: "rgba(43, 44, 108, 0.04)"
                                }
                              }}
                            >
                              {option.text}
                            </Button>
                          ))}
                        </Box>
                      )}
                    </Box>
                    
                    {msg.sender === "user" && (
                      <Avatar 
                        sx={{ 
                          bgcolor: "#e6317d",
                          width: 28, 
                          height: 28,
                          ml: 1,
                          mt: 0.5
                        }}
                      >
                        <Typography variant="caption" sx={{ fontSize: 12 }}>U</Typography>
                      </Avatar>
                    )}
                  </Box>
                ))}
                <div ref={messagesEndRef} />
              </Box>

              {/* Suggested Responses */}
              <Box sx={{ px: 2, py: 1, bgcolor: "white", borderTop: "1px solid #f0f0f0" }}>
                <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
                  {suggestedResponses.map((response, idx) => (
                    <Chip
                      key={idx}
                      label={response}
                      size="small"
                      onClick={() => handleSuggestedResponse(response)}
                      sx={{
                        fontSize: "11px",
                        height: "24px",
                        bgcolor: "#f0f0f5",
                        color: "#2b2c6c",
                        "&:hover": {
                          bgcolor: "#e6e6f0",
                        }
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Input Area */}
              <Box 
                sx={{ 
                  p: 1.5, 
                  bgcolor: "white",
                  borderTop: "1px solid #f0f0f0"
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1
                  }}
                >
                  <Tooltip title="Voice input">
                    <IconButton 
                      size="small"
                      color={isListening ? "error" : "default"}
                      onClick={handleVoiceInput}
                      sx={{ 
                        p: 0.75,
                        bgcolor: isListening ? "rgba(230, 49, 125, 0.1)" : "transparent" 
                      }}
                      aria-label="Use voice input"
                    >
                      <MicIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                  
                  <TextField
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your symptoms..."
                    fullWidth
                    variant="outlined"
                    size="small"
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    disabled={loading}
                    aria-label="Chat message input"
                    InputProps={{
                      sx: {
                        borderRadius: "20px",
                        fontSize: "13px",
                        "&.MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: "#e0e0e0"
                          },
                          "&:hover fieldset": {
                            borderColor: "#c0c0c0"
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#2fb297"
                          }
                        }
                      }
                    }}
                  />
                  
                  <Button
                    variant="contained"
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                    aria-label="Send message"
                    sx={{ 
                      minWidth: "unset", 
                      borderRadius: "50%", 
                      p: 1,
                      width: "32px",
                      height: "32px",
                      bgcolor: "#2fb297",
                      "&:hover": {
                        bgcolor: "#269d85"
                      },
                      "&.Mui-disabled": {
                        bgcolor: "#a0a0a0"
                      }
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={16} sx={{ color: "white" }} />
                    ) : (
                      <SendIcon sx={{ fontSize: 16 }} />
                    )}
                  </Button>
                </Box>
                
                <Typography 
                  variant="caption" 
                  align="center" 
                  sx={{ 
                    display: "block", 
                    mt: 1, 
                    color: "#828487",
                    fontSize: "9px"
                  }}
                >
                  For informational purposes only. Consult a healthcare professional for medical advice.
                </Typography>
              </Box>
            </>
          )}
        </Paper>
      </Fade>
      
      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleNotificationClose}
          severity={notification.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default HealthChatBot;