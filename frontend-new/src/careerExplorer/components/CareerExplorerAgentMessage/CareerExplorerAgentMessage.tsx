import React from "react";
import { Box, styled } from "@mui/material";
import { ConversationMessageSender, QuickReplyOption } from "src/chat/ChatService/ChatService.types";
import ChatBubble from "src/chat/chatMessage/components/chatBubble/ChatBubble";
import Timestamp from "src/chat/chatMessage/components/chatMessageFooter/components/timestamp/Timestamp";
import ChatMessageFooterLayout from "src/chat/chatMessage/components/chatMessageFooter/ChatMessageFooterLayout";
import QuickReplyButtons from "src/chat/chatMessage/suggestedActions/QuickReplyButtons";

const uniqueId = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

export const DATA_TEST_ID = {
  CAREER_EXPLORER_AGENT_MESSAGE_CONTAINER: `career-explorer-agent-message-container-${uniqueId}`,
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
  flexDirection: "column",
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
          {quick_reply_options && quick_reply_options.length > 0 && onQuickReplyClick && (
            <QuickReplyButtons options={quick_reply_options} onSelect={onQuickReplyClick} />
          )}
        </Box>
      </Box>
    </MessageContainer>
  );
};

export default CareerExplorerAgentMessage;
