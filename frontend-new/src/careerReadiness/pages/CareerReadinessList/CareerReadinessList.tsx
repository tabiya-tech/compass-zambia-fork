import React, { startTransition, useCallback, useEffect, useState } from "react";
import { Box, Typography, useTheme, useMediaQuery } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { mapModuleStatusToDisplay } from "src/careerReadiness/types";
import type { ModuleSummary } from "src/careerReadiness/types";
import Footer from "src/home/components/Footer/Footer";
import HomeSidebar from "src/home/components/Sidebar/HomeSidebar";
import CareerReadinessService from "src/careerReadiness/services/CareerReadinessService";
import { useSnackbar } from "src/theme/SnackbarProvider/SnackbarProvider";
import { routerPaths } from "src/app/routerPaths";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PrimaryButton from "src/theme/PrimaryButton/PrimaryButton";

const uniqueId = "d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a";

export const DATA_TEST_ID = {
  CAREER_READINESS_LIST_CONTAINER: `career-readiness-list-container-${uniqueId}`,
  CAREER_READINESS_LIST_CONTENT: `career-readiness-list-content-${uniqueId}`,
  CAREER_READINESS_HERO: `career-readiness-hero-${uniqueId}`,
  CAREER_READINESS_UP_NEXT: `career-readiness-up-next-${uniqueId}`,
  CAREER_READINESS_UP_NEXT_CONTINUE: `career-readiness-up-next-continue-${uniqueId}`,
  CAREER_READINESS_MODULES_LIST: `career-readiness-modules-list-${uniqueId}`,
  CAREER_READINESS_MODULE_ROW: `career-readiness-module-row-${uniqueId}`,
  CAREER_READINESS_LIST_EMPTY: `career-readiness-list-empty-${uniqueId}`,
};

// ─── Up Next card ─────────────────────────────────────────────────────────────

interface UpNextCardProps {
  module: ModuleSummary;
}

const UpNextCard: React.FC<UpNextCardProps> = ({ module }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleContinue = () => {
    startTransition(() => {
      navigate(`${routerPaths.CAREER_READINESS}/${module.id}`);
    });
  };

  return (
    <Box
      data-testid={DATA_TEST_ID.CAREER_READINESS_UP_NEXT}
      sx={{
        border: `1px solid ${theme.palette.careerReadiness.main}`,
        borderRadius: theme.rounding(theme.tabiyaRounding.sm),
        padding: theme.fixedSpacing(theme.tabiyaSpacing.md),
        backgroundColor: theme.palette.background.paper,
        display: "flex",
        alignItems: { xs: "flex-start", sm: "center" },
        flexDirection: { xs: "column", sm: "row" },
        justifyContent: "space-between",
        gap: theme.fixedSpacing(theme.tabiyaSpacing.sm),
      }}
    >
      <Box>
        <Typography
          sx={{
            ...theme.typography.caption,
            color: theme.palette.text.secondary,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontWeight: 600,
            marginBottom: theme.fixedSpacing(theme.tabiyaSpacing.xxs),
          }}
        >
          {t("careerReadiness.upNext")}
        </Typography>
        <Typography
          variant="body1"
          fontWeight={700}
          color="text.primary"
          sx={{ marginBottom: theme.fixedSpacing(theme.tabiyaSpacing.xxs) }}
        >
          {module.title}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: theme.fixedSpacing(theme.tabiyaSpacing.xxs) }}>
          <AccessTimeIcon sx={{ fontSize: 13, color: theme.palette.text.secondary }} />
          <Typography sx={{ ...theme.typography.caption, color: theme.palette.text.secondary }}>
            {t("careerReadiness.takes30Min")}
          </Typography>
        </Box>
      </Box>

      <PrimaryButton
        data-testid={DATA_TEST_ID.CAREER_READINESS_UP_NEXT_CONTINUE}
        onClick={handleContinue}
        color="brandAction"
        showCircle
        sx={{ flexShrink: 0, fontSize: { xs: "0.75rem", sm: "1rem" } }}
      >
        {t("careerReadiness.continue")}
      </PrimaryButton>
    </Box>
  );
};

// ─── Hero section — full width, white ─────────────────────────────────────────

interface HeroSectionProps {
  upNextModule: ModuleSummary | null;
}

