import React from "react";
import { Box, Typography, useTheme, Select, MenuItem, LinearProgress } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { SkillsDemandSupplyData, SkillsGapSectorData } from "src/types";

const SkillsAnalytics: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  const supplyData: SkillsDemandSupplyData[] = [];
  const demandData: SkillsDemandSupplyData[] = [];
  const skillsGapSector: SkillsGapSectorData[] = [];

  const renderSimpleBar = (label: string, value: number, barColor: string, ariaLabel: string) => (
    <Box
      display="grid"
      gridTemplateColumns="160px 1fr 40px"
      gap={theme.fixedSpacing(theme.tabiyaSpacing.sm)}
      alignItems="center"
      mb={0.5}
    >
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <LinearProgress
        variant="determinate"
        value={value}
        aria-label={ariaLabel}
        sx={{
          height: 16,
          borderRadius: theme.fixedSpacing(theme.tabiyaSpacing.xs),
          backgroundColor: theme.palette.divider,
          "& .MuiLinearProgress-bar": { backgroundColor: barColor, borderRadius: "inherit" },
        }}
      />
      <Typography variant="body2">{value}%</Typography>
    </Box>
  );

  return (
    <Box display="flex" flexDirection="column" gap={theme.fixedSpacing(theme.tabiyaSpacing.lg)}>
      {/* Chart Section */}
      <Box
        sx={{
          p: theme.fixedSpacing(theme.tabiyaSpacing.lg),
          borderRadius: theme.rounding(theme.tabiyaRounding.sm),
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={theme.fixedSpacing(theme.tabiyaSpacing.lg)}
          flexWrap="wrap"
          gap={2}
        >
          <Typography variant="body1" sx={{ fontWeight: 700 }}>
            {t("dashboard.skillsAnalytics.supplyVsDemandTitle")}
          </Typography>
          <Box display="flex" gap={2}>
            <Select
              size="small"
              value=""
              displayEmpty
              sx={{ backgroundColor: theme.palette.background.paper, minWidth: 140 }}
            >
              <MenuItem value="">{t("dashboard.skillsAnalytics.filters.allProvinces")}</MenuItem>
            </Select>
            <Select
              size="small"
              value=""
              displayEmpty
              sx={{ backgroundColor: theme.palette.background.paper, minWidth: 140 }}
            >
              <MenuItem value="">{t("dashboard.skillsAnalytics.filters.allSectors")}</MenuItem>
            </Select>
          </Box>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          }}
        >
          {/* Left Column */}
          <Box sx={{ pr: { md: 3 } }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.text.secondary,
                  textTransform: "uppercase",
                }}
              >
                {t("dashboard.skillsAnalytics.topSkillsAmongStudents")}
              </Typography>
              <Box display="flex" gap={1.5}>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Box
                    sx={{ width: 12, height: 12, borderRadius: 0.5, backgroundColor: theme.palette.secondary.main }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {t("dashboard.skillsAnalytics.legend.supply")}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Box
                    sx={{
                      width: 2,
                      height: 14,
                      borderRadius: 1,
                      backgroundColor: theme.palette.primary.main,
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {t("dashboard.skillsAnalytics.legend.demand")}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box>
              {supplyData.map((item) =>
                renderSimpleBar(
                  item.skillName,
                  item.supplyPct,
                  theme.palette.secondary.main,
                  t("dashboard.skillsAnalytics.aria.supplyBar", { skill: item.skillName, value: item.supplyPct })
                )
              )}
            </Box>
          </Box>

          {/* Right Column */}
          <Box sx={{ borderLeft: { md: 1 }, borderColor: { md: "divider" }, pl: { md: 3 } }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.text.secondary,
                  textTransform: "uppercase",
                }}
              >
                {t("dashboard.skillsAnalytics.topSkillsInDemand")}
              </Typography>
              <Box display="flex" gap={1.5}>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Box sx={{ width: 12, height: 12, borderRadius: 0.5, backgroundColor: theme.palette.primary.main }} />
                  <Typography variant="caption" color="text.secondary">
                    {t("dashboard.skillsAnalytics.legend.demand")}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Box
                    sx={{
                      width: 2,
                      height: 14,
                      borderRadius: 1,
                      backgroundColor: theme.palette.secondary.main,
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {t("dashboard.skillsAnalytics.legend.supply")}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box>
              {demandData.map((item) =>
                renderSimpleBar(
                  item.skillName,
                  item.demandPct,
                  theme.palette.primary.main,
                  t("dashboard.skillsAnalytics.aria.demandBar", { skill: item.skillName, value: item.demandPct })
                )
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Gap Section */}
      <Box
        sx={{
          p: theme.fixedSpacing(theme.tabiyaSpacing.lg),
          borderRadius: theme.rounding(theme.tabiyaRounding.sm),
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={theme.fixedSpacing(theme.tabiyaSpacing.lg)}
          flexWrap="wrap"
          gap={2}
        >
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 700, mb: 1 }}>
              {t("dashboard.skillsAnalytics.gapBySectorTitle")}
            </Typography>
            <Box display="flex" gap={2}>
              <Box display="flex" alignItems="center" gap={0.5}>
                <Box sx={{ width: 12, height: 12, borderRadius: 0.5, backgroundColor: theme.palette.secondary.main }} />
                <Typography variant="caption" color="text.secondary">
                  {t("dashboard.skillsAnalytics.legend.supplyStudents")}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={0.5}>
                <Box sx={{ width: 12, height: 12, borderRadius: 0.5, backgroundColor: theme.palette.primary.main }} />
                <Typography variant="caption" color="text.secondary">
                  {t("dashboard.skillsAnalytics.legend.demandEmployers")}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {t("dashboard.skillsAnalytics.avgGapLabel")}
          </Typography>
        </Box>

        <Box display="flex" flexDirection="column" gap={theme.fixedSpacing(theme.tabiyaSpacing.sm)}>
          {skillsGapSector.map((row) => {
            const gap = row.supplyPct - row.demandPct;
            const formattedGap = gap > 0 ? `+${gap}` : `${gap}`;
            const containerPct = Math.max(row.supplyPct, row.demandPct, 1);

            return (
              <Box
                key={row.sector}
                display="grid"
                gridTemplateColumns="140px 1fr 44px 44px 44px"
                gap={theme.fixedSpacing(theme.tabiyaSpacing.md)}
                alignItems="center"
              >
                <Typography variant="body2" color="text.primary">
                  {row.sector}
                </Typography>

                <LinearProgress
                  variant="determinate"
                  value={(row.supplyPct / containerPct) * 100}
                  aria-label={t("dashboard.skillsAnalytics.aria.gapBar", {
                    sector: row.sector,
                    supply: row.supplyPct,
                    demand: row.demandPct,
                  })}
                  sx={{
                    height: 24,
                    width: `${containerPct}%`,
                    borderRadius: theme.fixedSpacing(theme.tabiyaSpacing.xs),
                    backgroundColor: theme.palette.primary.main,
                    boxShadow: "none",
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: theme.palette.secondary.main,
                      backgroundImage: "none",
                      boxShadow: "none",
                      borderRadius: "inherit",
                    },
                  }}
                />

                <Box
                  display="grid"
                  gridTemplateColumns="44px 44px 44px"
                  gap={theme.fixedSpacing(theme.tabiyaSpacing.xs)}
                  textAlign="right"
                  alignItems="center"
                >
                  <Typography variant="body2" sx={{ color: theme.palette.secondary.main }}>
                    {row.supplyPct}%
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.primary.main }}>
                    {row.demandPct}%
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.error.main }}>
                    {t("dashboard.skillsAnalytics.gapPp", { gap: formattedGap })}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default SkillsAnalytics;
