import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import HubRoundedIcon from "@mui/icons-material/HubRounded";
import {
  alpha,
  Avatar,
  Box,
  Chip,
  Grid,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useDeferredValue, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../components/DataTable";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";
import PageHeader from "../components/PageHeader";
import useApiData from "../hooks/useApiData";
import { getClusteringOutput } from "../services/api";
import { formatCurrency, getInitials, getSegmentColor } from "../utils/formatters";

const emptySegments = {
  segments: [],
  customers: [],
  modelMeta: {
    selectedAlgorithm: "unknown",
    bestSilhouetteScore: 0,
  },
};

// Segments page turns clustering output into a filterable customer roster.
const Segments = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { data, loading, error, reload } = useApiData(getClusteringOutput, emptySegments);
  const [selectedSegment, setSelectedSegment] = useState("All");
  const [searchValue, setSearchValue] = useState("");
  const deferredSearch = useDeferredValue(searchValue);

  if (loading) {
    return (
      <LoadingState
        title="Loading customer segments..."
        description="Preparing cohort summaries and customer-level tables."
      />
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={reload} />;
  }

  const filteredRows = data.customers.filter((customer) => {
    const matchesSegment = selectedSegment === "All" || customer.segment === selectedSegment;
    const haystack = `${customer.id} ${customer.customerName} ${customer.city}`.toLowerCase();
    const matchesSearch = haystack.includes(deferredSearch.trim().toLowerCase());

    return matchesSegment && matchesSearch;
  });

  const clusterStats = Object.values(
    data.customers.reduce((acc, customer) => {
      const clusterKey = customer.cluster || "Unassigned";

      if (!acc[clusterKey]) {
        acc[clusterKey] = {
          cluster: clusterKey,
          customers: 0,
          highRisk: 0,
          totalMonetary: 0,
        };
      }

      acc[clusterKey].customers += 1;
      acc[clusterKey].totalMonetary += Number(customer.monetary || 0);
      if (customer.churnRisk === "High") {
        acc[clusterKey].highRisk += 1;
      }

      return acc;
    }, {})
  )
    .sort((left, right) => right.customers - left.customers)
    .slice(0, 8);

  const maxClusterCount = Math.max(...clusterStats.map((item) => item.customers), 1);

  const clusterColor = (clusterName) => {
    const index = Math.max(Number(String(clusterName).replace(/[^0-9]/g, "")) - 1, 0);
    const colors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.warning.main,
    ];
    return colors[index % colors.length];
  };

  const columns = [
    {
      id: "customerName",
      label: "Customer",
      minWidth: 220,
      render: (value, row) => (
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Avatar sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.16), color: "secondary.main" }}>
            {getInitials(value)}
          </Avatar>
          <Box>
            <Typography variant="subtitle2">{value}</Typography>
            <Typography variant="caption" color="text.secondary">
              {row.id} - {row.city}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    {
      id: "segment",
      label: "Segment",
      render: (value) => (
        <Chip
          label={value}
          size="small"
          sx={{
            color: getSegmentColor(value),
            backgroundColor: alpha(getSegmentColor(value), 0.12),
          }}
        />
      ),
    },
    { id: "cluster", label: "Cluster" },
    { id: "recency", label: "Recency (days)" },
    { id: "frequency", label: "Frequency" },
    {
      id: "monetary",
      label: "Monetary",
      render: (value) => formatCurrency(value),
    },
    {
      id: "churnRisk",
      label: "Risk",
      render: (value) => (
        <Chip
          label={value}
          size="small"
          color={value === "High" ? "warning" : value === "Medium" ? "secondary" : "success"}
          variant="outlined"
        />
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        eyebrow="Cohort Explorer"
        title="Explore customer segments with filters and drill-down"
        subtitle="Compare high-value, loyal, at-risk, and low-value customers with searchable, color-coded segmentation tables."
        chipLabel={`${filteredRows.length} customers visible`}
        actionLabel="See Insights"
        onActionClick={() => navigate("/insights")}
      />

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 2.3,
              background:
                "linear-gradient(135deg, rgba(15,118,110,0.12), rgba(37,99,235,0.10), rgba(249,115,22,0.08))",
            }}
          >
            <Typography variant="subtitle2" color="text.secondary">
              Trained Model Summary
            </Typography>
            <Typography variant="body1" sx={{ mt: 0.6, fontWeight: 700 }}>
              {`Selected algorithm: ${String(data.modelMeta?.selectedAlgorithm || "unknown").toUpperCase()}`}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.4 }}>
              {`Best silhouette score: ${Number(data.modelMeta?.bestSilhouetteScore || 0).toFixed(2)}`}
            </Typography>
          </Paper>
        </Grid>

        {data.segments.map((segment) => (
          <Grid item xs={12} sm={6} lg={3} key={segment.segment}>
            <Paper
              sx={{
                p: 2.4,
                height: "100%",
                backgroundColor: alpha(getSegmentColor(segment.segment), 0.08),
                borderColor: alpha(getSegmentColor(segment.segment), 0.18),
              }}
            >
              <Typography variant="subtitle2" color="text.secondary">
                {segment.segment}
              </Typography>
              <Typography variant="h4" sx={{ mt: 1 }}>
                {segment.value}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.9 }}>
                Customers assigned to this segment after clustering.
              </Typography>
            </Paper>
          </Grid>
        ))}

        {clusterStats.length > 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 2.4 }}>
              <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 1.6 }}>
                <HubRoundedIcon color="primary" />
                <Box>
                  <Typography variant="h6">Cluster Snapshot</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Live cluster distribution, high-risk concentration, and monetary contribution.
                  </Typography>
                </Box>
              </Stack>

              <Grid container spacing={1.5}>
                {clusterStats.map((item) => {
                  const tone = clusterColor(item.cluster);
                  const ratio = (item.customers / maxClusterCount) * 100;

                  return (
                    <Grid item xs={12} md={6} lg={3} key={item.cluster}>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 1.8,
                          borderRadius: 3,
                          borderColor: alpha(tone, 0.35),
                          backgroundColor: alpha(tone, 0.08),
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                            {item.cluster}
                          </Typography>
                          <Chip
                            label={`${item.customers} customers`}
                            size="small"
                            sx={{
                              bgcolor: alpha(tone, 0.16),
                              color: tone,
                              fontWeight: 700,
                            }}
                          />
                        </Stack>

                        <Box
                          sx={{
                            mt: 1.2,
                            height: 8,
                            borderRadius: 999,
                            backgroundColor: alpha(tone, 0.18),
                            overflow: "hidden",
                          }}
                        >
                          <Box
                            sx={{
                              width: `${ratio}%`,
                              height: "100%",
                              borderRadius: 999,
                              background: `linear-gradient(90deg, ${alpha(tone, 0.95)}, ${alpha(tone, 0.55)})`,
                            }}
                          />
                        </Box>

                        <Stack direction="row" justifyContent="space-between" sx={{ mt: 1.3 }}>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              High Risk
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {item.highRisk}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: "right" }}>
                            <Typography variant="caption" color="text.secondary">
                              Monetary
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {formatCurrency(item.totalMonetary)}
                            </Typography>
                          </Box>
                        </Stack>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </Paper>
          </Grid>
        ) : null}

        <Grid item xs={12}>
          <Paper sx={{ p: 2.3, mb: 0 }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1.5}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", md: "center" }}
            >
              <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ flexGrow: 1 }}>
                <TextField
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="Search by customer name, ID, or city"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRoundedIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  select
                  label="Segment"
                  value={selectedSegment}
                  onChange={(event) => setSelectedSegment(event.target.value)}
                  sx={{ minWidth: { xs: "100%", md: 240 } }}
                >
                  <MenuItem value="All">All Segments</MenuItem>
                  {data.segments.map((segment) => (
                    <MenuItem key={segment.segment} value={segment.segment}>
                      {segment.segment}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>

              <Typography variant="body2" color="text.secondary">
                Filtered result count: {filteredRows.length}
              </Typography>
            </Stack>
          </Paper>
          <DataTable columns={columns} rows={filteredRows} defaultOrderBy="monetary" />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Segments;

