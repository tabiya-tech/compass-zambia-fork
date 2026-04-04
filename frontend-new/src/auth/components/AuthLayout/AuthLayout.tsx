import React, { useCallback, useState } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { Outlet } from "react-router-dom";
import AuthPageShell, { layoutContentColumnSx } from "src/auth/components/AuthPageShell/AuthPageShell";
import Footer from "src/home/components/Footer/Footer";
import { getDarkLogoUrl, getLogoUrl, getProductName } from "src/envService";
import { AuthPageProvider } from "src/auth/components/AuthLayout/AuthPageContext";
import { Backdrop } from "src/theme/Backdrop/Backdrop";
import BugReportButton from "src/feedback/bugReport/bugReportButton/BugReportButton";

const FeatureColumn: React.FC<{ imageSrc: string; title: string; body: string }> = ({ imageSrc, title, body }) => (
  <Box sx={{ textAlign: "center", px: { xs: 1, md: 0 } }}>
    <Box component="img" src={imageSrc} alt="" sx={{ width: "100%", maxWidth: 160, height: "auto", mx: "auto" }} />
    <Typography variant="h3" sx={{ mb: 1, maxWidth: 250, mx: "auto" }}>
      {title}
    </Typography>
    <Typography variant="body1">{body}</Typography>
  </Box>
);

const AuthLayout: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [loadingState, setLoadingState] = useState({
    isLoading: false,
    loadingMessage: undefined as string | undefined,
  });

  const handleStateChange = useCallback(
    ({ isLoading, loadingMessage }: { isLoading: boolean; loadingMessage?: string }) => {
      setLoadingState({ isLoading, loadingMessage });
    },
    []
  );

  const logoSrc = getDarkLogoUrl() || getLogoUrl() || `${process.env.PUBLIC_URL}/njila_logo-red.svg`;
  const appName = getProductName() || "Njila";

  const whiteBandContent = (
    <Box
      sx={{
        display: "grid",
        position: "relative",
        mt: { xs: 0, md: -4 },
        gridTemplateColumns: {
          xs: "1fr",
          md: "minmax(0, 1fr) minmax(200px, 300px) minmax(280px, 420px)",
        },
        columnGap: { md: 2 },
        rowGap: { xs: 3, md: 0 },
        alignItems: { xs: "center", md: "flex-end" },
      }}
    >
      <Box sx={{ minWidth: 0, position: "relative", zIndex: 2 }}>
        <Typography variant="h1" sx={{ marginBottom: theme.fixedSpacing(theme.tabiyaSpacing.xs) }}>
          {t("auth.pages.login.appHero.discoverLine")}
          <Box component="span" sx={{ color: theme.palette.brandAction.main }}>
            .
          </Box>
        </Typography>
        <Typography variant="h1" sx={{ color: theme.palette.primary.dark }}>
          {t("auth.pages.login.appHero.skillsLine")}
        </Typography>
        <Typography variant="body1">{t("auth.pages.login.appHero.subheadline")}</Typography>
      </Box>

      <Box
        sx={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: { xs: "center", md: "flex-end" },
          transform: { md: "translateX(40px)" },
          minHeight: { md: 220 },
          width: "100%",
          maxWidth: { md: 300 },
          zIndex: 3,
        }}
      >
        <Box
          component="img"
          src={`${process.env.PUBLIC_URL}/climber.svg`}
          alt=""
          sx={{
            width: "100%",
            maxWidth: { xs: 260, md: 280 },
            height: "auto",
            display: "block",
            position: { md: "absolute" },
            left: { md: "50%" },
            top: { md: "-20%" },
            transform: { md: "translateX(-50%)" },
            objectFit: "contain",
          }}
        />
      </Box>

      <Box
        sx={{
          width: "100%",
          maxWidth: "480px",
          maxHeight: "520px",
          mx: { xs: "auto", md: 0 },
          transform: { md: "translateY(80px)" },
          zIndex: 2,
        }}
      >
        <Box
          sx={{
            backgroundColor: theme.palette.brandAction.main,
            borderRadius: 2,
            p: theme.fixedSpacing(4),
            height: "100%",
            maxHeight: "100%",
            overflowY: "auto",
            overflowX: "hidden",
            boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.12)}`,
            color: theme.palette.common.white,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );

  return (
    <AuthPageProvider onStateChange={handleStateChange}>
      <AuthPageShell logoUrl={logoSrc} whiteBandContent={whiteBandContent}>
        <Box
          sx={{
            ...layoutContentColumnSx,
            pt: { xs: 3, md: 6 },
            pb: { xs: 3, md: 4 },
          }}
        >
          <Typography variant="h2" sx={{ fontWeight: 700, textAlign: "start", mb: 3 }}>
            {t("auth.pages.login.appHero.whatIsTitleBefore")}{" "}
            <Box component="span" sx={{ color: theme.palette.brandAction.main }}>
              {t("auth.pages.login.appHero.whatIsTitleBrand", { appName })}
            </Box>
            ?
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
              gap: { xs: 3, md: 4 },
              mb: { xs: 2, md: 3 },
            }}
          >
            <FeatureColumn
              imageSrc={`${process.env.PUBLIC_URL}/conversation.svg`}
              title={t("auth.pages.login.appHero.feature1Title")}
              body={t("auth.pages.login.appHero.feature1Body")}
            />
            <FeatureColumn
              imageSrc={`${process.env.PUBLIC_URL}/resume.svg`}
              title={t("auth.pages.login.appHero.feature2Title")}
              body={t("auth.pages.login.appHero.feature2Body")}
            />
            <FeatureColumn
              imageSrc={`${process.env.PUBLIC_URL}/runner-v2.svg`}
              title={t("auth.pages.login.appHero.feature3Title")}
              body={t("auth.pages.login.appHero.feature3Body")}
            />
          </Box>
        </Box>

        <Footer sx={{ mt: "auto", backgroundColor: theme.palette.common.cream }} />
      </AuthPageShell>
      <BugReportButton bottomAlign={true} />
      <Backdrop isShown={loadingState.isLoading} message={loadingState.loadingMessage} />
    </AuthPageProvider>
  );
};

export default AuthLayout;
