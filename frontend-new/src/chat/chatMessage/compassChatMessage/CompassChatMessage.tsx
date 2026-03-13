import React from "react";
import { Box, styled } from "@mui/material";
import { ConversationMessageSender, MessageReaction, QuickReplyOption } from "src/chat/ChatService/ChatService.types";
import ChatBubble from "src/chat/chatMessage/components/chatBubble/ChatBubble";
import Timestamp from "src/chat/chatMessage/components/chatMessageFooter/components/timestamp/Timestamp";
import ChatMessageFooterLayout from "src/chat/chatMessage/components/chatMessageFooter/ChatMessageFooterLayout";
import ReactionButtons from "src/chat/reaction/components/reactionButtons/ReactionButtons";
import QuickReplyButtons from "src/chat/chatMessage/suggestedActions/QuickReplyButtons";

const uniqueId = "2fbaf2ef-9eab-485a-bd28-b4a164e18b06";

export const DATA_TEST_ID = {
  CHAT_MESSAGE_CONTAINER: `chat-message-container-${uniqueId}`,
};

export const MessageContainer = styled(Box)<{ origin: ConversationMessageSender }>(({ theme, origin }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: origin === ConversationMessageSender.USER ? "flex-end" : "flex-start",
  marginBottom: theme.spacing(theme.tabiyaSpacing.sm),
  width: "100%",
}));

export const COMPASS_CHAT_MESSAGE_TYPE = `compass-message-${uniqueId}`;

export interface CompassChatMessageProps {
  message_id: string;
  message: string;
  sent_at: string; // ISO formatted datetime string
  reaction: MessageReaction | null;
  quick_reply_options?: QuickReplyOption[] | null;
  onQuickReplyClick?: (label: string) => void;
}

const CompassChatMessage: React.FC<CompassChatMessageProps> = ({
  message_id,
  message,
  sent_at,
  reaction,
  quick_reply_options,
  onQuickReplyClick,
}) => {
  return (
    <MessageContainer origin={ConversationMessageSender.COMPASS} data-testid={DATA_TEST_ID.CHAT_MESSAGE_CONTAINER}>
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
            <ReactionButtons messageId={message_id} currentReaction={reaction} />
          </ChatMessageFooterLayout>
          {quick_reply_options && quick_reply_options.length > 0 && onQuickReplyClick && (
            <QuickReplyButtons options={quick_reply_options} onSelect={onQuickReplyClick} />
          )}
        </Box>
      </Box>
    </MessageContainer>
  );
};

export default CompassChatMessage;
