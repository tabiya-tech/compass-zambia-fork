import React from "react";
import { Box, useTheme, styled } from "@mui/material";
import ChatList from "src/chat/chatList/ChatList";
import ChatMessageField, { type ChatMessageFieldProps } from "src/chat/ChatMessageField/ChatMessageField";
import QuickReplyButtons from "src/chat/chatMessage/suggestedActions/QuickReplyButtons";
import type { IChatMessage } from "src/chat/Chat.types";
import type { QuickReplyOption } from "src/chat/ChatService/ChatService.types";

const uniqueId = "8f4e2b1a-9c3d-4a5e-b6f7-8a9b0c1d2e3f";

export const DATA_TEST_ID = {
  CHAT_VIEW_CONTAINER: `chat-view-container-${uniqueId}`,
  CHAT_VIEW_MESSAGES_AREA: `chat-view-messages-area-${uniqueId}`,
  CHAT_VIEW_INPUT_AREA: `chat-view-input-area-${uniqueId}`,
  CHAT_VIEW_QUICK_REPLIES_CONTAINER: `chat-view-quick-replies-container-${uniqueId}`,
};

const ChatViewContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  height: "100%",
}));

export interface ChatViewProps {
  /** Array of chat messages to display */
  messages: IChatMessage<any>[];
  /** Quick reply options to display above the input field */
  quickReplyOptions?: QuickReplyOption[] | null;
  /** Callback when a quick reply button is clicked */
  onQuickReplyClick?: (label: string) => void;
  /** Props to pass through to ChatMessageField */
  messageFieldProps: Omit<ChatMessageFieldProps, "fillColor"> & {
    fillColor?: string;
  };
  /** Optional children to render between messages area and input area (e.g., backdrop overlays) */
  children?: React.ReactNode;
}

const ChatView: React.FC<ChatViewProps> = ({
  messages,
  quickReplyOptions,
  onQuickReplyClick,
  messageFieldProps,
  children,
}) => {
  const theme = useTheme();

  return (
    <ChatViewContainer data-testid={DATA_TEST_ID.CHAT_VIEW_CONTAINER}>
      {/* Messages Area - Scrollable */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          paddingX: theme.spacing(theme.tabiyaSpacing.lg),
          paddingTop: theme.spacing(theme.tabiyaSpacing.sm),
        }}
        data-testid={DATA_TEST_ID.CHAT_VIEW_MESSAGES_AREA}
      >
        <ChatList messages={messages} />
      </Box>

      {/* Optional children (e.g., backdrop overlays) */}
      {children}

      {/* Input Area - Fixed at bottom */}
      <Box
        sx={{
          flexShrink: 0,
          padding: theme.tabiyaSpacing.lg,
          paddingTop: theme.tabiyaSpacing.xs,
        }}
        data-testid={DATA_TEST_ID.CHAT_VIEW_INPUT_AREA}
      >
        {/* Quick Reply Buttons */}
        {quickReplyOptions && quickReplyOptions.length > 0 && onQuickReplyClick && (
          <Box
            sx={{ marginBottom: theme.tabiyaSpacing.md }}
            data-testid={DATA_TEST_ID.CHAT_VIEW_QUICK_REPLIES_CONTAINER}
          >
            <QuickReplyButtons options={quickReplyOptions} onSelect={onQuickReplyClick} />
          </Box>
        )}

        {/* Message Input Field */}
        <ChatMessageField {...messageFieldProps} />
      </Box>
    </ChatViewContainer>
  );
};

export default ChatView;
