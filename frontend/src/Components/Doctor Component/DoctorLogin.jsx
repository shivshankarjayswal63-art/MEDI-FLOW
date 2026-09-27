import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  inferRoleFromEmail,
  isStaffRole,
  routeForRole,
  ROLES,
} from "../../utils/authRoutes";
import {
  setAuthSession,
  isAuthenticated,
  getStoredRole,
  getDashboardPath,
} from "../../utils/auth";
import { apiUrl } from "../../utils/apiBase";
import { getUserFacingApiError } from "../../utils/apiErrors";
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


function DoctorLogin() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) return;
    const role = getStoredRole();
    if (!role) return;
    if (role === ROLES.DOCTOR) {
      navigate("/Doctor-Dashboard", { replace: true });
      return;
    }
    navigate(getDashboardPath(role), { replace: true });
  }, [navigate]);

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      setError("Email is required");
      return false;
    }
    if (!emailRegex.test(formData.email)) {
      setError("Invalid email format");
      return false;
    }
    if (!formData.password) {
      setError("Password is required");
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const normalizedEmail = String(formData.email).toLowerCase().trim();
    const emailRole = inferRoleFromEmail(normalizedEmail);
    if (isStaffRole(emailRole)) {
      setError("Staff accounts must sign in at /login (not Doctor Login).");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(apiUrl("/api/auth/login-doctor"), {
        ...formData,
        email: normalizedEmail,
      });

      const { token, doctor, role: apiRole } = response.data;
      const role = apiRole || ROLES.DOCTOR;
      if (role !== ROLES.DOCTOR) {
        setError("This account is not a doctor profile. Use the main login at /login.");
        return;
      }

      setAuthSession({
        token,
        role,
        userId: doctor?._id || doctor?.id,
        email: normalizedEmail,
        doctorProfile: doctor,
      });

      navigate(routeForRole(role));
    } catch (error) {
      setError(
        getUserFacingApiError(error, "Sign-in failed. Check your email and password.")
      );
      console.error("Login error:", error);
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
                    value={formData.email}
                    onChange={handleChange}
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
                    value={formData.password}
                    onChange={handleChange}
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
                      onClick={() => navigate("/register-doctor")}
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

export default DoctorLogin;
