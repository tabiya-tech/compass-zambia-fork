import React from "react";
import { Box, Card, CardContent, Typography, LinearProgress, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
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

/**
 * ModuleProgressCard displays learning module progress with progress bars.
 * Uses module constants from modulesService.ts with translations.
 *
 * @param modules - Array of module data with IDs, translation keys, and progress percentages
 */
export const ModuleProgressCard: React.FC<ModuleProgressCardProps> = ({ modules }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Card
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: "none",
      }}
      data-testid={DATA_TEST_ID.MODULE_PROGRESS_CARD}
    >
      <CardContent
        sx={{
          padding: theme.spacing(theme.tabiyaSpacing.lg),
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
          }}
          data-testid={DATA_TEST_ID.MODULE_PROGRESS_TITLE}
        >
          {t("home.profile.skillsInterestsProgressTitle")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ marginBottom: theme.spacing(theme.tabiyaSpacing.md) }}>
          {t("home.profile.skillsInterestsProgressDescription")}
        </Typography>

        {modules.map((module, index) => (
          <Box
            key={module.id}
            sx={{ marginBottom: theme.spacing(theme.tabiyaSpacing.md) }}
            data-testid={DATA_TEST_ID.MODULE_ITEM(index)}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: theme.spacing(theme.tabiyaSpacing.xs),
              }}
            >
              <Typography variant="body2" data-testid={DATA_TEST_ID.MODULE_NAME(index)}>
                {t(module.labelKey as TranslationKey)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {module.progress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              aria-label={"Progress for " + t(module.labelKey as TranslationKey)}
              value={module.progress}
              data-testid={DATA_TEST_ID.MODULE_PROGRESS(index)}
              sx={{
                height: 8,
                borderRadius: theme.rounding(theme.tabiyaRounding.sm),
                backgroundColor: theme.palette.grey[200],
              }}
            />
          </Box>
        ))}
      </CardContent>
    </Card>
  );
};
