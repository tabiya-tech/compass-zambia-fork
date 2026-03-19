import React from "react";
import { Box, Card, CardContent, Typography, useTheme } from "@mui/material";

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle }) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: theme.tabiyaRounding.sm,
        boxShadow: "none",
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <CardContent sx={{ p: 2, "&:last-child": { p: 2 } }}>
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Typography variant="overline" color="text.secondary">
            {title}
          </Typography>

          <Typography variant="h6" component="div">
            {value}
          </Typography>

          {subtitle && (
            <Typography variant="caption" sx={{ color: theme.palette.secondary.main, fontWeight: 600 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;
