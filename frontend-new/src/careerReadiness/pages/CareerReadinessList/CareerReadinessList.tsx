import React, { useCallback, useEffect, useState } from "react";
import { Box, Typography, useTheme, useMediaQuery } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import type { ModuleSummary } from "src/careerReadiness/types";
import Footer from "src/home/components/Footer/Footer";
import HomeSidebar from "src/home/components/Sidebar/HomeSidebar";
import CareerReadinessService from "src/careerReadiness/services/CareerReadinessService";
import { useSnackbar } from "src/theme/SnackbarProvider/SnackbarProvider";
import HeroSection from "src/careerReadiness/components/HeroSection/HeroSection";
import ModuleRow from "src/careerReadiness/components/ModuleRow/ModuleRow";
import ModuleRowSkeleton from "src/careerReadiness/components/ModuleRowSkeleton/ModuleRowSkeleton";

const uniqueId = "d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a";

export const DATA_TEST_ID = {
  CAREER_READINESS_LIST_CONTAINER: `career-readiness-list-container-${uniqueId}`,
  CAREER_READINESS_LIST_CONTENT: `career-readiness-list-content-${uniqueId}`,
  CAREER_READINESS_MODULES_LIST: `career-readiness-modules-list-${uniqueId}`,
  CAREER_READINESS_LIST_EMPTY: `career-readiness-list-empty-${uniqueId}`,
};

const CareerReadinessList: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
  const [modules, setModules] = useState<ModuleSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const loadModules = useCallback(async () => {
    setLoading(true);
    try {
      const res = await CareerReadinessService.getInstance().listModules();
      const sorted = [...res.modules].sort((a, b) => a.sort_order - b.sort_order);
      setModules(sorted);
    } catch (e: any) {
      enqueueSnackbar(e?.message ?? t("careerReadiness.listError"), { variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [t, enqueueSnackbar]);

  useEffect(() => {
    loadModules();
  }, [loadModules]);

  const upNextModule =
    modules.find((m) => m.status === "IN_PROGRESS") ??
    modules.find((m) => m.status === "UNLOCKED") ??
    modules[0] ??
    null;

  return (
    <Box display="flex" flexDirection="column" flex={1} data-testid={DATA_TEST_ID.CAREER_READINESS_LIST_CONTAINER}>
      <HeroSection upNextModule={upNextModule} loading={loading} />

      <Box
        sx={{
          flex: 1,
          backgroundColor: theme.palette.containerBackground.main,
          display: "flex",
          justifyContent: "center",
        }}
        data-testid={DATA_TEST_ID.CAREER_READINESS_LIST_CONTENT}
      >
        <Box
          sx={{
            width: { xs: "100%", md: "60%" },
            display: "flex",
            alignItems: "stretch",
          }}
        >
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              paddingX: theme.fixedSpacing(theme.tabiyaSpacing.md),
              paddingTop: theme.fixedSpacing(theme.tabiyaSpacing.lg),
              paddingBottom: theme.fixedSpacing(theme.tabiyaSpacing.lg),
            }}
          >
            <Typography
              sx={{
                ...theme.typography.caption,
                fontWeight: 600,
                color: theme.palette.text.secondary,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: theme.fixedSpacing(theme.tabiyaSpacing.sm),
              }}
            >
              {t("careerReadiness.modulesTitle")}
            </Typography>

            <Box data-testid={DATA_TEST_ID.CAREER_READINESS_MODULES_LIST}>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <ModuleRowSkeleton key={i} />)
              ) : modules.length === 0 ? (
                <Typography variant="body1" color="error" data-testid={DATA_TEST_ID.CAREER_READINESS_LIST_EMPTY}>
                  {t("careerReadiness.emptyList")}
                </Typography>
              ) : (
                modules.map((module, i) => <ModuleRow key={module.id} module={module} index={i} />)
              )}
            </Box>
          </Box>

          {!isMobile && <HomeSidebar />}
        </Box>
      </Box>

      <Footer sx={{ backgroundColor: theme.palette.containerBackground.main }} />
    </Box>
  );
};

export default CareerReadinessList;
