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
import { useNavigate, useLocation } from "react-router-dom";
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
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  EmailOutlined,
  LockOutlined,
} from "@mui/icons-material";

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
        color: "#2b2c6c",
        iconColor: "#2fb297",
        customClass: {
          popup: "swal2-rounded",
        },
      });

      setTimeout(() => {
        if (returnTo && isPatientRole(role)) {
          navigate(returnTo);
        } else {
          navigate(routeForRole(role));
        }
      }, 800);
    } catch (error) {
      const msg = getUserFacingApiError(
        error,
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

  return (
    <Box sx={{ height: "100vh", display: "flex", alignItems: "center" }}>
      <Container maxWidth="lg">
        <Grid container spacing={2} alignItems="center" justifyContent="center">
          {/* Logo Section */}
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              display: { xs: "none", md: "flex" },
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <img src="/Logo.png" alt="Logo" className="h-[200px] w-auto" />
          </Grid>

          {/* Login Form Section */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={6}
              sx={{
                padding: 4,
                borderRadius: 3,
                maxWidth: 400,
                margin: "0 auto",
              }}
            >
              <Typography
                component="h1"
                variant="h4"
                sx={{
                  fontWeight: 700,
                  marginBottom: 1,
                  textAlign: "center",
                  color: "#1976d2",
                }}
              >
                Welcome
              </Typography>
              <Typography
                component="h2"
                variant="h5"
                sx={{
                  fontWeight: 500,
                  marginBottom: 3,
                  textAlign: "center",
                  color: "#1976d2",
                }}
              >
                MEDI FLOW
              </Typography>

              {error && (
                <Typography
                  color="error"
                  sx={{
                    width: "100%",
                    textAlign: "center",
                    marginBottom: 2,
                  }}
                >
                  {error}
                </Typography>
              )}

              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ width: "100%" }}
              >
                <TextField
                  fullWidth
                  margin="normal"
                  label="Email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  onInput={handleChange}
                  placeholder="patient1@demo.com"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlined color="action" />
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
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
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
                  sx={{
                    mt: 3,
                    mb: 2,
                    backgroundColor: "#1976d2",
                    "&:hover": {
                      backgroundColor: "#1565c0",
                    },
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : "Sign In"}
                </Button>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <Button
                    color="primary"
                    onClick={() => navigate("/forgot-password")}
                    sx={{ textTransform: "none" }}
                  >
                    Forgot Password?
                  </Button>
                  <Button
                    color="primary"
                    onClick={() => navigate("/registration")}
                    sx={{ textTransform: "none" }}
                  >
                    Create Account
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default Login;
