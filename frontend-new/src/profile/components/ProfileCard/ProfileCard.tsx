import React from "react";
import { Box, Card, CardContent, Skeleton, Typography, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Fieldset } from "src/profile/components/FieldSet/Fieldset";

const uniqueId = "profile-card-a6d2e3f4-7b8c-9d1e-2f3a-4b5c6d7e8f9a";

export const DATA_TEST_ID = {
  PROFILE_CARD: `profile-card-${uniqueId}`,
  PROFILE_TITLE: `profile-title-${uniqueId}`,
};

export interface ProfileCardProps {
  name: string | null;
  location: string | null;
  school: string | null;
  program: string | null;
  year: string | null;
  isLoading: boolean;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ name, location, school, program, year, isLoading }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const avatarSize = 40;

  return (
    <Card
      sx={{ border: `1px solid ${theme.palette.divider}`, boxShadow: "none" }}
      data-testid={DATA_TEST_ID.PROFILE_CARD}
    >
      <CardContent
        sx={{
          padding: theme.fixedSpacing(theme.tabiyaSpacing.lg),
          "&:last-child": { paddingBottom: theme.fixedSpacing(theme.tabiyaSpacing.lg) },
        }}
      >
        {/* Avatar + name header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: theme.fixedSpacing(theme.tabiyaSpacing.md),
            marginBottom: theme.fixedSpacing(theme.tabiyaSpacing.md),
          }}
        >
          {isLoading ? (
            <Skeleton variant="circular" width={avatarSize} height={avatarSize} />
          ) : (
            <Box
              sx={{
                width: avatarSize,
                height: avatarSize,
                borderRadius: theme.rounding(theme.tabiyaRounding.full),
                backgroundColor: theme.palette.primary.main,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ color: theme.palette.primary.contrastText, fontWeight: 700, lineHeight: 1 }}
              >
                {name ? name.charAt(0).toUpperCase() : "?"}
              </Typography>
            </Box>
          )}
          <Box>
            {isLoading ? (
              <>
                <Skeleton variant="text" sx={{ width: 160, fontSize: "1rem" }} />
                <Skeleton variant="text" sx={{ width: 100, fontSize: "0.75rem" }} />
              </>
            ) : (
              <>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 700, lineHeight: 1.3 }}
                  data-testid={DATA_TEST_ID.PROFILE_TITLE}
                >
                  {name || t("home.profile.notAvailable")}
                </Typography>
                {location && (
                  <Typography variant="caption" color="text.secondary">
                    {location}
                  </Typography>
                )}
              </>
            )}
          </Box>
        </Box>

        {/* Two-column grid of fields */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            columnGap: theme.fixedSpacing(theme.tabiyaSpacing.lg),
          }}
        >
          {isLoading ? (
            <>
              <Fieldset label={t("home.profile.school")} isLoading />
              <Fieldset label={t("home.profile.program")} isLoading />
              <Fieldset label={t("home.profile.year")} isLoading />
              <Fieldset label={t("home.profile.location")} isLoading />
            </>
          ) : (
            <>
              <Fieldset label={t("home.profile.school")} value={school || t("home.profile.notAvailable")} />
              <Fieldset label={t("home.profile.program")} value={program || t("home.profile.notAvailable")} />
              <Fieldset label={t("home.profile.year")} value={year || t("home.profile.notAvailable")} />
              <Fieldset label={t("home.profile.location")} value={location || t("home.profile.notAvailable")} />
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
