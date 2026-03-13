import React from "react";
import { Box, Chip, useTheme } from "@mui/material";
import { QuickReplyOption } from "src/chat/ChatService/ChatService.types";

const uniqueId = "quick-reply-buttons-3f7a8b2c";

export const DATA_TEST_ID = {
  QUICK_REPLY_CONTAINER: `quick-reply-container-${uniqueId}`,
  QUICK_REPLY_BUTTON: `quick-reply-button-${uniqueId}`,
};

export interface QuickReplyButtonsProps {
  options: QuickReplyOption[];
  onSelect: (label: string) => void;
}

const QuickReplyButtons: React.FC<QuickReplyButtonsProps> = ({ options, onSelect }) => {
  const theme = useTheme();

  if (!options.length) return null;

  return (
    <Box
      data-testid={DATA_TEST_ID.QUICK_REPLY_CONTAINER}
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: theme.spacing(1),
        marginTop: theme.spacing(1),
      }}
    >
      {options.map((option) => (
        <Chip
          key={option.label}
          label={option.label}
          variant="outlined"
          onClick={() => onSelect(option.label)}
          data-testid={DATA_TEST_ID.QUICK_REPLY_BUTTON}
          sx={{
            cursor: "pointer",
            "&:hover": {
              backgroundColor: theme.palette.action.hover,
            },
          }}
        />
      ))}
    </Box>
  );
};

export default QuickReplyButtons;
