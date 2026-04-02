import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
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

