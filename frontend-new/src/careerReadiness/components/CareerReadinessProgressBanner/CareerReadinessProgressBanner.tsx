import React from "react";
import { Box, LinearProgress, Typography, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import MenuBookOutlined from "@mui/icons-material/MenuBookOutlined";
import type { ModuleSummary } from "src/careerReadiness/types";

const uniqueId = "f1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c";

export const DATA_TEST_ID = {
  PROGRESS_BANNER: `career-readiness-progress-banner-${uniqueId}`,
  PROGRESS_BAR: `career-readiness-progress-bar-${uniqueId}`,
  PROGRESS_COMPLETED: `career-readiness-progress-completed-${uniqueId}`,
  PROGRESS_REMAINING: `career-readiness-progress-remaining-${uniqueId}`,
};

interface CareerReadinessProgressBannerProps {
  modules: ModuleSummary[];
}

const CareerReadinessProgressBanner: React.FC<CareerReadinessProgressBannerProps> = ({ modules }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const total = modules.length;
  const completed = modules.filter((m) => m.status === "COMPLETED").length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <Box
      sx={{
        borderRadius: theme.rounding(theme.tabiyaRounding.sm),
        border: `1px solid ${theme.palette.primary.main}`,
        backgroundColor: `color-mix(in srgb, ${theme.palette.primary.main} 6%, white)`,
        padding: theme.fixedSpacing(theme.tabiyaSpacing.md),
        display: "flex",
        flexDirection: "column",
        gap: theme.fixedSpacing(theme.tabiyaSpacing.sm),
      }}
      data-testid={DATA_TEST_ID.PROGRESS_BANNER}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
          {t("careerReadiness.progressTitle")}
        </Typography>
        <Typography variant="body2" fontWeight="bold" color="primary.main">
          {percentage}%
        </Typography>
      </Box>

      <LinearProgress
        variant="determinate"
        aria-label="Career Readiness Progress"
        value={percentage}
        sx={{
          height: 20,
          borderRadius: 4,
          backgroundColor: theme.palette.grey[200],
          "& .MuiLinearProgress-bar": {
            borderRadius: 4,
            backgroundColor: theme.palette.primary.main,
          },
        }}
        data-testid={DATA_TEST_ID.PROGRESS_BAR}
      />

      <Box sx={{ display: "flex", gap: theme.fixedSpacing(theme.tabiyaSpacing.lg), flexWrap: "wrap" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }} data-testid={DATA_TEST_ID.PROGRESS_COMPLETED}>
          <CheckCircleOutlined sx={{ fontSize: 18, color: theme.palette.secondary.main }} />
          <Typography variant="body2" color="text.secondary">
            <Typography component="span" variant="body2" fontWeight="bold" color="text.primary">
              {completed}
            </Typography>{" "}
            {t("careerReadiness.progressCompleted")}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }} data-testid={DATA_TEST_ID.PROGRESS_REMAINING}>
          <MenuBookOutlined sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
          <Typography variant="body2" color="text.secondary">
            <Typography component="span" variant="body2" fontWeight="bold" color="text.primary">
              {total - completed}
            </Typography>{" "}
            {t("careerReadiness.progressRemaining")}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default CareerReadinessProgressBanner;
