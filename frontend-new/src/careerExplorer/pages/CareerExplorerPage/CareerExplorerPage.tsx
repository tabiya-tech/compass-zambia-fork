import React, { useCallback, useEffect, useState } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import PageHeader from "src/home/components/PageHeader/PageHeader";
import { routerPaths } from "src/app/routerPaths";
import CareerExplorerChat from "src/careerExplorer/components/CareerExplorerChat/CareerExplorerChat";
import CareerExplorerService from "src/careerExplorer/services/CareerExplorerService";
import type { CareerExplorerMessage } from "src/careerExplorer/types";

const uniqueId = "career-explorer-page-001";
export const DATA_TEST_ID = {
  CONTAINER: `career-explorer-container-${uniqueId}`,
  MESSAGE_LIST: `career-explorer-messages-${uniqueId}`,
};

const CareerExplorerPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<CareerExplorerMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrCreateConversation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await CareerExplorerService.getInstance().getOrCreateConversation();
      setMessages(res.messages);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrCreateConversation();
  }, [loadOrCreateConversation]);

  if (loading && messages.length === 0) {
    return (
      <Box width="100%" height="100%" display="flex" flexDirection="column" data-testid={DATA_TEST_ID.CONTAINER}>
        <PageHeader
          title="careerExplorer.title"
          backLinkLabel="home.backToDashboard"
          onBackClick={() => navigate(routerPaths.ROOT)}
        />
      </Box>
    );
  }

  return (
    <Box
      width="100%"
      height="100%"
      display="flex"
      flexDirection="column"
      position="relative"
      sx={{ backgroundColor: theme.palette.containerBackground.light }}
      data-testid={DATA_TEST_ID.CONTAINER}
    >
      <PageHeader
        title="careerExplorer.title"
        backLinkLabel="home.backToDashboard"
        onBackClick={() => navigate(routerPaths.ROOT)}
      />
      {error && (
        <Box sx={{ paddingX: theme.spacing(theme.tabiyaSpacing.md), pt: 1 }}>
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        </Box>
      )}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
        }}
        data-testid={DATA_TEST_ID.MESSAGE_LIST}
      >
        <CareerExplorerChat initialMessages={messages} placeholderKey="careerExplorer.placeholder" />
      </Box>
    </Box>
  );
};

export default CareerExplorerPage;
