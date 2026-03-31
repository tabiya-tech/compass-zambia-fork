import React, { startTransition } from "react";
import { alpha } from "@mui/material/styles";
import { Box, Button, Grid, Typography, useTheme } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { routerPaths } from "src/app/routerPaths";
import PrimaryButton from "src/theme/PrimaryButton/PrimaryButton";

const uniqueId = "b2c3d4e5-f6a7-8901-bcde-f23456789012";

export const DATA_TEST_ID = {
  HOME_CTA_GRID: `home-cta-grid-${uniqueId}`,
  HOME_CTA_CARD: `home-cta-card-${uniqueId}`,
};

const splitTitle = (title: string): { lead: string; tail: string } => {
  const [lead, ...rest] = title.trim().split(" ");
  return { lead: lead ?? "", tail: rest.join(" ") };
};

const CtaTitle: React.FC<{ title: string; leadColor: string; tailColor: string }> = ({
  title,
  leadColor,
  tailColor,
}) => {
  const { lead, tail } = splitTitle(title);
  return (
    <Typography variant="h3" sx={{ color: leadColor, marginBottom: 1 }}>
      <Box component="span" sx={{ display: "block" }}>
        {lead}
      </Box>
      {tail && (
        <Box component="span" sx={{ display: "block", color: tailColor }}>
          {tail}
        </Box>
      )}
    </Typography>
  );
};

const circleIconSx = (bg: string, fg: string) => ({
  width: 36,
  height: 36,
  borderRadius: "50%",
  bgcolor: bg,
  color: fg,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  transition: "transform 0.2s ease",
  "button:hover:not(:disabled) &": { transform: "translateX(3px)" },
});

interface CtaCardProps {
  testKey: "profile" | "paths" | "jobs";
  title: string;
  description: string;
  cta: string;
  onClick: () => void;
  backgroundColor: string;
  titleLeadColor: string;
  titleTailColor: string;
  descriptionColor: string;
  filledButton?: {
    bgColor: string;
    textColor: string;
  };
  outlinedButton?: {
    color: "brandAction" | "secondary";
    bgColor: string;
    textColor: string;
  };
}

const HomeCtaCard: React.FC<CtaCardProps> = ({
  testKey,
  title,
  description,
  cta,
  onClick,
  backgroundColor,
  titleLeadColor,
  titleTailColor,
  descriptionColor,
  filledButton,
  outlinedButton,
}) => {
  const theme = useTheme();
  const contentPadding = theme.fixedSpacing(theme.tabiyaSpacing.lg);

  return (
    <Grid size={{ xs: 12, sm: 4 }}>
      <Box
        data-testid={`${DATA_TEST_ID.HOME_CTA_CARD}-${testKey}`}
        sx={{
          backgroundColor,
          borderRadius: 0,
          paddingTop: contentPadding,
          paddingBottom: contentPadding,
          paddingLeft: "var(--layout-gutter-x)",
          paddingRight: "var(--layout-gutter-x)",
          minHeight: { xs: "auto", sm: 240 },
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          height: "100%",
        }}
      >
        <CtaTitle title={title} leadColor={titleLeadColor} tailColor={titleTailColor} />
        <Typography
          variant="body2"
          sx={{
            color: descriptionColor,
            marginBottom: theme.fixedSpacing(theme.tabiyaSpacing.md),
            flex: 1,
            lineHeight: 1.5,
          }}
        >
          {description}
        </Typography>

        {filledButton ? (
          <Button
            type="button"
            variant="contained"
            disableElevation
            onClick={onClick}
            sx={{
              alignSelf: "flex-start",
              borderRadius: "999px",
              fontWeight: 600,
              textTransform: "none",
              gap: 1.5,
              padding: "6px 6px 6px 22px",
              bgcolor: filledButton.bgColor,
              color: filledButton.textColor,
              "&:hover": { bgcolor: theme.palette.grey[100] },
            }}
          >
            {cta}
            <Box sx={circleIconSx(filledButton.textColor, filledButton.bgColor)}>
              <ArrowForwardIcon sx={{ fontSize: 18 }} />
            </Box>
          </Button>
        ) : (
          <PrimaryButton
            type="button"
            color={outlinedButton?.color}
            variant="outlined"
            showCircle
            onClick={onClick}
            sx={{
              alignSelf: "flex-start",
              bgcolor: outlinedButton?.bgColor,
              color: outlinedButton?.textColor,
            }}
          >
            {cta}
          </PrimaryButton>
        )}
      </Box>
    </Grid>
  );
};

const HomeCtaGrid: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const go = (path: string) => {
    startTransition(() => {
      navigate(path);
    });
  };

  const profileCardBg = theme.palette.primary.main;
  const profileCardText = theme.palette.common.white;
  const pathwaysCardBg = theme.palette.brandAction.main;

  return (
    <Grid
      container
      spacing={0}
      data-testid={DATA_TEST_ID.HOME_CTA_GRID}
      sx={{
        position: "relative",
        zIndex: 0,
        marginLeft: "calc(var(--layout-gutter-x) * -1)",
        marginRight: "calc(var(--layout-gutter-x) * -1)",
        width: "calc(100% + (var(--layout-gutter-x) * 2))",
      }}
    >
      <HomeCtaCard
        testKey="profile"
        title={t("home.cta.buildProfileTitle")}
        description={t("home.cta.buildProfileDesc")}
        cta={t("home.cta.buildProfileCta")}
        onClick={() => go(routerPaths.SKILLS_INTERESTS)}
        backgroundColor={profileCardBg}
        titleLeadColor={profileCardText}
        titleTailColor={alpha(profileCardText, 0.8)}
        descriptionColor={profileCardText}
        filledButton={{
          bgColor: theme.palette.common.cream,
          textColor: profileCardBg,
        }}
      />

      <HomeCtaCard
        testKey="paths"
        title={t("home.cta.explorePathsTitle")}
        description={t("home.cta.explorePathsDesc")}
        cta={t("home.cta.explorePathsCta")}
        onClick={() => go(routerPaths.CAREER_EXPLORER)}
        backgroundColor={pathwaysCardBg}
        titleLeadColor={theme.palette.common.white}
        titleTailColor={alpha(theme.palette.common.white, 0.8)}
        descriptionColor={theme.palette.common.white}
        filledButton={{
          bgColor: theme.palette.common.cream,
          textColor: pathwaysCardBg,
        }}
      />

      <HomeCtaCard
        testKey="jobs"
        title={t("home.cta.jobMatchesTitle")}
        description={t("home.cta.jobMatchesDesc")}
        cta={t("home.cta.jobMatchesCta")}
        onClick={() => go(routerPaths.JOB_MATCHING)}
        backgroundColor={theme.palette.common.cream}
        titleLeadColor={theme.palette.secondary.main}
        titleTailColor={theme.palette.secondary.main}
        descriptionColor={theme.palette.text.primary}
        outlinedButton={{
          color: "secondary",
          bgColor: theme.palette.common.cream,
          textColor: theme.palette.secondary.main,
        }}
      />
    </Grid>
  );
};

export default HomeCtaGrid;
