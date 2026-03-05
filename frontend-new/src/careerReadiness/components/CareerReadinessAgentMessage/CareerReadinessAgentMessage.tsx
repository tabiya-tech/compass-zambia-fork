import React from "react";
import { Box, styled } from "@mui/material";
import { ConversationMessageSender } from "src/chat/ChatService/ChatService.types";
import ChatBubble from "src/chat/chatMessage/components/chatBubble/ChatBubble";
import Timestamp from "src/chat/chatMessage/components/chatMessageFooter/components/timestamp/Timestamp";
import ChatMessageFooterLayout from "src/chat/chatMessage/components/chatMessageFooter/ChatMessageFooterLayout";

const uniqueId = "e46487bc-8ba0-4e0d-960a-b76897fb5aa9";

export const DATA_TEST_ID = {
  CAREER_READINESS_AGENT_MESSAGE_CONTAINER: `career-readiness-agent-message-container-${uniqueId}`,
};

export const CAREER_READINESS_AGENT_MESSAGE_TYPE = `career-readiness-agent-message-${uniqueId}`;

export interface CareerReadinessAgentMessageProps {
  message_id: string;
  message: string;
  sent_at: string;
}

const MessageContainer = styled(Box)<{ origin: ConversationMessageSender }>(({ theme, origin }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: origin === ConversationMessageSender.USER ? "flex-end" : "flex-start",
  marginBottom: theme.spacing(theme.tabiyaSpacing.sm),
  width: "100%",
}));

const CareerReadinessAgentMessage: React.FC<CareerReadinessAgentMessageProps> = ({ message_id, message, sent_at }) => {
  return (
    <MessageContainer
      origin={ConversationMessageSender.COMPASS}
      data-testid={`${DATA_TEST_ID.CAREER_READINESS_AGENT_MESSAGE_CONTAINER}-${message_id}`}
    >
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
          <ChatMessageFooterLayout sender={ConversationMessageSender.COMPASS}>
            <Timestamp sentAt={sent_at} />
          </ChatMessageFooterLayout>
        </Box>
      </Box>
    </MessageContainer>
  );
};

export default CareerReadinessAgentMessage;
