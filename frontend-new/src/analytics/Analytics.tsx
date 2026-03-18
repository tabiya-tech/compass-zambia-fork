import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  LinearProgress,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import AnalyticsService, { CareerReadinessStats, SkillGapStats } from "./AnalyticsService";

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

const StatBox: React.FC<{ label: string; value: string | number; sub?: string }> = ({ label, value, sub }) => (
  <Box sx={{ textAlign: "center", flex: 1, minWidth: 120 }}>
    <Typography variant="h4" fontWeight="bold">
      {value}
    </Typography>
    <Typography variant="caption" color="textSecondary" display="block">
      {label}
    </Typography>
    {sub && (
      <Typography variant="caption" color="textSecondary" display="block">
        {sub}
      </Typography>
    )}
  </Box>
);

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

const Analytics: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [crStats, setCrStats] = useState<CareerReadinessStats | null>(null);
  const [sgStats, setSgStats] = useState<SkillGapStats | null>(null);

  useEffect(() => {
    const service = AnalyticsService.getInstance();

    Promise.all([service.getCareerReadinessStats(), service.getSkillGapStats(10)])
      .then(([cr, sg]) => {
        setCrStats(cr);
        setSgStats(sg);
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Failed to load analytics");
      })
      .finally(() => setLoading(false));
  }, []);

  const maxGapCount = sgStats?.top_skill_gaps[0]?.students_with_gap_count ?? 1;

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Analytics
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Career Readiness */}
        {crStats && (
          <Card sx={{ mb: 3, borderRadius: theme.tabiyaRounding.sm }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Career Readiness
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {crStats.total_registered_students.toLocaleString()} registered students
              </Typography>

              <Stack direction="row" spacing={2} sx={{ my: 3 }} flexWrap="wrap" useFlexGap>
                <StatBox
                  label="Started"
                  value={crStats.started.count.toLocaleString()}
                  sub={`${crStats.started.percentage}% of registered`}
                />
                <StatBox
                  label="Completed All"
                  value={crStats.completed_all_modules.count.toLocaleString()}
                  sub={`${crStats.completed_all_modules.percentage_of_started}% of started`}
                />
                <StatBox
                  label="Avg Modules Done"
                  value={`${crStats.avg_modules_completed} / ${crStats.total_modules}`}
                />
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom>
                Sub-module Breakdown
              </Typography>
              <Stack spacing={1.5}>
                {crStats.module_breakdown.map((mod) => {
                  const startedPct =
                    crStats.total_registered_students > 0
                      ? (mod.started_count / crStats.total_registered_students) * 100
                      : 0;
                  const completedPct =
                    crStats.total_registered_students > 0
                      ? (mod.completed_count / crStats.total_registered_students) * 100
                      : 0;
                  return (
                    <Box key={mod.module_id}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="body2">{mod.module_title}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {mod.completed_count.toLocaleString()} / {mod.started_count.toLocaleString()}
                        </Typography>
                      </Stack>
                      <Box sx={{ position: "relative", height: 10, borderRadius: 5, bgcolor: "grey.200" }}>
                        <Box
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            height: "100%",
                            width: `${startedPct}%`,
                            bgcolor: "primary.light",
                            borderRadius: 5,
                          }}
                        />
                        <Box
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            height: "100%",
                            width: `${completedPct}%`,
                            bgcolor: "success.main",
                            borderRadius: 5,
                          }}
                        />
                      </Box>
                    </Box>
                  );
                })}
              </Stack>

              <Stack direction="row" spacing={2} sx={{ mt: 1.5 }}>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Box sx={{ width: 12, height: 12, borderRadius: 1, bgcolor: "success.main" }} />
                  <Typography variant="caption">Completed</Typography>
                </Stack>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Box sx={{ width: 12, height: 12, borderRadius: 1, bgcolor: "primary.light" }} />
                  <Typography variant="caption">Started</Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Skill Gaps */}
        {sgStats && (
          <Card sx={{ borderRadius: theme.tabiyaRounding.sm }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Skill Gaps
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {sgStats.total_students_with_skill_gaps.toLocaleString()} students with skill gap data
              </Typography>

              {sgStats.top_skill_gaps.length === 0 ? (
                <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                  No skill gap data available.
                </Typography>
              ) : (
                <Stack spacing={1.5} sx={{ mt: 2 }}>
                  {sgStats.top_skill_gaps.map((gap) => (
                    <Box key={gap.skill_id}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="body2">{gap.skill_label}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {gap.students_with_gap_count} students · +{gap.avg_job_unlock_count} jobs avg
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={(gap.students_with_gap_count / maxGapCount) * 100}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        )}
      </Box>
    </Container>
  );
};

export default Analytics;
