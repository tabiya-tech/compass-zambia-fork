import React, { useCallback } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import AuthenticationStateService from "src/auth/services/AuthenticationState.service";
import FirebaseEmailAuthenticationService from "src/auth/services/FirebaseAuthenticationService/FirebaseEmailAuthenticationService";
import UserStateService from "src/userState/UserStateService";
import Navbar from "src/theme/Navbar/Navbar";

const uniqueId = "home-page-8d7e6f5a-4b3c-2d1e-0f9a-8b7c6d5e4f3a";

export const DATA_TEST_ID = {
  HOME_PAGE_CONTAINER: `${uniqueId}-container`,
  HOME_PAGE_CONTENT: `${uniqueId}-content`,
  HOME_PAGE_TITLE: `${uniqueId}-title`,
};

export interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  const handleLogout = useCallback(async () => {
    try {
      await FirebaseEmailAuthenticationService.getInstance().logout();
      AuthenticationStateService.getInstance().clearUser();
      UserStateService.getInstance().clearUserState();
      window.location.reload();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, []);

  return (
    <Box
      data-testid={DATA_TEST_ID.HOME_PAGE_CONTAINER}
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Navbar onLogout={handleLogout} />

      {/* Main Content Area */}
      <Box
        data-testid={DATA_TEST_ID.HOME_PAGE_CONTENT}
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: theme.fixedSpacing(theme.tabiyaSpacing.lg),
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          data-testid={DATA_TEST_ID.HOME_PAGE_TITLE}
          sx={{
            color: theme.palette.text.primary,
            textAlign: "center",
          }}
        >
          {t("admin.dashboard.welcome", "Welcome to the Admin Portal")}
        </Typography>
      </Box>
    </Box>
  );
};

export default Home;
