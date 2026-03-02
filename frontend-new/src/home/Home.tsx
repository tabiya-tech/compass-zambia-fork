import React from "react";

import { Box, Container, Typography, useTheme, useMediaQuery } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import Grid from "@mui/material/Grid";
import { useTranslation } from "react-i18next";
import { getEnabledModules } from "src/home/modulesService";
import { useModuleProgress } from "src/home/hooks/useModuleProgress";
import ProgressBar from "src/home/components/ProgressBar/ProgressBar";
import ModuleCard from "src/home/components/ModuleCard/ModuleCard";
import PageHeader from "src/home/components/PageHeader/PageHeader";
import Footer from "src/home/components/Footer/Footer";
import authenticationStateService from "src/auth/services/AuthenticationState.service";
import { getProductName } from "src/envService";

const uniqueId = "f1a2b3c4-5d6e-7f8a-9b0c-1d2e3f4a5b6c";

export const DATA_TEST_ID = {
  HOME_CONTAINER: `home-container-${uniqueId}`,
  HOME_WELCOME_TITLE: `home-welcome-title-${uniqueId}`,
  HOME_WELCOME_SUBTITLE: `home-welcome-subtitle-${uniqueId}`,
  HOME_MODULES_TITLE: `home-modules-title-${uniqueId}`,
  HOME_MODULES_SUBTITLE: `home-modules-subtitle-${uniqueId}`,
  HOME_MODULES_GRID: `home-modules-grid-${uniqueId}`,
};

const Home: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));
  const { t } = useTranslation();
  const modules = getEnabledModules();
  const { overallProgress, getBadgeStatus } = useModuleProgress();

  const user = authenticationStateService.getInstance().getUser();
  const userName = user?.name || "";
  const appName = getProductName() || "";

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: theme.palette.containerBackground.light,
      }}
      data-testid={DATA_TEST_ID.HOME_CONTAINER}
    >
      {/* Page Header */}
      <PageHeader title="home.dashboard" />

      {/* Page Content */}
      <Container
        maxWidth="md"
        sx={{
          padding: isMobile ? theme.spacing(theme.tabiyaSpacing.xl) : theme.spacing(theme.tabiyaSpacing.lg),
          marginBottom: isMobile ? theme.spacing(theme.tabiyaSpacing.xl * 1.5) : theme.spacing(theme.tabiyaSpacing.xl),
          flex: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: isMobile ? theme.spacing(theme.tabiyaSpacing.xl * 1.25) : theme.spacing(theme.tabiyaSpacing.xl),
          }}
        >
          {/* Welcome, Section */}
          <Box>
            <Typography
              variant={isMobile ? "h4" : "h3"}
              color="text.primary"
              sx={{ fontWeight: "bold", marginBottom: theme.tabiyaSpacing.sm }}
              data-testid={DATA_TEST_ID.HOME_WELCOME_TITLE}
            >
              {t("home.welcomeBack", { name: userName })}
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ lineHeight: 1.6 }}
              data-testid={DATA_TEST_ID.HOME_WELCOME_SUBTITLE}
            >
              {t("home.subtitle", { appName: appName })}
            </Typography>
          </Box>

          {/* Progress Section */}
          <ProgressBar progress={overallProgress} />

          {/* Modules Section */}
          <Box>
            <Typography
              variant="body1"
              fontWeight="bold"
              color="text.primary"
              sx={{ marginBottom: theme.tabiyaSpacing.xs }}
              data-testid={DATA_TEST_ID.HOME_MODULES_TITLE}
            >
              {t("home.whatToDo")}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ marginBottom: theme.spacing(theme.tabiyaSpacing.lg) }}
              data-testid={DATA_TEST_ID.HOME_MODULES_SUBTITLE}
            >
              {t("home.whatToDoSubtitle")}
            </Typography>
            <Grid
              container
              spacing={theme.tabiyaSpacing.md}
              justifyContent="center"
              data-testid={DATA_TEST_ID.HOME_MODULES_GRID}
            >
              {modules.map((module) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={module.id}>
                  <ModuleCard module={module} badgeStatus={getBadgeStatus(module.id)} />
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      </Container>

      {/* Footer */}
      <Footer />
    </Box>
  );
};

export default Home;
