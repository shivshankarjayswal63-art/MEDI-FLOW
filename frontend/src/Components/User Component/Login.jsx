import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  routeForRole,
  resolveLoginRole,
  isDoctorRole,
  isMainPortalRole,
  isPatientRole,
} from "../../utils/authRoutes";
import { setAuthSession, isAuthenticated, getStoredRole, getDashboardPath } from "../../utils/auth";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { apiUrl } from "../../utils/apiBase";
import { getUserFacingApiError } from "../../utils/apiErrors";
import Swal from "sweetalert2";
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Container,
  Grid,
  Paper,
  IconButton,
  InputAdornment,
  Chip,
  Alert,
  alpha,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  EmailOutlined,
  LockOutlined,
  ArrowForward,
  HealthAndSafety,
  AutoAwesome,
  Shield,
} from "@mui/icons-material";
import { brand } from "../../theme/brand";

const featureItems = [
  { icon: <HealthAndSafety fontSize="small" />, text: "AI-assisted symptom guidance" },
  { icon: <AutoAwesome fontSize="small" />, text: "Book appointments in minutes" },
  { icon: <Shield fontSize="small" />, text: "Secure patient records" },
];

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state?.returnTo;

  useEffect(() => {
    if (!isAuthenticated()) return;
    const role = getStoredRole();
    if (!role) return;
    if (isDoctorRole(role)) {
      navigate("/login-doctor", { replace: true });
      return;
    }
    if (returnTo && isPatientRole(role)) {
      navigate(returnTo, { replace: true });
      return;
    }
    navigate(getDashboardPath(role), { replace: true });
  }, [navigate, returnTo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const readCredentials = (formEl) => {
    const emailInput = formEl?.elements?.namedItem?.("email");
    const passInput = formEl?.elements?.namedItem?.("password");
    const email = String(emailInput?.value ?? formData.email ?? "").trim();
    const password = String(passInput?.value ?? formData.password ?? "").trim();
    return { email, password };
  };

  const validateCredentials = ({ email, password }) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setError("Email is required");
      return false;
    }
    if (!emailRegex.test(email)) {
      setError("Invalid email format");
      return false;
    }
    if (!password) {
      setError("Password is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const credentials = readCredentials(e.currentTarget);
    setFormData(credentials);
    if (!validateCredentials(credentials)) return;

    setLoading(true);
    try {
      const response = await axios.post(apiUrl("/api/auth/login"), credentials);
      const role = resolveLoginRole(
        credentials.email,
        response.data.role,
        response.data.user?.role
      );
      if (isDoctorRole(role)) {
        setError("This account is a doctor profile. Use Doctor Login (/login-doctor).");
        return;
      }
      if (!isMainPortalRole(role)) {
        setError("This account cannot use the patient/staff login. Try Doctor Login.");
        return;
      }
      setAuthSession({
        token: response.data.token,
        role,
        userId: response.data.user?._id || response.data.user?.id,
        email: credentials.email,
      });

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "✅ Login Successful",
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
        background: "#f0f4ff",
        color: brand.primary,
        iconColor: brand.success,
        customClass: {
          popup: "swal2-rounded",
        },
      });

      setTimeout(() => {
        if (returnTo && isPatientRole(role)) {
          navigate(returnTo, { replace: true });
        } else {
          navigate(routeForRole(role), { replace: true });
        }
      }, 800);
    } catch (err) {
      const msg = getUserFacingApiError(
        err,
        "Sign-in failed. Please check your email and password and try again."
      );
      Swal.fire({
        icon: "error",
        title: "Sign-in unsuccessful",
        text: msg,
      });
    } finally {
      setLoading(false);
    }
  };

  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 2.5,
      bgcolor: "#f8f9ff",
      "&:hover fieldset": { borderColor: brand.success },
      "&.Mui-focused fieldset": { borderColor: brand.primary },
    },
  };

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        background: `linear-gradient(135deg, #f8f9ff 0%, #eef8ff 45%, ${alpha(brand.accent, 0.06)} 100%)`,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: -120,
          right: -80,
          width: 360,
          height: 360,
          borderRadius: "50%",
          bgcolor: alpha(brand.accent, 0.12),
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: -100,
          left: -60,
          width: 320,
          height: 320,
          borderRadius: "50%",
          bgcolor: alpha(brand.success, 0.15),
          filter: "blur(50px)",
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 }, position: "relative", zIndex: 1 }}>
        <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ display: { xs: "none", md: "block" }, pr: { md: 4 } }}>
              <Chip
                label="NEXT-GEN HEALTHCARE"
                size="small"
                sx={{
                  mb: 2,
                  fontWeight: 700,
                  bgcolor: alpha(brand.accent, 0.1),
                  color: brand.accent,
                }}
              />
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  color: brand.primary,
                  lineHeight: 1.15,
                  mb: 2,
                  fontSize: { md: "2.5rem", lg: "3rem" },
                }}
              >
                Welcome back to{" "}
                <Box component="span" sx={{ color: brand.accent }}>
                  MEDI FLOW
                </Box>
              </Typography>
              <Typography sx={{ color: brand.gray, mb: 4, maxWidth: 420, lineHeight: 1.7 }}>
                Sign in to manage appointments, view results, and chat with our AI health assistant — all in one
                place.
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {featureItems.map((item) => (
                  <Box
                    key={item.text}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: "rgba(255,255,255,0.75)",
                      boxShadow: "0 4px 24px rgba(43,44,108,0.06)",
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: alpha(brand.success, 0.15),
                        color: brand.success,
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Typography variant="body2" sx={{ color: brand.primary, fontWeight: 500 }}>
                      {item.text}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
            <Box sx={{ display: { xs: "flex", md: "none" }, justifyContent: "center", mb: 1 }}>
              <img src="/Logo2.png" alt="MEDI FLOW" style={{ height: 56 }} />
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.25, sm: 3, md: 4 },
                borderRadius: 4,
                width: "100%",
                maxWidth: 440,
                mx: "auto",
                border: `1px solid ${alpha(brand.primary, 0.08)}`,
                boxShadow: "0 24px 64px rgba(43, 44, 108, 0.12)",
                bgcolor: "#fff",
              }}
            >
              <Box sx={{ textAlign: "center", mb: 3 }}>
                <Box sx={{ display: { xs: "none", sm: "block" }, mb: 2 }}>
                  <img src="/Logo2.png" alt="" style={{ height: 48 }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: brand.primary }}>
                  Patient & staff sign in
                </Typography>
                <Typography variant="body2" sx={{ color: brand.gray, mt: 0.5 }}>
                  Use your MEDI FLOW account credentials
                </Typography>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} noValidate>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Email address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  onInput={handleChange}
                  placeholder="patient1@demo.com"
                  sx={fieldSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlined sx={{ color: brand.gray }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  onInput={handleChange}
                  placeholder="Enter your password"
                  sx={fieldSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined sx={{ color: brand.gray }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  endIcon={!loading && <ArrowForward />}
                  sx={{
                    mt: 3,
                    py: 1.5,
                    borderRadius: 999,
                    fontSize: "1rem",
                    fontWeight: 600,
                    textTransform: "none",
                    background: `linear-gradient(90deg, ${brand.primary} 0%, #4e4fa3 100%)`,
                    boxShadow: "0 8px 24px rgba(43, 44, 108, 0.25)",
                    "&:hover": {
                      background: `linear-gradient(90deg, #23245a 0%, ${brand.primary} 100%)`,
                      boxShadow: "0 12px 28px rgba(43, 44, 108, 0.3)",
                    },
                  }}
                >
                  {loading ? <CircularProgress size={26} sx={{ color: "#fff" }} /> : "Sign in"}
                </Button>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 1,
                    mt: 2,
                  }}
                >
                  <Button
                    component={Link}
                    to="/forgot-password"
                    sx={{ textTransform: "none", color: brand.primary, fontWeight: 500 }}
                  >
                    Forgot password?
                  </Button>
                  <Button
                    component={Link}
                    to="/registration"
                    sx={{ textTransform: "none", color: brand.accent, fontWeight: 600 }}
                  >
                    Create account
                  </Button>
                </Box>
              </Box>

              <Typography
                variant="caption"
                sx={{ display: "block", textAlign: "center", mt: 3, color: brand.gray }}
              >
                Are you a doctor?{" "}
                <Box
                  component={Link}
                  to="/login-doctor"
                  sx={{ color: brand.success, fontWeight: 700, textDecoration: "none" }}
                >
                  Doctor login
                </Box>
              </Typography>

              <Button
                component={Link}
                to="/"
                fullWidth
                sx={{ mt: 2, textTransform: "none", color: brand.gray }}
              >
                ← Back to home
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default Login;
