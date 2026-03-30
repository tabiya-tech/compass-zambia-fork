import React from "react";

import { Box, Typography, useTheme, useMediaQuery } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import Grid from "@mui/material/Grid";
import { useTranslation } from "react-i18next";
import { getEnabledModules } from "src/home/modulesService";
import { useModuleProgress } from "src/home/hooks/useModuleProgress";
import ProgressBar from "src/home/components/ProgressBar/ProgressBar";
import ModuleCard from "src/home/components/ModuleCard/ModuleCard";
import Footer from "src/home/components/Footer/Footer";
import { getProductName } from "src/envService";
import { BADGE_STATUS } from "src/home/constants";
import { useUserProfile } from "src/profile/hooks/useUserProfile";

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
  const { profileData } = useUserProfile();

  const userName = profileData.name && profileData.name !== "Not available" ? profileData.name : "";
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
      {/* Page Content */}
      <Box
        sx={{
          paddingTop: isMobile
            ? theme.fixedSpacing(theme.tabiyaSpacing.lg)
            : theme.fixedSpacing(theme.tabiyaSpacing.md),
          paddingBottom: theme.fixedSpacing(theme.tabiyaSpacing.md),
          paddingX: theme.spacing(theme.tabiyaSpacing.md),
          flex: 1,
          width: { xs: "100%", md: "60%" },
          margin: { xs: "0", md: "0 auto" },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: isMobile ? theme.fixedSpacing(theme.tabiyaSpacing.md) : theme.spacing(theme.tabiyaSpacing.xl),
          }}
        >
          {/* Welcome, Section */}
          <Box>
            <Typography
              variant={isMobile ? "h5" : "h4"}
              color="text.primary"
              sx={{ fontWeight: "bold", marginBottom: theme.fixedSpacing(theme.tabiyaSpacing.sm) }}
              data-testid={DATA_TEST_ID.HOME_WELCOME_TITLE}
            >
              {t("home.welcomeBack", { name: userName })}
            </Typography>
            <Typography variant="body1" color="text.secondary" data-testid={DATA_TEST_ID.HOME_WELCOME_SUBTITLE}>
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
              sx={{ marginBottom: theme.fixedSpacing(theme.tabiyaSpacing.sm) }}
              data-testid={DATA_TEST_ID.HOME_MODULES_TITLE}
            >
              {t("home.whatToDo")}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ marginBottom: theme.fixedSpacing(theme.tabiyaSpacing.lg) }}
              data-testid={DATA_TEST_ID.HOME_MODULES_SUBTITLE}
            >
              {t("home.whatToDoSubtitle")}
            </Typography>
            <Grid
              container
              spacing={theme.fixedSpacing(theme.tabiyaSpacing.md)}
              justifyContent="center"
              data-testid={DATA_TEST_ID.HOME_MODULES_GRID}
            >
              {modules.map((module) => {
                const progressBadgeStatus = getBadgeStatus(module.id);
                const badgeStatus = module.disabled ? BADGE_STATUS.SOON : progressBadgeStatus;
                return (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={module.id}>
                    <ModuleCard module={module} badgeStatus={badgeStatus} />
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </Box>
      </Box>

      {/* Footer */}
      <Footer />
    </Box>
  );
};

export default Home;
