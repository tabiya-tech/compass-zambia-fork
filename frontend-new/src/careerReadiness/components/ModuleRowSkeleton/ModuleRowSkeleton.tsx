import React from "react";
import { Box, Skeleton, useTheme } from "@mui/material";

const uniqueId = "e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b";

export const DATA_TEST_ID = {
  MODULE_ROW_SKELETON: `module-row-skeleton-${uniqueId}`,
};

const ModuleRowSkeleton: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      data-testid={DATA_TEST_ID.MODULE_ROW_SKELETON}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: theme.fixedSpacing(theme.tabiyaSpacing.md),
        paddingY: theme.fixedSpacing(theme.tabiyaSpacing.sm),
        borderBottom: `1px solid ${theme.palette.divider}`,
        "&:last-child": { borderBottom: "none" },
      }}
    >
      {/* Numbered circle */}
      <Skeleton
        variant="circular"
        sx={{
          width: theme.fixedSpacing(theme.tabiyaSpacing.md * 1.75),
          height: theme.fixedSpacing(theme.tabiyaSpacing.md * 1.75),
          flexShrink: 0,
          backgroundColor: theme.palette.grey[200],
        }}
      />

      {/* Title */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Skeleton
          variant="rounded"
          width="55%"
          height={14}
          sx={{ borderRadius: 1, backgroundColor: theme.palette.grey[200] }}
        />
      </Box>

      {/* Action chip */}
      <Skeleton
        variant="rounded"
        width={64}
        height={28}
        sx={{ borderRadius: 4, flexShrink: 0, backgroundColor: theme.palette.grey[200] }}
      />
    </Box>
  );
};

export default ModuleRowSkeleton;
