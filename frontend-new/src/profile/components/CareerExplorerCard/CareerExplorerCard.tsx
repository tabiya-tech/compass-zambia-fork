import React from "react";
import { Box, Card, CardContent, Chip, Skeleton, Typography, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { UserSectorEngagementItem } from "src/careerExplorer/services/CareerExplorerService";

const uniqueId = "career-explorer-card-d1e2f3a4-5b6c-7d8e-9f0a-1b2c3d4e5f6a";

export const DATA_TEST_ID = {
  CARD: `career-explorer-card-${uniqueId}`,
  TITLE: `career-explorer-title-${uniqueId}`,
  SUMMARY: `career-explorer-summary-${uniqueId}`,
  EMPTY: `career-explorer-empty-${uniqueId}`,
  SECTOR_ITEM: (index: number) => `career-explorer-sector-${index}-${uniqueId}`,
};

export interface CareerExplorerCardProps {
  sectors: UserSectorEngagementItem[];
  isLoading: boolean;
}

/**
 * CareerExplorerCard displays the sectors the user has explored in the Career Explorer.
 */
export const CareerExplorerCard: React.FC<CareerExplorerCardProps> = ({ sectors, isLoading }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Card
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: "none",
      }}
      data-testid={DATA_TEST_ID.CARD}
    >
      <CardContent
        sx={{
          padding: theme.spacing(theme.tabiyaSpacing.lg),
        }}
      >
        <Typography
          variant="h6"
          sx={{
            marginBottom: theme.spacing(theme.tabiyaSpacing.md),
            fontWeight: "bold",
          }}
          data-testid={DATA_TEST_ID.TITLE}
        >
          {t("home.profile.careerExplorer")}
        </Typography>

        {isLoading ? (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: theme.spacing(theme.tabiyaSpacing.sm) }}>
            <Skeleton variant="rectangular" width={110} height={32} sx={{ borderRadius: 16 }} />
            <Skeleton variant="rectangular" width={90} height={32} sx={{ borderRadius: 16 }} />
            <Skeleton variant="rectangular" width={130} height={32} sx={{ borderRadius: 16 }} />
          </Box>
        ) : sectors.length === 0 ? (
          <Typography variant="body2" color="text.secondary" data-testid={DATA_TEST_ID.EMPTY}>
            {t("home.profile.noSectorsYet")}
          </Typography>
        ) : (
          <>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ marginBottom: theme.spacing(theme.tabiyaSpacing.sm) }}
              data-testid={DATA_TEST_ID.SUMMARY}
            >
              {t("home.profile.sectorsExplored", { count: sectors.length })}
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: theme.spacing(theme.tabiyaSpacing.sm) }}>
              {sectors.map((sector, index) => (
                <Chip
                  key={sector.sector_name}
                  label={`${sector.sector_name}${sector.is_priority ? " ★" : ""}`}
                  data-testid={DATA_TEST_ID.SECTOR_ITEM(index)}
                  sx={{
                    borderRadius: theme.rounding(theme.tabiyaRounding.md),
                    ...(sector.is_priority && {
                      borderColor: theme.palette.primary.main,
                      border: "1px solid",
                    }),
                  }}
                />
              ))}
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};
