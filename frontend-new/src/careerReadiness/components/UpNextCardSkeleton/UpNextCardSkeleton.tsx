import React from "react";
import { Box, Skeleton, useTheme } from "@mui/material";

const uniqueId = "f6a7b8c9-d0e1-2f3a-4b5c-6d7e8f9a0b1c";

export const DATA_TEST_ID = {
  UP_NEXT_CARD_SKELETON: `up-next-card-skeleton-${uniqueId}`,
};

const UpNextCardSkeleton: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      data-testid={DATA_TEST_ID.UP_NEXT_CARD_SKELETON}
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: theme.rounding(theme.tabiyaRounding.sm),
        padding: theme.fixedSpacing(theme.tabiyaSpacing.md),
        backgroundColor: theme.palette.background.paper,
        display: "flex",
        alignItems: { xs: "flex-start", sm: "center" },
        flexDirection: { xs: "column", sm: "row" },
        justifyContent: "space-between",
        gap: theme.fixedSpacing(theme.tabiyaSpacing.sm),
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* "Up next" label */}
        <Skeleton
          variant="rounded"
          width={60}
          height={10}
          sx={{ borderRadius: 1, mb: 1, backgroundColor: theme.palette.grey[200] }}
        />
        {/* Module title */}
        <Skeleton
          variant="rounded"
          width="70%"
          height={16}
          sx={{ borderRadius: 1, mb: 0.75, backgroundColor: theme.palette.grey[200] }}
        />
        {/* Duration line */}
        <Skeleton
          variant="rounded"
          width={90}
          height={10}
          sx={{ borderRadius: 1, backgroundColor: theme.palette.grey[200] }}
        />
      </Box>

      {/* Continue button */}
      <Skeleton
        variant="rounded"
        width={100}
        height={36}
        sx={{ borderRadius: 4, flexShrink: 0, backgroundColor: theme.palette.grey[200] }}
      />
    </Box>
  );
};

export default UpNextCardSkeleton;
