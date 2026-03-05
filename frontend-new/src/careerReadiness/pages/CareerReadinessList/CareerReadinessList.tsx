import React, { useCallback, useEffect, useState } from "react";
import { Box, Grid, Typography, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PageHeader from "src/home/components/PageHeader/PageHeader";
import { routerPaths } from "src/app/routerPaths";
import { mapModuleStatusToDisplay } from "src/careerReadiness/types";
import CareerReadinessModuleCard from "src/careerReadiness/components/CareerReadinessModuleCard/CareerReadinessModuleCard";
import CareerReadinessModuleCardSkeleton from "src/careerReadiness/components/CareerReadinessModuleCardSkeleton/CareerReadinessModuleCardSkeleton";
import Footer from "src/home/components/Footer/Footer";
import CareerReadinessService from "src/careerReadiness/services/CareerReadinessService";
import type { ModuleSummary } from "src/careerReadiness/types";
import { useSnackbar } from "src/theme/SnackbarProvider/SnackbarProvider";

const uniqueId = "d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a";

export const DATA_TEST_ID = {
  CAREER_READINESS_LIST_CONTAINER: `career-readiness-list-container-${uniqueId}`,
  CAREER_READINESS_LIST_CONTENT: `career-readiness-list-content-${uniqueId}`,
  CAREER_READINESS_LIST_GRID: `career-readiness-list-grid-${uniqueId}`,
  CAREER_READINESS_LIST_EMPTY: `career-readiness-list-empty-${uniqueId}`,
  CAREER_READINESS_INTRODUCTION: `career-readiness-introduction-${uniqueId}`,
  CAREER_READINESS_LIST_LOADING: `career-readiness-list-loading-${uniqueId}`,
};

const SKELETON_COUNT = 6;

const CareerReadinessList: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [modules, setModules] = useState<ModuleSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const loadModules = useCallback(() => {
    setLoading(true);
    CareerReadinessService.getInstance()
      .listModules()
      .then((res) => {
        setModules(res.modules);
      })
      .catch((e) => {
        enqueueSnackbar(e?.message ?? t("careerReadiness.listError"), { variant: "error" });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [t, enqueueSnackbar]);

  useEffect(() => {
    loadModules();
  }, [loadModules]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      minHeight="100vh"
      sx={{ backgroundColor: theme.palette.containerBackground.light }}
      data-testid={DATA_TEST_ID.CAREER_READINESS_LIST_CONTAINER}
    >
      <PageHeader
        title="careerReadiness.pageTitle"
        subtitle="careerReadiness.pageDescription"
        backLinkLabel="home.backToDashboard"
        onBackClick={() => navigate(routerPaths.ROOT)}
      />

      <Box
        sx={{
          flex: 1,
          width: { xs: "100%", md: "60%" },
          margin: { xs: "0", md: "0 auto" },
          paddingX: theme.spacing(theme.tabiyaSpacing.md),
          paddingBottom: theme.fixedSpacing(theme.tabiyaSpacing.md),
          paddingTop: theme.fixedSpacing(theme.tabiyaSpacing.sm),
          overflowY: "auto",
        }}
        data-testid={DATA_TEST_ID.CAREER_READINESS_LIST_CONTENT}
      >
        <Box mb={theme.spacing(theme.tabiyaSpacing.lg)} data-testid={DATA_TEST_ID.CAREER_READINESS_INTRODUCTION}>
          <Typography variant="body1" color="text.secondary">
            {t("careerReadiness.introduction")}
          </Typography>
        </Box>

        {loading && (
          <Grid
            container
            spacing={theme.tabiyaSpacing.md}
            justifyContent="center"
            data-testid={DATA_TEST_ID.CAREER_READINESS_LIST_LOADING}
          >
            {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <Grid key={i} size={{ xs: 14, sm: 6 }}>
                <CareerReadinessModuleCardSkeleton />
              </Grid>
            ))}
          </Grid>
        )}

        {!loading && modules.length === 0 && (
          <Typography
            variant="body1"
            color="error"
            paddingTop={theme.fixedSpacing(theme.tabiyaSpacing.md)}
            data-testid={DATA_TEST_ID.CAREER_READINESS_LIST_EMPTY}
          >
            {t("careerReadiness.emptyList")}
          </Typography>
        )}

        {!loading && modules.length > 0 && (
          <Grid
            container
            spacing={theme.fixedSpacing(theme.tabiyaSpacing.md)}
            justifyContent="center"
            data-testid={DATA_TEST_ID.CAREER_READINESS_LIST_GRID}
          >
            {modules.map((module) => (
              <Grid key={module.id} size={{ xs: 12, sm: 6 }}>
                <CareerReadinessModuleCard module={module} status={mapModuleStatusToDisplay(module.status)} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <Footer />
    </Box>
  );
};

export default CareerReadinessList;
