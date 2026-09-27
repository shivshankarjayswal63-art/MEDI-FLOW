import React from "react";
import { Box, Button, Typography } from "@mui/material";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("UI error:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <Box sx={{ p: 4, textAlign: "center", minHeight: "40vh" }}>
          <Typography variant="h6" gutterBottom>
            Something went wrong loading this page
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {this.state.error?.message || "Unknown error"}
          </Typography>
          <Button variant="contained" onClick={() => window.location.reload()}>
            Reload page
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}
