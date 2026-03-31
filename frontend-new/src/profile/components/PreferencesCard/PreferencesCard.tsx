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

export const PreferencesCard: React.FC<PreferencesCardProps> = ({ language, acceptedTcDate, isLoading }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Card
      sx={{ border: `1px solid ${theme.palette.divider}`, boxShadow: "none", width: "100%" }}
      data-testid={DATA_TEST_ID.PREFERENCES_CARD}
    >
      <CardContent
        sx={{
          padding: theme.fixedSpacing(theme.tabiyaSpacing.lg),
          "&:last-child": { paddingBottom: theme.fixedSpacing(theme.tabiyaSpacing.lg) },
        }}
      >
        <Typography
          variant="subtitle1"
          fontWeight="bold"
          color="text.primary"
          sx={{ marginBottom: theme.fixedSpacing(theme.tabiyaSpacing.sm) }}
          data-testid={DATA_TEST_ID.PREFERENCES_TITLE}
        >
          {t("home.profile.preferences")}
        </Typography>

        {isLoading ? (
          <>
            <Fieldset label={t("home.profile.language")} isLoading />
            <Fieldset label={t("home.profile.termsAccepted")} isLoading />
          </>
        ) : (
          <>
            <Fieldset label={t("home.profile.language")} value={language || t("home.profile.notAvailable")} />
            <Fieldset
              label={t("home.profile.termsAccepted")}
              value={
                acceptedTcDate
                  ? new Date(acceptedTcDate).toLocaleDateString(undefined, { dateStyle: "medium" })
                  : t("home.profile.notAvailable")
              }
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};
