import React from "react";
import { Box, Card, CardContent, Container, Grid, Typography, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import PeopleIcon from "@mui/icons-material/People";
import SettingsIcon from "@mui/icons-material/Settings";
import BarChartIcon from "@mui/icons-material/BarChart";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

const uniqueId = "dashboard-page-7c9d2e1f-3a5b-4c8d-9e0f-1a2b3c4d5e6f";

export const DATA_TEST_ID = {
  DASHBOARD_PAGE_CONTAINER: `${uniqueId}-container`,
  DASHBOARD_PAGE_TITLE: `${uniqueId}-title`,
  DASHBOARD_STAT_CARD: `${uniqueId}-stat-card`,
};

export interface DashboardProps {}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: theme.tabiyaRounding.sm,
      }}
      data-testid={DATA_TEST_ID.DASHBOARD_STAT_CARD}
    >
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box>
            <Typography color="textSecondary" gutterBottom variant="overline">
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: color,
              borderRadius: theme.tabiyaRounding.sm,
              padding: theme.spacing(1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const Dashboard: React.FC<DashboardProps> = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  const stats = [
    {
      title: t("dashboard.stats.totalUsers", "Total Users"),
      value: "1,234",
      icon: <PeopleIcon sx={{ color: "white" }} />,
      color: theme.palette.primary.main,
    },
    {
      title: t("dashboard.stats.activeUsers", "Active Users"),
      value: "856",
      icon: <TrendingUpIcon sx={{ color: "white" }} />,
      color: theme.palette.success.main,
    },
    {
      title: t("dashboard.stats.sessions", "Sessions Today"),
      value: "423",
      icon: <BarChartIcon sx={{ color: "white" }} />,
      color: theme.palette.info.main,
    },
    {
      title: t("dashboard.stats.configurations", "Configurations"),
      value: "12",
      icon: <SettingsIcon sx={{ color: "white" }} />,
      color: theme.palette.warning.main,
    },
  ];

  return (
    <Container maxWidth="lg" data-testid={DATA_TEST_ID.DASHBOARD_PAGE_CONTAINER}>
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom data-testid={DATA_TEST_ID.DASHBOARD_PAGE_TITLE}>
          {t("dashboard.title", "Dashboard")}
        </Typography>

        <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
          {t("dashboard.welcome", "Welcome to the Compass Admin Portal")}
        </Typography>

        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <StatCard title={stat.title} value={stat.value} icon={stat.icon} color={stat.color} />
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 4 }}>
          <Card sx={{ borderRadius: theme.tabiyaRounding.sm }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t("dashboard.recentActivity", "Recent Activity")}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {t("dashboard.noActivity", "No recent activity to display.")}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
};

export default Dashboard;
