import React from "react";
import { Box, Button, Container, Paper, TextField, Typography, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { routerPaths } from "src/app/routerPaths";

const uniqueId = "login-page-5a8f3b2c-1d4e-4f6a-9b8c-7e2d1f0a3b5c";

export const DATA_TEST_ID = {
  LOGIN_PAGE_CONTAINER: `${uniqueId}-container`,
  LOGIN_PAGE_TITLE: `${uniqueId}-title`,
  LOGIN_PAGE_EMAIL_INPUT: `${uniqueId}-email-input`,
  LOGIN_PAGE_PASSWORD_INPUT: `${uniqueId}-password-input`,
  LOGIN_PAGE_SUBMIT_BUTTON: `${uniqueId}-submit-button`,
};

export interface LoginProps {}

const Login: React.FC<LoginProps> = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // TODO: Implement actual login logic
    navigate(routerPaths.DASHBOARD);
  };

  return (
    <Container maxWidth="sm" data-testid={DATA_TEST_ID.LOGIN_PAGE_CONTAINER}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: theme.spacing(4),
            width: "100%",
            borderRadius: theme.tabiyaRounding.sm,
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            textAlign="center"
            data-testid={DATA_TEST_ID.LOGIN_PAGE_TITLE}
          >
            {t("login.title")}
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label={t("login.email")}
              type="email"
              margin="normal"
              required
              data-testid={DATA_TEST_ID.LOGIN_PAGE_EMAIL_INPUT}
            />
            <TextField
              fullWidth
              label={t("login.password")}
              type="password"
              margin="normal"
              required
              data-testid={DATA_TEST_ID.LOGIN_PAGE_PASSWORD_INPUT}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              data-testid={DATA_TEST_ID.LOGIN_PAGE_SUBMIT_BUTTON}
            >
              {t("login.submit")}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
