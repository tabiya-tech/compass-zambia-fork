import React, { useState } from "react";
import { Box, Container, Grid, Typography, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import Header from "src/components/Header/Header";
import Footer from "src/components/Footer/Footer";
import StatCard from "src/components/StatCard/StatCard";
import DashboardTabs, { DashboardTabValue } from "src/components/DashboardTabs/DashboardTabs";
import DailyAdoptionTrendChart from "src/components/DailyAdoptionTrendChart/DailyAdoptionTrendChart";
import InstitutionsTable from "src/components/InstitutionsTable/InstitutionsTable";
import { useInstitutions } from "src/hooks/useInstitutions";
import { useDashboardStats } from "src/hooks/useDashboardStats";

const uniqueId = "78972cb9-14de-4075-bd34-7fd96d135f5e";

export const DATA_TEST_ID = {
  DASHBOARD_PAGE_CONTAINER: `${uniqueId}-container`,
  DASHBOARD_PAGE_TITLE: `${uniqueId}-title`,
  DASHBOARD_STAT_CARD: `${uniqueId}-stat-card`,
};

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { institutions } = useInstitutions();
  const { stats } = useDashboardStats();

  const [tab, setTab] = useState<DashboardTabValue>("institutions");

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: theme.palette.containerBackground.light,
      }}
      data-testid={DATA_TEST_ID.DASHBOARD_PAGE_CONTAINER}
    >
      <Header />

      <Container maxWidth="lg">
        <Box sx={{ display: "flex", flexDirection: "column", gap: theme.fixedSpacing(theme.tabiyaSpacing.xl) }}>
          <Box>
            <Typography variant="overline" sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>
              {t("dashboard.sectionTitle")}
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700 }} data-testid={DATA_TEST_ID.DASHBOARD_PAGE_TITLE}>
              {t("dashboard.header.welcome", { name: "John Doe" })}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("dashboard.header.school")}
            </Typography>
          </Box>

          <Grid container spacing={theme.fixedSpacing(theme.tabiyaSpacing.md)}>
            {stats.map((stat) => (
              <Grid
                key={stat.id ?? stat.titleKey}
                size={{ xs: 12, md: 4 }}
                data-testid={DATA_TEST_ID.DASHBOARD_STAT_CARD}
              >
                <StatCard
                  title={t(stat.titleKey)}
                  value={stat.value}
                  subtitle={stat.subtitleKey ? t(stat.subtitleKey) : undefined}
                />
              </Grid>
            ))}
          </Grid>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: theme.fixedSpacing(theme.tabiyaSpacing.lg),
              backgroundColor: theme.palette.background.paper,
              borderRadius: theme.tabiyaRounding.sm,
            }}
          >
            <DashboardTabs value={tab} onChange={setTab} />

            {tab === "institutions" ? (
              <Box>
                <Box sx={{ marginBottom: theme.fixedSpacing(theme.tabiyaSpacing.lg) }}>
                  <DailyAdoptionTrendChart />
                </Box>
                <InstitutionsTable rows={institutions} />
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                {t("dashboard.comingSoon")}
              </Typography>
            )}
          </Box>
        </Box>
      </Container>

      <Footer />
    </Box>
  );
};

export default Dashboard;
