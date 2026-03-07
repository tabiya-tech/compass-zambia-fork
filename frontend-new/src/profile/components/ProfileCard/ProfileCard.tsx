import React from "react";
import { Card, CardContent, Typography, useTheme } from "@mui/material";
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

/**
 * ProfileCard displays user's plain personal data (name, location, school, program, year).
 * Shows skeleton loaders while data is loading.
 *
 * @param name - User's name
 * @param location - User's location
 * @param school - User's school
 * @param program - User's program
 * @param year - User's year
 * @param isLoading - Whether data is currently being loaded
 */
export const ProfileCard: React.FC<ProfileCardProps> = ({ name, location, school, program, year, isLoading }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Card
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: "none",
      }}
      data-testid={DATA_TEST_ID.PROFILE_CARD}
    >
      <CardContent
        sx={{
          padding: theme.spacing(theme.tabiyaSpacing.lg),
        }}
      >
        <Typography
          variant="h6"
          sx={{
            marginBottom: theme.spacing(theme.tabiyaSpacing.md),
            fontWeight: "bold",
          }}
          data-testid={DATA_TEST_ID.PROFILE_TITLE}
        >
          {t("home.profile.profileSection")}
        </Typography>

        {isLoading ? (
          <>
            <Fieldset label={t("home.profile.name")} isLoading={true} />
            <Fieldset label={t("home.profile.location")} isLoading={true} />
            <Fieldset label={t("home.profile.school")} isLoading={true} />
            <Fieldset label={t("home.profile.program")} isLoading={true} />
            <Fieldset label={t("home.profile.year")} isLoading={true} />
          </>
        ) : (
          <>
            <Fieldset label={t("home.profile.name")} value={name || t("home.profile.notAvailable")} />
            <Fieldset label={t("home.profile.location")} value={location || t("home.profile.notAvailable")} />
            <Fieldset label={t("home.profile.school")} value={school || t("home.profile.notAvailable")} />
            <Fieldset label={t("home.profile.program")} value={program || t("home.profile.notAvailable")} />
            <Fieldset label={t("home.profile.year")} value={year || t("home.profile.notAvailable")} />
          </>
        )}
      </CardContent>
    </Card>
  );
};
