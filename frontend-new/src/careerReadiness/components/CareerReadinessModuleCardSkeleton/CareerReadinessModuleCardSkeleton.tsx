import React from "react";
import { Box, Card, Skeleton, useTheme } from "@mui/material";

const uniqueId = "50bfbbdc-4850-4026-8dd0-8e95d26f24bf";

export const DATA_TEST_ID = {
  MODULE_CARD_SKELETON: `career-readiness-module-card-skeleton-${uniqueId}`,
};

const CareerReadinessModuleCardSkeleton: React.FC = () => {
  const theme = useTheme();
  return (
    <Card
      sx={{
        borderRadius: theme.rounding(theme.tabiyaRounding.sm),
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: "none",
        height: "100%",
      }}
      data-testid={DATA_TEST_ID.MODULE_CARD_SKELETON}
    >
      <Box
        sx={{
          padding: theme.fixedSpacing(theme.tabiyaSpacing.md),
          height: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          gap: theme.fixedSpacing(theme.tabiyaSpacing.md),
        }}
      >
        {/* Icon placeholder */}
        <Skeleton
          variant="rounded"
          width={40}
          height={40}
          sx={{ borderRadius: theme.rounding(theme.tabiyaRounding.sm), backgroundColor: theme.palette.grey[200] }}
        />

        {/* Text content */}
        <Box sx={{ flex: 1 }}>
          {/* Title row and status badge */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
            <Skeleton
              variant="rounded"
              width="60%"
              height={15}
              sx={{ borderRadius: 1, backgroundColor: theme.palette.grey[200] }}
            />
            <Skeleton
              variant="rounded"
              width="30%"
              height={15}
              sx={{ borderRadius: 8, mb: 1.5, backgroundColor: theme.palette.grey[200] }}
            />
          </Box>

          {/* Description lines */}
          <Skeleton
            variant="rounded"
            width="100%"
            height={10}
            sx={{ borderRadius: 1, mb: 0.5, backgroundColor: theme.palette.grey[200] }}
          />
          <Skeleton
            variant="rounded"
            width="95%"
            height={10}
            sx={{ borderRadius: 1, mb: 0.5, backgroundColor: theme.palette.grey[200] }}
          />
          <Skeleton
            variant="rounded"
            width="75%"
            height={10}
            sx={{ borderRadius: 1, backgroundColor: theme.palette.grey[200] }}
          />
        </Box>
      </Box>
    </Card>
  );
};

export default CareerReadinessModuleCardSkeleton;
