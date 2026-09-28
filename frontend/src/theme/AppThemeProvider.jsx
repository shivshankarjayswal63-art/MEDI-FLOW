import React from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { brand } from "./brand";

const theme = createTheme({
  palette: {
    primary: { main: brand.primary },
    secondary: { main: brand.success },
  },
  typography: {
    fontFamily: '"Hanken Grotesk", "Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    h1: { fontSize: "clamp(1.75rem, 4vw, 3rem)", fontWeight: 700, lineHeight: 1.2 },
    h2: { fontSize: "clamp(1.5rem, 3.5vw, 2.5rem)", fontWeight: 700, lineHeight: 1.25 },
    h3: { fontSize: "clamp(1.35rem, 3vw, 2rem)", fontWeight: 700, lineHeight: 1.3 },
    h4: { fontSize: "clamp(1.2rem, 2.5vw, 1.75rem)", fontWeight: 600 },
    h5: { fontSize: "clamp(1.05rem, 2vw, 1.35rem)", fontWeight: 600 },
    h6: { fontSize: "clamp(1rem, 1.8vw, 1.15rem)", fontWeight: 600 },
    body1: { fontSize: "clamp(0.9375rem, 1.5vw, 1rem)" },
    body2: { fontSize: "clamp(0.8125rem, 1.4vw, 0.875rem)" },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          overflowX: "hidden",
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: "max(16px, env(safe-area-inset-left))",
          paddingRight: "max(16px, env(safe-area-inset-right))",
          maxWidth: "100%",
        },
      },
    },
    MuiGrid: {
      styleOverrides: {
        root: {
          minWidth: 0,
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          minWidth: 0,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          minWidth: 0,
        },
      },
    },
  },
});

export default function AppThemeProvider({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
