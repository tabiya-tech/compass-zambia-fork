import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, useTheme } from "@mui/material";
import ChatList from "src/chat/chatList/ChatList";
import ChatMessageField from "src/chat/ChatMessageField/ChatMessageField";
import { generateSomethingWentWrongMessage, generateUserMessage } from "src/chat/util";
import type { IChatMessage } from "src/chat/Chat.types";
import type { TranslationKey } from "src/react-i18next";
import CareerExplorerService from "src/careerExplorer/services/CareerExplorerService";
import { generateCareerExplorerTypingMessage } from "src/careerExplorer/components/CareerExplorerTypingMessage/CareerExplorerTypingMessage";
import { mapCareerExplorerMessagesToChatMessages } from "src/careerExplorer/utils/mapCareerExplorerMessagesToChatMessages";
import type { CareerExplorerMessage } from "src/careerExplorer/types";

export interface CareerExplorerChatProps {
  initialMessages: CareerExplorerMessage[];
  placeholderKey: TranslationKey;
  isLoading?: boolean;
}

const CareerExplorerChat: React.FC<CareerExplorerChatProps> = ({
  initialMessages,
  placeholderKey,
  isLoading = false,
}) => {
  const theme = useTheme();
  const [messages, setMessages] = useState<IChatMessage<any>[]>(() =>
    mapCareerExplorerMessagesToChatMessages(initialMessages)
  );
  const [aiIsTyping, setAiIsTyping] = useState(false);
  const [chatFinished, setChatFinished] = useState(false);

  const handleSendRef = useRef<(msg: string) => void>(() => {});

  const handleQuickReply = useCallback((label: string) => {
    handleSendRef.current(label);
  }, []);

  const typingMessage = useMemo(() => generateCareerExplorerTypingMessage(), []);

  const displayMessages = useMemo(() => {
    if (aiIsTyping || (isLoading && messages.length === 0)) {
      return [...messages, typingMessage];
    }
    return messages;
  }, [messages, aiIsTyping, typingMessage, isLoading]);

  useEffect(() => {
    setMessages(mapCareerExplorerMessagesToChatMessages(initialMessages, handleQuickReply));
  }, [initialMessages, handleQuickReply]);

  const handleSend = useCallback(
    async (userMessage: string) => {
      // Clear quick-reply buttons from all messages when user sends a new message
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.payload?.quick_reply_options) {
            return { ...msg, payload: { ...msg.payload, quick_reply_options: null } };
          }
          return msg;
        })
      );
      const optimisticUserMessage = generateUserMessage(
        userMessage,
        new Date().toISOString(),
        `optimistic-${Date.now()}`
      );
      setMessages((prev) => [...prev, optimisticUserMessage]);
      setAiIsTyping(true);
      try {
        const res = await CareerExplorerService.getInstance().sendMessage(userMessage);
        setMessages(mapCareerExplorerMessagesToChatMessages(res.messages, handleQuickReply));
        setChatFinished(res.finished);
      } catch (e) {
        console.error("Failed to send message", e);
        setMessages((prev) => [...prev, generateSomethingWentWrongMessage()]);
      } finally {
        setAiIsTyping(false);
      }
    },
    [handleQuickReply]
  );

  handleSendRef.current = handleSend;

  return (
    <Box
      role="region"
      aria-label="Career Explorer"
      sx={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
      }}
      data-testid="career-explorer-chat"
    >
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          paddingX: theme.spacing(theme.tabiyaSpacing.lg),
          paddingTop: theme.spacing(theme.tabiyaSpacing.sm),
        }}
      >
        <ChatList messages={displayMessages} />
      </Box>
      <Box
        sx={{
          flexShrink: 0,
          padding: theme.tabiyaSpacing.lg,
          paddingTop: theme.tabiyaSpacing.xs,
        }}
      >
        <ChatMessageField
          handleSend={handleSend}
          aiIsTyping={aiIsTyping}
          isChatFinished={chatFinished}
          placeholderKey={placeholderKey}
          showCvUpload={false}
        />
      </Box>
    </Box>
  );
};

export default CareerExplorerChat;
