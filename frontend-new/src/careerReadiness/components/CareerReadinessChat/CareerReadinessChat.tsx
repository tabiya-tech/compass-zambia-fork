import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, useTheme } from "@mui/material";
import ChatList from "src/chat/chatList/ChatList";
import ChatMessageField from "src/chat/ChatMessageField/ChatMessageField";
import { generateSomethingWentWrongMessage, generateUserMessage } from "src/chat/util";
import type { IChatMessage } from "src/chat/Chat.types";
import CareerReadinessService from "src/careerReadiness/services/CareerReadinessService";
import { generateCareerReadinessTypingMessage } from "src/careerReadiness/components/CareerReadinessTypingMessage/CareerReadinessTypingMessage";
import { mapCareerReadinessMessagesToChatMessages } from "src/careerReadiness/utils/mapCareerReadinessMessagesToChatMessages";

export interface CareerReadinessChatProps {
  moduleId: string;
  moduleTitle: string;
  initialConversationId: string | null;
  inputPlaceholder: string;
}

const CareerReadinessChat: React.FC<CareerReadinessChatProps> = ({
  moduleId,
  moduleTitle,
  initialConversationId,
  inputPlaceholder,
}) => {
  const theme = useTheme();
  const [messages, setMessages] = useState<IChatMessage<any>[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(initialConversationId);
  const [isLoadingHistory, setIsLoadingHistory] = useState(Boolean(initialConversationId));
  const [aiIsTyping, setAiIsTyping] = useState(false);
  const [moduleCompleted, setModuleCompleted] = useState(false);

  const typingMessage = useMemo(() => generateCareerReadinessTypingMessage(), []);

  const displayMessages = useMemo(() => {
    if (aiIsTyping) {
      return [...messages, typingMessage];
    }
    return messages;
  }, [messages, aiIsTyping, typingMessage]);

  const showTyping = isLoadingHistory || !conversationId ? [typingMessage] : displayMessages;

  const loadHistory = useCallback(
    async (conversationIdOverride?: string | null, getIsCancelled?: () => boolean) => {
      const id = conversationIdOverride ?? conversationId;
      if (!id) return;
      setIsLoadingHistory(true);
      try {
        const res = await CareerReadinessService.getInstance().getConversationHistory(moduleId, id);
        if (getIsCancelled?.()) return;
        setMessages(mapCareerReadinessMessagesToChatMessages(res.messages));
        setModuleCompleted(res.module_completed);
      } catch (e) {
        console.error("Failed to load conversation history", e);
        if (getIsCancelled?.()) return;
        setMessages([generateSomethingWentWrongMessage()]);
      } finally {
        if (!getIsCancelled?.()) {
          setIsLoadingHistory(false);
        }
      }
    },
    [moduleId, conversationId]
  );

  const loadHistoryRef = useRef(loadHistory);
  loadHistoryRef.current = loadHistory;

  useEffect(() => {
    if (initialConversationId) {
      setConversationId(initialConversationId);
      let cancelled = false;
      loadHistoryRef
        .current(initialConversationId, () => cancelled)
        .catch(() => {
          // Error already logged and state handled in loadHistory
        });
      return () => {
        cancelled = true;
      };
    }
    setConversationId(null);
    setMessages([]);
    setIsLoadingHistory(false);
  }, [initialConversationId]);

  const handleSend = useCallback(
    async (userMessage: string) => {
      if (!conversationId) return;
      const optimisticUserMessage = generateUserMessage(
        userMessage,
        new Date().toISOString(),
        `optimistic-${Date.now()}`
      );
      setMessages((prev) => [...prev, optimisticUserMessage]);
      setAiIsTyping(true);
      try {
        const res = await CareerReadinessService.getInstance().sendMessage(moduleId, conversationId, userMessage);
        setMessages(mapCareerReadinessMessagesToChatMessages(res.messages));
        setModuleCompleted(res.module_completed);
      } catch (e) {
        console.error("Failed to send message", e);
        setMessages((prev) => [...prev, generateSomethingWentWrongMessage()]);
      } finally {
        setAiIsTyping(false);
      }
    },
    [moduleId, conversationId]
  );

  return (
    <Box
      role="region"
      aria-label={moduleTitle}
      sx={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
      }}
      data-testid="career-readiness-chat"
    >
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          paddingX: theme.spacing(theme.tabiyaSpacing.lg),
          paddingTop: theme.spacing(theme.tabiyaSpacing.sm),
        }}
      >
        <ChatList messages={showTyping} />
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
          aiIsTyping={aiIsTyping || isLoadingHistory || !conversationId}
          isChatFinished={moduleCompleted}
          isUploadingCv={false}
          customPlaceholder={inputPlaceholder}
        />
      </Box>
    </Box>
  );
};

export default CareerReadinessChat;
