import React from "react";
import { Box, styled } from "@mui/material";
import { ConversationMessageSender, QuickReplyOption } from "src/chat/ChatService/ChatService.types";
import ChatBubble from "src/chat/chatMessage/components/chatBubble/ChatBubble";
import BrandLogo from "src/chat/chatMessage/components/brandLogo/BrandLogo";

const uniqueId = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

export const DATA_TEST_ID = {
  CAREER_EXPLORER_AGENT_MESSAGE_CONTAINER: `career-explorer-agent-message-container-${uniqueId}`,
  CAREER_EXPLORER_AGENT_MESSAGE_BRAND_LOGO: `career-explorer-agent-message-brand-logo-${uniqueId}`,
};

export const CAREER_EXPLORER_AGENT_MESSAGE_TYPE = `career-explorer-agent-message-${uniqueId}`;

export interface CareerExplorerAgentMessageProps {
  message_id: string;
  message: string;
  sent_at: string;
  quick_reply_options?: QuickReplyOption[] | null;
  onQuickReplyClick?: (label: string) => void;
}

const MessageContainer = styled(Box)<{ origin: ConversationMessageSender }>(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "flex-start",
  marginBottom: theme.spacing(theme.tabiyaSpacing.sm),
  width: "100%",
}));

const CareerExplorerAgentMessage: React.FC<CareerExplorerAgentMessageProps> = ({
  message_id,
  message,
  sent_at,
  quick_reply_options,
  onQuickReplyClick,
}) => {
  return (
    <MessageContainer
      origin={ConversationMessageSender.COMPASS}
      data-testid={`${DATA_TEST_ID.CAREER_EXPLORER_AGENT_MESSAGE_CONTAINER}-${message_id}`}
    >
      <Box data-testid={DATA_TEST_ID.CAREER_EXPLORER_AGENT_MESSAGE_BRAND_LOGO}>
        <BrandLogo />
      </Box>
      <Box
        sx={{
          width: "fit-content",
          minWidth: "30%",
          maxWidth: "80%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <Box sx={{ width: "100%" }}>
          <ChatBubble message={message} sender={ConversationMessageSender.COMPASS} />
        </Box>
      </Box>
    </MessageContainer>
  );
};

export default CareerExplorerAgentMessage;
