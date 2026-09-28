import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { isChunkLoadError } from "../utils/lazyWithRetry";

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
    if (isChunkLoadError(error) && !sessionStorage.getItem("mf_chunk_reload_once")) {
      sessionStorage.setItem("mf_chunk_reload_once", "1");
      window.location.reload();
    }
  }

  handleReload = () => {
    sessionStorage.removeItem("mf_chunk_reload_once");
    window.location.reload();
  };

  render() {
    if (this.state.error) {
      const chunk = isChunkLoadError(this.state.error);
      return (
        <Box sx={{ p: 4, textAlign: "center", minHeight: "40vh" }}>
          <Typography variant="h6" gutterBottom>
            Something went wrong loading this page
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 480, mx: "auto" }}>
            {chunk
              ? "The app was updated. Please reload to load the latest version."
              : this.state.error?.message || "Unknown error"}
          </Typography>
          <Button variant="contained" onClick={this.handleReload}>
            Reload page
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}
