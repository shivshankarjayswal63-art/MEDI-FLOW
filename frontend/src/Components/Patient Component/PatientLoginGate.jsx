import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, Typography, Button, Paper } from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { brand } from "../../theme/brand";
import { pageTitleSx, pageContainerSx } from "../../theme/responsive";

/**
 * Shown when a patient-only action requires sign-in (consultation, booking, etc.).
 */
export default function PatientLoginGate({
  title = "Sign in to continue",
  message = "Create a free patient account or log in to request a consultation, book appointments, and use your health records with MEDI FLOW.",
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = `${location.pathname}${location.search}`;

  return (
    <Box sx={pageContainerSx}>
      <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, border: "1px solid #e8e8ef", textAlign: "center" }}>
        <Typography variant="h4" sx={{ ...pageTitleSx, color: brand.primary, mb: 2 }}>
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 480, mx: "auto" }}>
          {message}
        </Typography>
        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, justifyContent: "center" }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<LoginIcon />}
            onClick={() => navigate("/login", { state: { returnTo } })}
            sx={{ bgcolor: brand.primary, px: 4 }}
          >
            Log in
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<PersonAddIcon />}
            onClick={() => navigate("/registration", { state: { returnTo } })}
            sx={{ borderColor: brand.success, color: brand.success, px: 4 }}
          >
            Create account
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
