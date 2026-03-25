import React from "react";
import { Box, Card, CardContent, Typography, LinearProgress, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import { TranslationKey } from "src/react-i18next";

const uniqueId = "module-progress-card-b7e3f4a5-8c9d-1e2f-3a4b-5c6d7e8f9a1b";

export const DATA_TEST_ID = {
  MODULE_PROGRESS_CARD: `module-progress-card-${uniqueId}`,
  MODULE_PROGRESS_TITLE: `module-progress-title-${uniqueId}`,
  MODULE_ITEM: (index: number) => `module-item-${index}-${uniqueId}`,
  MODULE_NAME: (index: number) => `module-name-${index}-${uniqueId}`,
  MODULE_PROGRESS: (index: number) => `module-progress-${index}-${uniqueId}`,
};

export interface ModuleData {
  id: string;
  labelKey: string;
  progress: number;
}

export interface ModuleProgressCardProps {
  modules: ModuleData[];
}

export const ModuleProgressCard: React.FC<ModuleProgressCardProps> = ({ modules }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const module = modules[0];
  const progress = module?.progress ?? 0;

  return (
    <Card
      sx={{ border: `1px solid ${theme.palette.divider}`, boxShadow: "none" }}
      data-testid={DATA_TEST_ID.MODULE_PROGRESS_CARD}
    >
      <CardContent
        sx={{
          padding: theme.fixedSpacing(theme.tabiyaSpacing.lg),
          "&:last-child": { paddingBottom: theme.fixedSpacing(theme.tabiyaSpacing.lg) },
          display: "flex",
          flexDirection: "column",
          gap: theme.fixedSpacing(theme.tabiyaSpacing.sm),
        }}
      >
        {/* Header row: title+description left, percentage right */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              color="text.primary"
              data-testid={DATA_TEST_ID.MODULE_PROGRESS_TITLE}
            >
              {t("home.profile.skillsInterestsProgressTitle")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("home.profile.skillsInterestsProgressDescription")}
            </Typography>
          </Box>
          <Typography variant="body2" fontWeight="bold" color="primary.main" sx={{ flexShrink: 0, ml: 1 }}>
            {progress}%
          </Typography>
        </Box>

        {/* Progress bar */}
        {module && (
          <LinearProgress
            variant="determinate"
            aria-label={t(module.labelKey as TranslationKey)}
            value={progress}
            data-testid={DATA_TEST_ID.MODULE_PROGRESS(0)}
            sx={{
              height: 8,
              borderRadius: theme.rounding(theme.tabiyaRounding.sm),
              backgroundColor: theme.palette.grey[200],
            }}
          />
        )}

        {/* Stats */}
        <Box sx={{ display: "flex", gap: theme.fixedSpacing(theme.tabiyaSpacing.lg), flexWrap: "wrap" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <CheckCircleOutlined sx={{ fontSize: 18, color: theme.palette.secondary.main }} />
            <Typography variant="body2" color="text.secondary">
              <Typography component="span" variant="body2" fontWeight="bold" color="text.primary">
                {progress}%
              </Typography>{" "}
              {t("home.profile.moduleCompleted")}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
