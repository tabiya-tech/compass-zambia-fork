import React from "react";
import { Card, CardContent, Typography, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Fieldset } from "src/profile/components/FieldSet/Fieldset";

const uniqueId = "security-card-e4b9f2d1-8a3c-4e5f-9b7d-1c2a3b4d5e6f";

export const DATA_TEST_ID = {
  SECURITY_CARD: `security-card-${uniqueId}`,
  SECURITY_TITLE: `security-title-${uniqueId}`,
};

export interface SecurityCardProps {
  email: string | null;
  isLoading: boolean;
}

/**
 * SecurityCard displays user security information (email address).
 * Shows skeleton loaders while data is loading.
 *
 * @param email - User's email address from Firebase Auth
 * @param isLoading - Whether data is currently being loaded
 */
export const SecurityCard: React.FC<SecurityCardProps> = ({ email, isLoading }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Card
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: "none",
        width: "100%",
      }}
      data-testid={DATA_TEST_ID.SECURITY_CARD}
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
          data-testid={DATA_TEST_ID.SECURITY_TITLE}
        >
          {t("home.profile.security")}
        </Typography>

        {isLoading ? (
          <Fieldset label={t("home.profile.email")} isLoading={true} />
        ) : (
          <Fieldset label={t("home.profile.email")} value={email || t("home.profile.notAvailable")} />
        )}
      </CardContent>
    </Card>
  );
};
