import React from "react";
import { Box, Divider, Skeleton, useTheme } from "@mui/material";

const HomeJobReadyListSkeleton: React.FC = () => {
  const theme = useTheme();
  const secondary = theme.palette.secondary;

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: theme.fixedSpacing(theme.tabiyaSpacing.sm),
          flexWrap: "wrap",
          marginBottom: {
            xs: theme.fixedSpacing(theme.tabiyaSpacing.md),
            sm: theme.fixedSpacing(theme.tabiyaSpacing.lg),
          },
        }}
      >
        <Box sx={{ flex: "1 1 200px", minWidth: 0 }}>
          <Skeleton variant="text" width={220} height={44} />
          <Skeleton variant="text" width="95%" />
          <Skeleton variant="text" width="72%" />
        </Box>
        <Skeleton variant="text" width={140} height={28} />
      </Box>

      <Box component="ul" sx={{ listStyle: "none", padding: 0, margin: 0 }}>
        {[0, 1, 2, 3].map((i) => (
          <Box key={i} component="li">
            {i > 0 && (
              <Divider
                sx={{
                  borderColor: `color-mix(in srgb, ${secondary.main} 35%, transparent)`,
                  my: theme.fixedSpacing(theme.tabiyaSpacing.sm),
                }}
              />
            )}
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: theme.fixedSpacing(theme.tabiyaSpacing.md),
              }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", gap: theme.fixedSpacing(theme.tabiyaSpacing.md), flex: 1 }}
              >
                <Skeleton variant="circular" width={40} height={40} />
                <Skeleton variant="text" width="48%" height={36} />
              </Box>
              <Skeleton variant="rounded" width={88} height={36} sx={{ borderRadius: "999px" }} />
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default HomeJobReadyListSkeleton;
