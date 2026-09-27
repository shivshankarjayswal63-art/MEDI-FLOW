import React from "react";
import { Avatar } from "@mui/material";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import { brand } from "../../theme/brand";

/** Matches Home page “Smart Health / AI Diagnostics” shield icon */
export default function AssistantBrandIcon({ size = 28, sx = {} }) {
  const dim = typeof size === "number" ? size : 28;
  return (
    <Avatar
      sx={{
        width: dim,
        height: dim,
        bgcolor: `${brand.success}22`,
        color: brand.success,
        ...sx,
      }}
    >
      <HealthAndSafetyIcon sx={{ fontSize: dim * 0.55 }} />
    </Avatar>
  );
}
