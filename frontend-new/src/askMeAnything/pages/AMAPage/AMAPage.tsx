import React from "react";
import { Box, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { routerPaths } from "src/app/routerPaths";
import PageHeader from "src/home/components/PageHeader/PageHeader";
import AMAChat from "src/askMeAnything/components/AMAChat/AMAChat";

const uniqueId = "d4e5f6a7-b8c9-0123-def0-234567890123";

export const DATA_TEST_ID = {
  AMA_PAGE_CONTAINER: `ama-page-container-${uniqueId}`,
};

const AMAPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: theme.palette.containerBackground.light,
      }}
      data-testid={DATA_TEST_ID.AMA_PAGE_CONTAINER}
    >
      <PageHeader
        title="askMeAnything.pageTitle"
        subtitle="askMeAnything.pageDescription"
        backLinkLabel="home.backToDashboard"
        onBackClick={() => navigate(routerPaths.ROOT)}
      />

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <AMAChat />
      </Box>
    </Box>
  );
};

export default AMAPage;
