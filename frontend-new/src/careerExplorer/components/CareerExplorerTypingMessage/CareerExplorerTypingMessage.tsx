import React from "react";
import { useTranslation } from "react-i18next";
import { Box, keyframes, Typography } from "@mui/material";
import ChatBubble from "src/chat/chatMessage/components/chatBubble/ChatBubble";
import { MessageContainer } from "src/chat/chatMessage/userChatMessage/UserChatMessage";
import { ConversationMessageSender } from "src/chat/ChatService/ChatService.types";
import { nanoid } from "nanoid";
import type { IChatMessage } from "src/chat/Chat.types";

const TYPING_KEY = "chat.chatMessage.typingChatMessage.typing";

const uniqueId = "b2c3d4e5-f6a7-8901-bcde-f23456789012";

export const CAREER_EXPLORER_TYPING_MESSAGE_TYPE = `career-explorer-typing-${uniqueId}`;

const dotAnimation = keyframes`
  0%, 100% {
    transform: translateY(+0.5px);
    opacity: 0.5;
  }
  50% {
    transform: translateY(-1px);
    opacity: 1;
  }
`;

export interface CareerExplorerTypingMessageProps {
  _?: never;
}

const CareerExplorerTypingMessage: React.FC<CareerExplorerTypingMessageProps> = () => {
  const { t } = useTranslation();
  const displayText = t(TYPING_KEY);

  return (
    <MessageContainer origin={ConversationMessageSender.COMPASS} data-testid="career-explorer-typing-message">
      <ChatBubble message="" sender={ConversationMessageSender.COMPASS}>
        <Box display="flex" alignItems="baseline">
          <Typography>{displayText}</Typography>
          <Box component="span" paddingLeft="1px">
            {[0, 1, 2].map((i) => (
              <Typography
                key={i}
                component="span"
                sx={{
                  display: "inline-block",
                  fontSize: "1.5rem",
                  lineHeight: 0,
                  animation: `${dotAnimation} 1.3s infinite ease-in-out`,
                  animationDelay: `${i * 0.2}s`,
                }}
              >
                .
              </Typography>
            ))}
          </Box>
        </Box>
      </ChatBubble>
    </MessageContainer>
  );
};

export function generateCareerExplorerTypingMessage(): IChatMessage<CareerExplorerTypingMessageProps> {
  return {
    type: CAREER_EXPLORER_TYPING_MESSAGE_TYPE,
    message_id: nanoid(),
    sender: ConversationMessageSender.COMPASS,
    payload: {},
    component: (props: CareerExplorerTypingMessageProps) => <CareerExplorerTypingMessage {...props} />,
  };
}

export default CareerExplorerTypingMessage;
