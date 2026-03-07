import React from "react";
import { Card, CardContent, Typography, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Fieldset } from "src/profile/components/FieldSet/Fieldset";

const uniqueId = "preferences-card-f5c1a2b3-9d4e-5f6a-8b7c-2d3e4f5a6b7c";

export const DATA_TEST_ID = {
  PREFERENCES_CARD: `preferences-card-${uniqueId}`,
  PREFERENCES_TITLE: `preferences-title-${uniqueId}`,
};

export interface PreferencesCardProps {
  language: string | null;
  acceptedTcDate: Date | null;
  isLoading: boolean;
}

/**
 * PreferencesCard displays user preferences (language and terms acceptance date).
 * Shows skeleton loaders while data is loading.
 *
 * @param language - User's preferred language
 * @param acceptedTcDate - Date when user accepted terms and conditions
 * @param isLoading - Whether data is currently being loaded
 */
export const PreferencesCard: React.FC<PreferencesCardProps> = ({ language, acceptedTcDate, isLoading }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Card
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: "none",
        width: "100%",
      }}
      data-testid={DATA_TEST_ID.PREFERENCES_CARD}
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
          data-testid={DATA_TEST_ID.PREFERENCES_TITLE}
        >
          {t("home.profile.preferences")}
        </Typography>

        {isLoading ? (
          <>
            <Fieldset label={t("home.profile.language")} isLoading={true} />
            <Fieldset label={t("home.profile.termsAccepted")} isLoading={true} />
          </>
        ) : (
          <>
            <Fieldset label={t("home.profile.language")} value={language || t("home.profile.notAvailable")} />
            <Fieldset
              label={t("home.profile.termsAccepted")}
              value={acceptedTcDate ? new Date(acceptedTcDate).toLocaleString() : t("home.profile.notAvailable")}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};
