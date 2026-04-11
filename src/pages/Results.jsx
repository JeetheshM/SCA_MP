import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import HubRoundedIcon from "@mui/icons-material/HubRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import SpeedRoundedIcon from "@mui/icons-material/SpeedRounded";
import {
  alpha,
  Box,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChartCard from "../components/ChartCard";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";
import PageHeader from "../components/PageHeader";
import useApiData from "../hooks/useApiData";
import { getAnalysisResults } from "../services/api";
import { formatCurrency } from "../utils/formatters";

const emptyResults = {
  totalClusters: 0,
  optimalK: 0,
  silhouetteScore: 0,
  clusterDistribution: [],
  scatterData: [],
  elbowMethod: [],
  clusterProfiles: [],
  modelMeta: {
    selectedAlgorithm: "unknown",
    bestSilhouetteScore: 0,
    candidateScores: [],
  },
};

// Analysis page explains how the clustering model behaved and how the clusters look.
const Results = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [clusterBy, setClusterBy] = useState("default");
  const [clusterCount, setClusterCount] = useState(4);

  const fetchAnalysisResults = useCallback(
    () => getAnalysisResults({ clusterBy, clusterCount }),
    [clusterBy, clusterCount]
  );

  const { data, loading, error, reload } = useApiData(fetchAnalysisResults, emptyResults, [fetchAnalysisResults]);

  if (loading) {
    return (
      <LoadingState
        title="Loading analysis results..."
        description="Fetching cluster distribution, elbow scores, and RFM scatter points."
      />
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={reload} />;
  }

  const noClusterData = !Array.isArray(data.clusterDistribution) || data.clusterDistribution.length === 0;
  const clusterSeries = noClusterData
    ? []
    : data.clusterDistribution.map((cluster) => ({
        ...cluster,
        points: data.scatterData.filter((point) => point.cluster === cluster.cluster),
      }));

  if (!loading && noClusterData) {
    return (
      <Box>
        <PageHeader
          eyebrow="Model Diagnostics"
          title="No analysis results available"
          subtitle="Upload a dataset first or refresh after customer segmentation completes."
          chipLabel="Awaiting data"
          actionLabel="Upload Data"
          onActionClick={() => navigate("/upload")}
        />
        <Paper sx={{ p: 4, mt: 3 }}>
          <Typography variant="h6">No clustering results found</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            The analysis results page requires a successfully uploaded customer dataset. If you have already uploaded data, refresh the page or re-open the upload screen to ensure the dataset was stored.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        eyebrow="Model Diagnostics"
        title="Validate clustering quality and segment separation"
        subtitle="Review the number of clusters, compare the elbow curve, and inspect how customers are distributed across the RFM space."
        chipLabel={`Silhouette Score: ${data.silhouetteScore}`}
        actionLabel="Explore Customer Segments"
        onActionClick={() => navigate("/segments")}
      />

      <Paper sx={{ p: 2.4, mb: 3 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel id="customer-cluster-by-label">Cluster By</InputLabel>
            <Select
              labelId="customer-cluster-by-label"
              label="Cluster By"
              value={clusterBy}
              onChange={(event) => setClusterBy(event.target.value)}
            >
              <MenuItem value="default">Default (Recency + Frequency + Monetary)</MenuItem>
              <MenuItem value="recency_frequency">Recency + Frequency</MenuItem>
              <MenuItem value="recency_monetary">Recency + Monetary</MenuItem>
              <MenuItem value="frequency_monetary">Frequency + Monetary</MenuItem>
              <MenuItem value="recency">Recency only</MenuItem>
              <MenuItem value="frequency">Frequency only</MenuItem>
              <MenuItem value="monetary">Monetary only</MenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            label="Cluster Count"
            type="number"
            value={clusterCount}
            onChange={(event) => setClusterCount(Number(event.target.value))}
            inputProps={{ min: 2, max: 12 }}
            sx={{ width: 160 }}
          />

          <Chip label={`Active clusterBy: ${clusterBy}`} variant="outlined" />
          <Chip label={`Active clusterCount: ${clusterCount}`} variant="outlined" />
        </Stack>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 2.4,
              background:
                "linear-gradient(135deg, rgba(15,118,110,0.12), rgba(37,99,235,0.10), rgba(249,115,22,0.08))",
            }}
          >
            <Typography variant="subtitle2" color="text.secondary">
              Trained Model Summary
            </Typography>
            <Typography variant="h6" sx={{ mt: 0.6 }}>
              {`Selected algorithm: ${String(data.modelMeta?.selectedAlgorithm || "unknown").toUpperCase()}`}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.6 }}>
              {`Best silhouette score: ${Number(data.modelMeta?.bestSilhouetteScore || 0).toFixed(2)}`}
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 1.5 }}>
              <Chip label={`Cluster by: ${clusterBy}`} variant="outlined" />
              <Chip label={`Cluster count: ${clusterCount}`} variant="outlined" />
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 1.5 }}>
              <Chip label={`Cluster by: ${clusterBy}`} variant="outlined" />
              <Chip label={`Cluster count: ${clusterCount}`} variant="outlined" />
            </Stack>

            {Array.isArray(data.modelMeta?.candidateScores) && data.modelMeta.candidateScores.length > 0 ? (
              <Stack direction="row" spacing={1.5} sx={{ mt: 1.5, flexWrap: "wrap" }} useFlexGap>
                {data.modelMeta.candidateScores.map((candidate) => (
                  <Chip
                    key={candidate.algorithm}
                    label={`${candidate.algorithm.toUpperCase()} ${Number(candidate.silhouetteScore || 0).toFixed(2)}`}
                    variant="outlined"
                  />
                ))}
              </Stack>
            ) : null}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2.5, height: "100%" }}>
            <Stack direction="row" spacing={1.4} alignItems="center">
              <HubRoundedIcon color="primary" />
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Number of Clusters
                </Typography>
                <Typography variant="h4">{data.totalClusters}</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2.5, height: "100%" }}>
            <Stack direction="row" spacing={1.4} alignItems="center">
              <AutoAwesomeRoundedIcon color="secondary" />
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Optimal K
                </Typography>
                <Typography variant="h4">{data.optimalK}</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2.5, height: "100%" }}>
            <Stack direction="row" spacing={1.4} alignItems="center">
              <SpeedRoundedIcon color="success" />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Silhouette Score
                </Typography>
                <Typography variant="h4">{data.silhouetteScore}</Typography>
              </Box>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={data.silhouetteScore * 100}
              sx={{ mt: 2, height: 10, borderRadius: 999 }}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <ChartCard
            title="Cluster Distribution"
            subtitle="Customer counts inside each K-Means output cluster."
            height={320}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.clusterDistribution}
                  dataKey="customers"
                  nameKey="label"
                  outerRadius={110}
                  innerRadius={60}
                  paddingAngle={4}
                >
                  {data.clusterDistribution.map((entry) => (
                    <Cell key={entry.cluster} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 14,
                  }}
                />
                <Legend verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        <Grid item xs={12} lg={8}>
          <ChartCard
            title="RFM Scatter Plot"
            subtitle="Recency vs frequency, with bubble size representing monetary value."
            height={320}
          >
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis
                  type="number"
                  dataKey="recency"
                  name="Recency"
                  tick={{ fill: theme.palette.text.secondary }}
                />
                <YAxis
                  type="number"
                  dataKey="frequency"
                  name="Frequency"
                  tick={{ fill: theme.palette.text.secondary }}
                />
                <ZAxis type="number" dataKey="monetary" range={[80, 420]} name="Monetary" />
                <Tooltip
                  cursor={{ strokeDasharray: "4 4" }}
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 14,
                  }}
                  formatter={(value, name) =>
                    name === "Monetary" ? [formatCurrency(value), name] : [value, name]
                  }
                />
                <Legend />
                {clusterSeries.map((cluster) => (
                  <Scatter
                    key={cluster.cluster}
                    name={cluster.label}
                    data={cluster.points}
                    fill={cluster.fill}
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        <Grid item xs={12} lg={6}>
          <ChartCard
            title="Elbow Method"
            subtitle="Within-cluster sum of squares across different K values."
            height={290}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.elbowMethod}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis dataKey="k" tick={{ fill: theme.palette.text.secondary }} />
                <YAxis tick={{ fill: theme.palette.text.secondary }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 14,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="inertia"
                  stroke={theme.palette.secondary.main}
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 2.5, height: "100%" }}>
            <Stack direction="row" spacing={1.3} alignItems="center">
              <InsightsRoundedIcon color="secondary" />
              <Box>
                <Typography variant="h6">Cluster Profiles</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.6 }}>
                  Average RFM values help interpret each segment in business language.
                </Typography>
              </Box>
            </Stack>

            <Stack spacing={1.5} sx={{ mt: 2.4 }}>
              {data.clusterProfiles.map((profile) => (
                <Box
                  key={profile.cluster}
                  sx={{
                    p: 2,
                    borderRadius: 3.5,
                    backgroundColor: alpha(profile.fill, 0.08),
                    border: "1px solid",
                    borderColor: alpha(profile.fill, 0.22),
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    {profile.cluster} - {profile.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.8 }}>
                    Avg Recency: {profile.avgRecency} days - Avg Frequency: {profile.avgFrequency} - Avg Monetary: {formatCurrency(profile.avgMonetary)}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Results;

