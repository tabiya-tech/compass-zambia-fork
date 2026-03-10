import React, { startTransition } from "react";
import { Box, Chip, IconButton, TextField, Typography, useTheme } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useNavigate } from "react-router-dom";
import type { AMAMessage, SuggestedAction } from "src/askMeAnything/types";

const MAX_MESSAGE_LENGTH = 500;
const DISALLOWED_CHARACTERS = /["\\{}[\]*_#`<>~|]/g;

export interface MascotChatThreadProps {
  messages: AMAMessage[];
  aiIsTyping: boolean;
  onSend: (text: string) => void;
  placeholder: string;
}

const MascotChatThread: React.FC<MascotChatThreadProps> = ({ messages, aiIsTyping, onSend, placeholder }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [input, setInput] = React.useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value.replace(DISALLOWED_CHARACTERS, ""));
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || trimmed.length > MAX_MESSAGE_LENGTH || aiIsTyping) return;
    onSend(trimmed);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleActionClick = (route: string) => {
    startTransition(() => navigate(route));
  };

  const latestAgent = messages.filter((m) => m.sender === "AGENT").pop();
  const suggestedActions = latestAgent?.suggested_actions ?? [];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
      }}
    >
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          paddingY: 0,
          display: "flex",
          flexDirection: "column",
          gap: theme.spacing(theme.tabiyaSpacing.xs),
        }}
      >
        {aiIsTyping ? (
          <Box sx={{ alignSelf: "flex-start" }}>
            <Box
              sx={{
                padding: theme.spacing(theme.tabiyaSpacing.sm),
                borderRadius: theme.rounding(theme.tabiyaRounding.sm),
                backgroundColor: theme.palette.grey[100],
              }}
            >
              <Typography variant="body2" sx={{ fontSize: "0.813rem", color: theme.palette.text.secondary }}>
                ...
              </Typography>
            </Box>
          </Box>
        ) : latestAgent ? (
          <Box sx={{ alignSelf: "flex-start", maxWidth: "100%" }}>
            <Box
              sx={{
                padding: theme.spacing(theme.tabiyaSpacing.sm),
                borderRadius: theme.rounding(theme.tabiyaRounding.sm),
                backgroundColor: theme.palette.grey[100],
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontSize: "0.813rem",
                  lineHeight: 1.35,
                  whiteSpace: "pre-line",
                  wordBreak: "break-word",
                }}
              >
                {latestAgent.message}
              </Typography>
            </Box>
            {suggestedActions.length > 0 && (
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: theme.spacing(theme.tabiyaSpacing.xxs),
                  marginTop: theme.spacing(theme.tabiyaSpacing.xs),
                }}
              >
                {suggestedActions.map((action: SuggestedAction) => (
                  <Chip
                    key={action.route}
                    label={action.label}
                    size="small"
                    onClick={() => handleActionClick(action.route)}
                    sx={{
                      fontSize: "0.7rem",
                      height: 24,
                      "& .MuiChip-label": { paddingX: 1 },
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>
        ) : null}
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: theme.spacing(theme.tabiyaSpacing.xs),
          flexShrink: 0,
          paddingTop: theme.spacing(theme.tabiyaSpacing.xs),
        }}
      >
        <TextField
          size="small"
          fullWidth
          placeholder={placeholder}
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={aiIsTyping}
          inputProps={{ maxLength: MAX_MESSAGE_LENGTH }}
          sx={{
            "& .MuiInputBase-input": { fontSize: "0.813rem" },
          }}
        />
        <IconButton size="small" onClick={handleSend} disabled={aiIsTyping || !input.trim()} sx={{ flexShrink: 0 }}>
          <SendIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
};

export default MascotChatThread;
