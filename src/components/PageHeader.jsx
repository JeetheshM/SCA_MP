import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { alpha, Box, Button, Chip, Paper, Stack, Typography, useTheme } from "@mui/material";

// Reusable hero-like section header for every page.
const PageHeader = ({ eyebrow, title, subtitle, chipLabel, actionLabel, onActionClick }) => {
  const theme = useTheme();

  return (
    <Paper
      className="fade-up"
      sx={{
        p: { xs: 2.5, md: 3.5 },
        mb: 3,
        overflow: "hidden",
        position: "relative",
        background:
          theme.palette.mode === "light"
            ? `linear-gradient(135deg, ${alpha("#0F766E", 0.12)}, ${alpha("#2563EB", 0.08)})`
            : `linear-gradient(135deg, ${alpha("#0F766E", 0.18)}, ${alpha("#2563EB", 0.12)})`,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          width: 220,
          height: 220,
          borderRadius: "50%",
          right: -48,
          top: -72,
          backgroundColor: alpha(theme.palette.primary.main, 0.12),
        }}
      />

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2.5}
        alignItems={{ xs: "flex-start", md: "center" }}
        justifyContent="space-between"
        sx={{ position: "relative", zIndex: 1 }}
      >
        <Box>
          <Typography
            variant="overline"
            sx={{ color: "primary.main", fontWeight: 800, letterSpacing: 1.5 }}
          >
            {eyebrow}
          </Typography>
          <Typography variant="h4" sx={{ mt: 0.8, mb: 1.1 }}>
            {title}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 760 }}>
            {subtitle}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap>
          {chipLabel ? (
            <Chip
              label={chipLabel}
              sx={{
                backgroundColor: alpha(theme.palette.primary.main, 0.14),
                color: "text.primary",
              }}
            />
          ) : null}

          {actionLabel ? (
            <Button
              variant="contained"
              endIcon={<ArrowForwardRoundedIcon />}
              onClick={onActionClick}
            >
              {actionLabel}
            </Button>
          ) : null}
        </Stack>
      </Stack>
    </Paper>
  );
};

export default PageHeader;
