import React from "react";
import { Box, styled } from "@mui/material";
import { ConversationMessageSender, QuickReplyOption } from "src/chat/ChatService/ChatService.types";
import ChatBubble from "src/chat/chatMessage/components/chatBubble/ChatBubble";
import BrandLogo from "src/chat/chatMessage/components/brandLogo/BrandLogo";

const uniqueId = "e46487bc-8ba0-4e0d-960a-b76897fb5aa9";

export const DATA_TEST_ID = {
  CAREER_READINESS_AGENT_MESSAGE_CONTAINER: `career-readiness-agent-message-container-${uniqueId}`,
  CAREER_READINESS_AGENT_MESSAGE_BRAND_LOGO: `career-readiness-agent-message-brand-logo-${uniqueId}`,
};

export const CAREER_READINESS_AGENT_MESSAGE_TYPE = `career-readiness-agent-message-${uniqueId}`;

export interface CareerReadinessAgentMessageProps {
  message_id: string;
  message: string;
  sent_at: string;
  quick_reply_options?: QuickReplyOption[] | null;
  onQuickReplyClick?: (label: string) => void;
}

const MessageContainer = styled(Box)<{ origin: ConversationMessageSender }>(({ theme, origin }) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: origin === ConversationMessageSender.USER ? "flex-end" : "flex-start",
  marginBottom: theme.spacing(theme.tabiyaSpacing.sm),
  width: "100%",
}));

const CareerReadinessAgentMessage: React.FC<CareerReadinessAgentMessageProps> = ({
  message_id,
  message,
  quick_reply_options,
  onQuickReplyClick,
}) => {
  return (
    <MessageContainer
      origin={ConversationMessageSender.COMPASS}
      data-testid={`${DATA_TEST_ID.CAREER_READINESS_AGENT_MESSAGE_CONTAINER}-${message_id}`}
    >
      <Box data-testid={DATA_TEST_ID.CAREER_READINESS_AGENT_MESSAGE_BRAND_LOGO}>
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

export default CareerReadinessAgentMessage;
