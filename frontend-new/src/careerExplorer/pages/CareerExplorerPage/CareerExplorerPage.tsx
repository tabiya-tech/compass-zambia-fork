import React, { useCallback, useEffect, useState } from "react";
import { Box, Typography, useTheme } from "@mui/material";
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

  return (
    <Box width="100%" height="100%" display="flex" flexDirection="column" data-testid={DATA_TEST_ID.CONTAINER}>
      {error && (
        <Box sx={{ paddingX: theme.spacing(theme.tabiyaSpacing.md), pt: 1, flexShrink: 0 }}>
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        </Box>
      )}
      <Box
        sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}
        data-testid={DATA_TEST_ID.MESSAGE_LIST}
      >
        <CareerExplorerChat
          initialMessages={messages}
          placeholderKey="careerExplorer.placeholder"
          isLoading={loading}
        />
      </Box>
    </Box>
  );
};

export default CareerExplorerPage;
