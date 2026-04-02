import React from "react";
import { useTranslation } from "react-i18next";
import { Box, keyframes, Typography } from "@mui/material";
import ChatBubble from "src/chat/chatMessage/components/chatBubble/ChatBubble";
import BrandLogo from "src/chat/chatMessage/components/brandLogo/BrandLogo";
import { MessageContainer } from "src/chat/chatMessage/compassChatMessage/CompassChatMessage";
import { ConversationMessageSender } from "src/chat/ChatService/ChatService.types";
import { nanoid } from "nanoid";
import type { IChatMessage } from "src/chat/Chat.types";

const TYPING_KEY = "chat.chatMessage.typingChatMessage.typing";

const uniqueId = "4bca669b-6e88-4d21-8a0e-4d5e5ad3c4de";

export const CAREER_READINESS_TYPING_MESSAGE_TYPE = `career-readiness-typing-${uniqueId}`;

export const DATA_TEST_ID = {
  CAREER_READINESS_TYPING_MESSAGE_CONTAINER: `career-readiness-typing-message`,
  CAREER_READINESS_TYPING_MESSAGE_BRAND_LOGO: `career-readiness-typing-message-brand-logo-${uniqueId}`,
};

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

export interface CareerReadinessTypingMessageProps {
  _?: never;
}

const CareerReadinessTypingMessage: React.FC<CareerReadinessTypingMessageProps> = () => {
  const { t } = useTranslation();
  const displayText = t(TYPING_KEY);

  return (
    <MessageContainer
      origin={ConversationMessageSender.COMPASS}
      data-testid={DATA_TEST_ID.CAREER_READINESS_TYPING_MESSAGE_CONTAINER}
    >
      <Box data-testid={DATA_TEST_ID.CAREER_READINESS_TYPING_MESSAGE_BRAND_LOGO}>
        <BrandLogo />
      </Box>
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

export function generateCareerReadinessTypingMessage(): IChatMessage<CareerReadinessTypingMessageProps> {
  return {
    type: CAREER_READINESS_TYPING_MESSAGE_TYPE,
    message_id: nanoid(),
    sender: ConversationMessageSender.COMPASS,
    payload: {},
    component: (props: CareerReadinessTypingMessageProps) => <CareerReadinessTypingMessage {...props} />,
  };
}

export default CareerReadinessTypingMessage;
