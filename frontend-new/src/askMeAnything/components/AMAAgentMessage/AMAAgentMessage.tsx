import React from "react";
import { Box, styled } from "@mui/material";
import { ConversationMessageSender } from "src/chat/ChatService/ChatService.types";
import ChatBubble from "src/chat/chatMessage/components/chatBubble/ChatBubble";
import Timestamp from "src/chat/chatMessage/components/chatMessageFooter/components/timestamp/Timestamp";
import ChatMessageFooterLayout from "src/chat/chatMessage/components/chatMessageFooter/ChatMessageFooterLayout";
import AMASuggestedActions from "src/askMeAnything/components/AMASuggestedActions/AMASuggestedActions";
import type { SuggestedAction } from "src/askMeAnything/types";

const uniqueId = "b2c3d4e5-f6a7-8901-bcde-f12345678901";

export const DATA_TEST_ID = {
  AMA_AGENT_MESSAGE_CONTAINER: `ama-agent-message-container-${uniqueId}`,
};

export const AMA_AGENT_MESSAGE_TYPE = `ama-agent-message-${uniqueId}`;

export interface AMAAgentMessageProps {
  message_id: string;
  message: string;
  sent_at: string;
  suggested_actions?: SuggestedAction[];
  isLatestAgentMessage?: boolean;
}

const MessageContainer = styled(Box)<{ origin: ConversationMessageSender }>(({ theme, origin }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: origin === ConversationMessageSender.USER ? "flex-end" : "flex-start",
  marginBottom: theme.spacing(theme.tabiyaSpacing.sm),
  width: "100%",
}));

const AMAAgentMessage: React.FC<AMAAgentMessageProps> = ({
  message_id,
  message,
  sent_at,
  suggested_actions = [],
  isLatestAgentMessage = false,
}) => {
  return (
    <MessageContainer
      origin={ConversationMessageSender.COMPASS}
      data-testid={`${DATA_TEST_ID.AMA_AGENT_MESSAGE_CONTAINER}-${message_id}`}
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

        {isLatestAgentMessage && suggested_actions.length > 0 && <AMASuggestedActions actions={suggested_actions} />}
      </Box>
    </MessageContainer>
  );
};

export default AMAAgentMessage;
