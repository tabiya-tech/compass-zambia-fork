import React from "react";
import { Box, Paper, Typography, useTheme } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";

export interface DailyAdoptionTrendChartProps {
  labels?: string[];
  newRegistrations?: number[];
  dailyActiveUsers?: number[];
}

const defaultLabels = ["Mar 6", "Mar 7", "Mar 8", "Mar 9", "Mar 10", "Mar 11", "Mar 12"];
const defaultNewRegistrations = [420, 510, 660, 520, 640, 530, 390];
const defaultDailyActiveUsers = [860, 910, 940, 920, 960, 980, 870];

const DailyAdoptionTrendChart: React.FC<DailyAdoptionTrendChartProps> = ({
  labels = defaultLabels,
  newRegistrations = defaultNewRegistrations,
  dailyActiveUsers = defaultDailyActiveUsers,
}) => {
  const theme = useTheme();

  return (
    <Paper
      sx={{
        borderRadius: theme.tabiyaRounding.sm,
        padding: theme.fixedSpacing(theme.tabiyaSpacing.md),
        boxShadow: "none",
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 700,
          color: theme.palette.text.secondary,
          marginBottom: theme.fixedSpacing(theme.tabiyaSpacing.sm),
        }}
      >
        Daily Adoption Trend
      </Typography>

      <Box sx={{ width: "100%", height: "100%" }}>
        <BarChart
          height={280}
          xAxis={[
            {
              scaleType: "band",
              data: labels,
              barGapRatio: 0.5,
              categoryGapRatio: 0.5,
            },
          ]}
          series={[
            {
              data: newRegistrations,
              label: "New Registrations",
              color: theme.palette.primary.main,
            },
            {
              data: dailyActiveUsers,
              label: "Daily Active Users",
              color: theme.palette.secondary.main,
            },
          ]}
          grid={{ horizontal: true }}
          slotProps={{
            legend: {
              direction: "horizontal",
              position: { vertical: "bottom", horizontal: "start" },
            },
          }}
        />
      </Box>
    </Paper>
  );
};

export default DailyAdoptionTrendChart;
