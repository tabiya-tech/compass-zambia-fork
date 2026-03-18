import React from "react";
import { Box, Button, Container, Typography, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { routerPaths } from "src/app/routerPaths";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

const uniqueId = "not-found-page-4f5e6d7c-8b9a-0c1d-2e3f-4a5b6c7d8e9f";

export const DATA_TEST_ID = {
  NOT_FOUND_PAGE_CONTAINER: `${uniqueId}-container`,
  NOT_FOUND_PAGE_TITLE: `${uniqueId}-title`,
  NOT_FOUND_PAGE_MESSAGE: `${uniqueId}-message`,
  NOT_FOUND_PAGE_HOME_BUTTON: `${uniqueId}-home-button`,
};

export interface NotFoundProps {}

const NotFound: React.FC<NotFoundProps> = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate(routerPaths.ROOT);
  };

  return (
    <Container maxWidth="sm" data-testid={DATA_TEST_ID.NOT_FOUND_PAGE_CONTAINER}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          textAlign: "center",
        }}
      >
        <ErrorOutlineIcon
          sx={{
            fontSize: 100,
            color: theme.palette.warning.main,
            mb: 2,
          }}
        />

        <Typography variant="h1" component="h1" gutterBottom data-testid={DATA_TEST_ID.NOT_FOUND_PAGE_TITLE}>
          404
        </Typography>

        <Typography
          variant="h5"
          component="h2"
          color="textSecondary"
          gutterBottom
          data-testid={DATA_TEST_ID.NOT_FOUND_PAGE_MESSAGE}
        >
          {t("notFound.message")}
        </Typography>

        <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
          {t("notFound.description")}
        </Typography>

        <Button variant="contained" onClick={handleGoHome} data-testid={DATA_TEST_ID.NOT_FOUND_PAGE_HOME_BUTTON}>
          {t("notFound.goHome")}
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound;
