import React, { startTransition } from "react";
import { Box, Button, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { SuggestedAction } from "src/askMeAnything/types";

const uniqueId = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

export const DATA_TEST_ID = {
  AMA_SUGGESTED_ACTIONS_CONTAINER: `ama-suggested-actions-container-${uniqueId}`,
  AMA_SUGGESTED_ACTION_BUTTON: `ama-suggested-action-button-${uniqueId}`,
};

export interface AMASuggestedActionsProps {
  actions: SuggestedAction[];
}

const AMASuggestedActions: React.FC<AMASuggestedActionsProps> = ({ actions }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  if (actions.length === 0) return null;

  return (
    <Box
      display="flex"
      flexWrap="wrap"
      gap={theme.spacing(theme.tabiyaSpacing.xs)}
      mt={theme.spacing(theme.tabiyaSpacing.xs)}
      data-testid={DATA_TEST_ID.AMA_SUGGESTED_ACTIONS_CONTAINER}
    >
      {actions.map((action) => (
        <Button
          key={action.route}
          variant="outlined"
          size="small"
          onClick={() => startTransition(() => navigate(action.route))}
          data-testid={`${DATA_TEST_ID.AMA_SUGGESTED_ACTION_BUTTON}-${action.route}`}
        >
          {action.label}
        </Button>
      ))}
    </Box>
  );
};

export default AMASuggestedActions;
