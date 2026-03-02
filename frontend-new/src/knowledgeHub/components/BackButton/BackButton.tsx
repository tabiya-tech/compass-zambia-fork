import React from "react";
import { Button, useTheme } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useTranslation } from "react-i18next";
import { TranslationKey } from "src/react-i18next";

const uniqueId = "a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d";

export const DATA_TEST_ID = {
  BACK_BUTTON: `back-button-${uniqueId}`,
};

export interface BackButtonProps {
  onClick: () => void;
  labelKey: string; // Translation key for the button text
  dataTestId?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ onClick, labelKey, dataTestId }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Button
      startIcon={<ArrowBackIcon />}
      onClick={onClick}
      data-testid={dataTestId || DATA_TEST_ID.BACK_BUTTON}
      sx={{
        color: theme.palette.text.secondary,
        textTransform: "none",
        padding: theme.spacing(theme.tabiyaSpacing.xs, theme.tabiyaSpacing.sm),
        "&:hover": {
          backgroundColor: theme.palette.action.hover,
        },
      }}
    >
      {t(labelKey as TranslationKey)}
    </Button>
  );
};

export default BackButton;