const HeroSection: React.FC<HeroSectionProps> = ({ upNextModule }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Box
      data-testid={DATA_TEST_ID.CAREER_READINESS_HERO}
      sx={{
        backgroundColor: theme.palette.background.paper,
        width: "100%",
      }}
    >
      <Box
        sx={{
          width: { xs: "100%", md: "60%" },
          margin: "0 auto",
          padding: theme.fixedSpacing(theme.tabiyaSpacing.lg),
          display: "flex",
          gap: theme.fixedSpacing(theme.tabiyaSpacing.lg),
          alignItems: "center",
        }}
      >
        <Box
          component="img"
          src="/thinkers.svg"
          alt=""
          sx={{
            width: theme.fixedSpacing(theme.tabiyaSpacing.xl * 6),
            flexShrink: 0,
            display: { xs: "none", sm: "block" },
            objectFit: "contain",
          }}
        />

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="h4"
            fontWeight={700}
            color="text.primary"
            sx={{ marginBottom: theme.fixedSpacing(theme.tabiyaSpacing.xs) }}
          >
            {t("careerReadiness.heroTitle")}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ marginBottom: theme.fixedSpacing(theme.tabiyaSpacing.md), lineHeight: 1.6 }}
          >
            {t("careerReadiness.heroDescription")}
          </Typography>
          {upNextModule && <UpNextCard module={upNextModule} />}
        </Box>
      </Box>
    </Box>
  );
};

// ─── Module row ───────────────────────────────────────────────────────────────

interface ModuleRowProps {
  module: ModuleSummary;
  index: number;
}

const ModuleRow: React.FC<ModuleRowProps> = ({ module, index }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const status = mapModuleStatusToDisplay(module.status);
  const isActive = status === "in_progress";
  const isDone = status === "done";

  const handleClick = () => {
    startTransition(() => {
      navigate(`${routerPaths.CAREER_READINESS}/${module.id}`);
    });
  };

  // Shared pill sizing so Chat and Continue → are the same height
  const pillSx = {
    fontSize: theme.typography.caption.fontSize,
    padding: `${theme.fixedSpacing(theme.tabiyaSpacing.xs)} ${theme.fixedSpacing(theme.tabiyaSpacing.sm)}`,
    flexShrink: 0,
    lineHeight: 1.2,
  };

  return (
    <Box
      data-testid={DATA_TEST_ID.CAREER_READINESS_MODULE_ROW}
      onClick={handleClick}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: theme.fixedSpacing(theme.tabiyaSpacing.md),
        paddingY: theme.fixedSpacing(theme.tabiyaSpacing.sm),
        borderBottom: `1px solid ${theme.palette.divider}`,
        cursor: "pointer",
        "&:last-child": { borderBottom: "none" },
        "&:hover": { opacity: 0.8 },
      }}
    >
      {/* Numbered circle */}
      <Box
        sx={{
          width: theme.fixedSpacing(theme.tabiyaSpacing.md * 1.75),
          height: theme.fixedSpacing(theme.tabiyaSpacing.md * 1.75),
          borderRadius: "50%",
          border: `2px solid ${theme.palette.careerReadiness.main}`,
          backgroundColor: isDone ? theme.palette.careerReadiness.main : "transparent",
          color: isDone ? theme.palette.common.white : theme.palette.careerReadiness.main,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          ...theme.typography.caption,
          fontWeight: 700,
        }}
      >
        {index + 1}
      </Box>

      {/* Title + duration */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={isActive ? 700 : 400} color="text.primary">
          {module.title}
        </Typography>
        {isActive && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: theme.fixedSpacing(theme.tabiyaSpacing.xxs),
              marginTop: theme.fixedSpacing(theme.tabiyaSpacing.xxs),
            }}
          >
            <AccessTimeIcon sx={{ fontSize: 12, color: theme.palette.text.secondary }} />
            <Typography sx={{ ...theme.typography.caption, color: theme.palette.text.secondary }}>
              {t("careerReadiness.takes30Min")}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Action pill */}
      {isActive ? (
        <PrimaryButton color="brandAction" sx={pillSx}>
          {t("careerReadiness.continue")} →
        </PrimaryButton>
      ) : !isDone ? (
        <PrimaryButton variant="outlined" color="primary" sx={pillSx}>
          {t("careerReadiness.chat")}
        </PrimaryButton>
      ) : null}
    </Box>
  );
};

// ─── CareerReadinessList ──────────────────────────────────────────────────────

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
      {/* ── Hero: full width white ── */}
      {!loading && <HeroSection upNextModule={upNextModule} />}

      {/* ── Body: greyed-orange bg, two-column ── */}
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
          {/* Modules list */}
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

            {!loading && modules.length === 0 && (
              <Typography variant="body1" color="error" data-testid={DATA_TEST_ID.CAREER_READINESS_LIST_EMPTY}>
                {t("careerReadiness.emptyList")}
              </Typography>
            )}

            <Box data-testid={DATA_TEST_ID.CAREER_READINESS_MODULES_LIST}>
              {modules.map((module, i) => (
                <ModuleRow key={module.id} module={module} index={i} />
              ))}
            </Box>
          </Box>

          {/* Sidebar */}
          {!isMobile && <HomeSidebar />}
        </Box>
      </Box>

      <Footer sx={{ backgroundColor: theme.palette.containerBackground.main }} />
    </Box>
  );
};

export default CareerReadinessList;
