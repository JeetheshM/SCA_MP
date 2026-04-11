import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import AutoGraphRoundedIcon from "@mui/icons-material/AutoGraphRounded";
import BubbleChartRoundedIcon from "@mui/icons-material/BubbleChartRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import {
  alpha,
  AppBar,
  Box,
  Button,
  Chip,
  Container,
  Grid,
  Paper,
  Stack,
  Toolbar,
  Typography,
  useTheme,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import heroGraphic from "../assets/analytics-hero.svg";
import { landingQuickLinks } from "../utils/navigation";

const highlights = [
  {
    title: "RFM-Driven Profiling",
    description:
      "Recency, frequency, and monetary behavior are translated into clean, comparable customer signals.",
    icon: AutoGraphRoundedIcon,
  },
  {
    title: "K-Means Clustering",
    description:
      "Unsupervised learning groups customers into meaningful cohorts that support strategy and targeting.",
    icon: BubbleChartRoundedIcon,
  },
  {
    title: "Actionable Recommendations",
    description:
      "The interface connects model output to marketing, retention, and growth opportunities.",
    icon: InsightsRoundedIcon,
  },
];

const landingStats = [
  { value: "4", label: "Customer clusters surfaced" },
  { value: "0.68", label: "Silhouette score in mock results" },
  { value: "48", label: "Customer records in demo dataset" },
];

// Public-facing landing page introduces the project before the analytics shell takes over.
const Landing = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(20,184,166,0.16), transparent 24%), radial-gradient(circle at top right, rgba(37,99,235,0.16), transparent 20%), linear-gradient(180deg, #07111F 0%, #081321 60%, #EEF5FB 60%, #F8FBFF 100%)",
      }}
    >
      <AppBar
        position="static"
        elevation={0}
        sx={{ backgroundColor: "transparent", boxShadow: "none" }}
      >
        <Toolbar sx={{ px: { xs: 2, md: 4 } }}>
          <Stack
            direction="row"
            spacing={1.4}
            alignItems="center"
            sx={{ flexGrow: 1 }}
          >
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: "14px",
                display: "grid",
                placeItems: "center",
                background: "linear-gradient(135deg, #14B8A6, #2563EB)",
                color: "#fff",
              }}
            >
              <AutoGraphRoundedIcon />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ color: "#E7EEF8" }}>
                Customer Buying Pattern Analysis
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(231,238,248,0.68)" }}>
                Major Project Frontend
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.25}>
            <Button
              component={RouterLink}
              to="/about"
              sx={{ color: "#E7EEF8", display: { xs: "none", md: "inline-flex" } }}
            >
              About
            </Button>
            <Button component={RouterLink} to="/dashboard" variant="contained">
              Open Dashboard
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ pb: { xs: 6, md: 10 } }}>
        <Grid
          container
          spacing={4}
          alignItems="center"
          sx={{ pt: { xs: 4, md: 8 }, pb: { xs: 5, md: 8 } }}
        >
          <Grid item xs={12} md={6}>
            <Chip
              label="React + Material UI + Recharts"
              sx={{
                color: "#E7EEF8",
                backgroundColor: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(148, 163, 184, 0.14)",
              }}
            />

            <Typography
              variant="h1"
              sx={{
                mt: 2.5,
                color: "#F8FBFF",
                fontSize: { xs: "2.6rem", md: "4.1rem" },
                lineHeight: 1.04,
                maxWidth: 640,
              }}
            >
              Discover buying patterns with a modern ML analytics workspace.
            </Typography>

            <Typography
              variant="h6"
              sx={{
                mt: 2.5,
                color: "rgba(231,238,248,0.78)",
                fontWeight: 500,
                maxWidth: 640,
                lineHeight: 1.7,
              }}
            >
              This frontend presents RFM analysis, K-Means clustering, customer segmentation,
              and decision-ready insights in a clean dashboard experience built for your major
              project.
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 3.5 }}>
              <Button
                component={RouterLink}
                to="/dashboard"
                variant="contained"
                size="large"
                endIcon={<ArrowOutwardRoundedIcon />}
              >
                Explore Analytics
              </Button>
              <Button
                component={RouterLink}
                to="/upload"
                variant="outlined"
                size="large"
                startIcon={<CloudUploadRoundedIcon />}
                sx={{ color: "#E7EEF8", borderColor: "rgba(231,238,248,0.28)" }}
              >
                Upload Dataset
              </Button>
            </Stack>

            <Stack
              direction="row"
              spacing={1.25}
              flexWrap="wrap"
              useFlexGap
              sx={{ mt: 3.5 }}
            >
              {landingStats.map((stat) => (
                <Paper
                  key={stat.label}
                  sx={{
                    minWidth: 150,
                    px: 2,
                    py: 1.6,
                    borderRadius: 4,
                    color: "#F8FBFF",
                    backgroundColor: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(148, 163, 184, 0.14)",
                  }}
                >
                  <Typography variant="h5">{stat.value}</Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(231,238,248,0.68)", mt: 0.4 }}
                  >
                    {stat.label}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box
              component="img"
              src={heroGraphic}
              alt="Analytics dashboard illustration"
              className="float-card"
              sx={{
                width: "100%",
                maxWidth: 700,
                display: "block",
                mx: "auto",
                filter: "drop-shadow(0 34px 60px rgba(8,17,29,0.32))",
              }}
            />
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          {highlights.map((item) => {
            const Icon = item.icon;

            return (
              <Grid item xs={12} md={4} key={item.title}>
                <Paper
                  className="fade-up"
                  sx={{
                    p: 3,
                    height: "100%",
                    background:
                      theme.palette.mode === "light"
                        ? "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,251,255,0.98))"
                        : "linear-gradient(180deg, rgba(14,26,47,0.94), rgba(8,17,29,0.98))",
                  }}
                >
                  <Box
                    sx={{
                      width: 54,
                      height: 54,
                      borderRadius: "18px",
                      display: "grid",
                      placeItems: "center",
                      color: "primary.main",
                      backgroundColor: alpha(theme.palette.primary.main, 0.12),
                    }}
                  >
                    <Icon />
                  </Box>
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    {item.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1.1, lineHeight: 1.8 }}
                  >
                    {item.description}
                  </Typography>
                </Paper>
              </Grid>
            );
          })}
        </Grid>

        <Paper className="fade-up" sx={{ p: { xs: 2.5, md: 3.5 } }}>
          <Typography
            variant="overline"
            sx={{ color: "primary.main", fontWeight: 800, letterSpacing: 1.5 }}
          >
            QUICK NAVIGATION
          </Typography>
          <Typography variant="h4" sx={{ mt: 1 }}>
            Move from upload to insights without friction
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mt: 1.2, maxWidth: 720 }}
          >
            Each page is already wired like a real analytics tool, including dataset preview,
            clustering outputs, segment drill-down, and recommendation panels.
          </Typography>

          <Grid container spacing={2.2} sx={{ mt: 1 }}>
            {landingQuickLinks.slice(1).map((item) => {
              const Icon = item.icon;

              return (
                <Grid item xs={12} sm={6} md={4} key={item.path}>
                  <Paper
                    component={RouterLink}
                    to={item.path}
                    sx={{
                      p: 2.25,
                      height: "100%",
                      transition: "transform 180ms ease, box-shadow 180ms ease",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 22px 48px rgba(15, 23, 42, 0.12)",
                      },
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box
                        sx={{
                          width: 46,
                          height: 46,
                          borderRadius: "16px",
                          display: "grid",
                          placeItems: "center",
                          color: "secondary.main",
                          backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                        }}
                      >
                        <Icon />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                          {item.label}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.description}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default Landing;
