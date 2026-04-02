import React from "react";
import { Box, Container, Typography, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import AuthPageShell from "src/auth/components/AuthPageShell/AuthPageShell";
import Footer from "src/home/components/Footer/Footer";
import { getLogoUrl, getProductName } from "src/envService";

export type AuthLayoutProps = {
  children: React.ReactNode;
  contentTestId?: string;
};

const FeatureColumn: React.FC<{ imageSrc: string; title: string; body: string }> = ({ imageSrc, title, body }) => (
  <Box sx={{ textAlign: "center", px: { xs: 1, md: 0 } }}>
    <Box component="img" src={imageSrc} alt="" sx={{ width: "100%", maxWidth: 160, height: "auto", mx: "auto" }} />
    <Typography variant="h3" sx={{ mb: 1, maxWidth: 250, mx: "auto" }}>
      {title}
    </Typography>
    <Typography variant="body1">{body}</Typography>
  </Box>
);

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, contentTestId }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const logoSrc = getLogoUrl() || `${process.env.PUBLIC_URL}/njila_logo-red.svg`;
  const appName = getProductName() || "Njila";

  const whiteBandContent = (
    <Box
      sx={{
        display: "grid",
        mt: { xs: 8, md: 6 },
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
          maxWidth: "480px",
          maxHeight: "560px",
          width: "fit-content",
          height: "fit-content",
          mx: { xs: "auto", md: 0 },
          zIndex: 2,
        }}
      >
        <Box
          sx={{
            backgroundColor: theme.palette.brandAction.main,
            borderRadius: 2,
            p: theme.fixedSpacing(4),
            height: { xs: "auto", md: "100%" },
            boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.12)}`,
            color: theme.palette.common.white,
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );

  return (
    <AuthPageShell logoUrl={logoSrc} whiteContainerTestId={contentTestId} whiteBandContent={whiteBandContent}>
      <Container sx={{ maxWidth: "lg", px: { xs: 2, md: 3 }, pt: { xs: 3, md: 6 }, pb: { xs: 3, md: 4 } }}>
        <Typography variant="h2" sx={{ fontWeight: 700, textAlign: "start", mb: 3 }}>
          {t("auth.pages.login.appHero.whatIsTitleBefore")}{" "}
          <Box component="span" color="primary">
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
      </Container>

      <Footer sx={{ mt: "auto", backgroundColor: theme.palette.common.cream }} />
    </AuthPageShell>
  );
};

export default AuthLayout;
