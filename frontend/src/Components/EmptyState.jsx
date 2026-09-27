import { Box, Typography, Button } from "@mui/material";
import { brand } from "../theme/brand";

export default function EmptyState({ title, message, actionLabel, onAction }) {
  return (
    <Box
      sx={{
        textAlign: "center",
        py: 6,
        px: 2,
        borderRadius: 3,
        bgcolor: "white",
        border: "1px dashed",
        borderColor: "divider",
      }}
    >
      <Typography variant="h6" sx={{ color: brand.primary, mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {message}
      </Typography>
      {actionLabel && onAction && (
        <Button variant="contained" onClick={onAction} sx={{ bgcolor: brand.success }}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
