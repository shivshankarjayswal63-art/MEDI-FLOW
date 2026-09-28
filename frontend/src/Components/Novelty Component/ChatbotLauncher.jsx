import React, { useState, useEffect } from "react";
import { Fab, Tooltip } from "@mui/material";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import { brand } from "../../theme/brand";

const ChatbotLauncher = ({ onOpen }) => {
  const [showHint, setShowHint] = useState(false);
  const [pulseAnimation, setPulseAnimation] = useState(false);

  useEffect(() => {
    const hintTimer = setTimeout(() => {
      setShowHint(true);
      setTimeout(() => setShowHint(false), 5000);
    }, 30000);

    const pulseInterval = setInterval(() => {
      setPulseAnimation(true);
      setTimeout(() => setPulseAnimation(false), 3000);
    }, 120000);

    return () => {
      clearTimeout(hintTimer);
      clearInterval(pulseInterval);
    };
  }, []);

  return (
    <div className="fixed z-50 flex flex-col items-end safe-fixed-bottom safe-fixed-right max-w-[calc(100vw-1rem)]">
      {showHint && (
        <div className="bg-white text-[#2b2c6c] p-3 rounded-lg shadow-lg mb-2 max-w-[220px] text-sm border border-[#2fb29733]">
          Smart Health assistant — ask about symptoms or book care
        </div>
      )}

      <Tooltip title="MEDI FLOW Smart Health Assistant" placement="left">
        <Fab
          onClick={onOpen}
          aria-label="Open MEDI FLOW health assistant"
          sx={{
            bgcolor: brand.success,
            color: "#fff",
            boxShadow: pulseAnimation ? 6 : 3,
            transform: pulseAnimation ? "scale(1.08)" : "scale(1)",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            "&:hover": { bgcolor: "#269d85" },
          }}
        >
          <HealthAndSafetyIcon fontSize="medium" />
        </Fab>
      </Tooltip>
    </div>
  );
};

export default ChatbotLauncher;
