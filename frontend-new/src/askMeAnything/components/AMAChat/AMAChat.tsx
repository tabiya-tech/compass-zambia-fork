import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, useTheme } from "@mui/material";
import { nanoid } from "nanoid";
import ChatList from "src/chat/chatList/ChatList";
import ChatMessageField from "src/chat/ChatMessageField/ChatMessageField";
import { generateSomethingWentWrongMessage, generateUserMessage } from "src/chat/util";
import type { IChatMessage } from "src/chat/Chat.types";
import { ConversationMessageSender } from "src/chat/ChatService/ChatService.types";
import AMAService from "src/askMeAnything/services/AMAService";
import AMAAgentMessage, {
  AMA_AGENT_MESSAGE_TYPE,
  type AMAAgentMessageProps,
} from "src/askMeAnything/components/AMAAgentMessage/AMAAgentMessage";
import type { AMAMessage } from "src/askMeAnything/types";
import { generateCareerReadinessTypingMessage } from "src/careerReadiness/components/CareerReadinessTypingMessage/CareerReadinessTypingMessage";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "src/theme/SnackbarProvider/SnackbarProvider";

const uniqueId = "c3d4e5f6-a7b8-9012-cdef-123456789012";

export const DATA_TEST_ID = {
  AMA_CHAT_CONTAINER: `ama-chat-container-${uniqueId}`,
};

/**
 * Map AMA API messages to IChatMessage objects for ChatList.
 * The latestAgentMessageId is used to show suggested actions only on the last agent message.
 */
function mapAMAMessagesToChatMessages(
  messages: AMAMessage[],
  latestAgentMessageId: string | null
): IChatMessage<any>[] {
  return messages.map((msg) => {
    if (msg.sender === "USER") {
      return generateUserMessage(msg.message, msg.sent_at, msg.message_id);
    }
    const isLatest = msg.message_id === latestAgentMessageId;
    const payload: AMAAgentMessageProps = {
      message_id: msg.message_id,
      message: msg.message,
      sent_at: msg.sent_at,
      suggested_actions: msg.suggested_actions ?? [],
      isLatestAgentMessage: isLatest,
    };
    return {
      type: AMA_AGENT_MESSAGE_TYPE,
      message_id: msg.message_id,
      sender: ConversationMessageSender.COMPASS,
      payload,
      component: (p: AMAAgentMessageProps) => <AMAAgentMessage {...p} />,
    };
  });
}

const AMAChat: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const [amaMessages, setAMAMessages] = useState<AMAMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [aiIsTyping, setAiIsTyping] = useState(true); // true while loading intro
  const [isInitializing, setIsInitializing] = useState(true);

  const typingMessage = useMemo(() => generateCareerReadinessTypingMessage(), []);

  // ID of the latest agent message — used to render suggested actions only on that one
  const latestAgentMessageId = useMemo(() => {
    const agentMessages = amaMessages.filter((m) => m.sender === "AGENT");
    return agentMessages.length > 0 ? agentMessages[agentMessages.length - 1].message_id : null;
  }, [amaMessages]);

  const chatMessages = useMemo(() => {
    const mapped = mapAMAMessagesToChatMessages(amaMessages, latestAgentMessageId);
    if (aiIsTyping || isInitializing) {
      return [...mapped, typingMessage];
    }
    return mapped;
  }, [amaMessages, latestAgentMessageId, aiIsTyping, isInitializing, typingMessage]);

  // Start conversation on mount
  const startConversation = useCallback(async () => {
    setIsInitializing(true);
    try {
      const res = await AMAService.getInstance().startConversation();
      setConversationId(res.conversation_id);
      setAMAMessages(res.messages);
    } catch (e) {
      console.error("Failed to start AMA conversation", e);
      enqueueSnackbar(t("askMeAnything.loadError"), { variant: "error" });
    } finally {
      setIsInitializing(false);
      setAiIsTyping(false);
    }
  }, [t, enqueueSnackbar]);

  const startConversationRef = useRef(startConversation);
  startConversationRef.current = startConversation;

  useEffect(() => {
    startConversationRef.current();
  }, []);

  const handleSend = useCallback(
    async (userMessageText: string) => {
      if (!conversationId) return;

      // Optimistic user message for immediate UI feedback
      const optimisticId = `optimistic-${nanoid()}`;
      const optimisticUserMessage: AMAMessage = {
        message_id: optimisticId,
        message: userMessageText,
        sender: "USER",
        sent_at: new Date().toISOString(),
      };

      setAMAMessages((prev) => [...prev, optimisticUserMessage]);
      setAiIsTyping(true);

      try {
        // Send current messages (minus the optimistic one) as history
        const history = amaMessages; // state snapshot before optimistic update
        const res = await AMAService.getInstance().sendMessage(conversationId, userMessageText, history);
        setAMAMessages(res.messages);
      } catch (e) {
        console.error("Failed to send AMA message", e);
        setAMAMessages((prev) => [...prev, generateSomethingWentWrongMessage() as unknown as AMAMessage]);
      } finally {
        setAiIsTyping(false);
      }
    },
    [conversationId, amaMessages]
  );

  return (
    <Box
      role="region"
      aria-label={t("askMeAnything.pageTitle")}
      sx={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
      }}
      data-testid={DATA_TEST_ID.AMA_CHAT_CONTAINER}
    >
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          paddingX: theme.spacing(theme.tabiyaSpacing.lg),
          paddingTop: theme.spacing(theme.tabiyaSpacing.sm),
        }}
      >
        <ChatList messages={chatMessages} />
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
          aiIsTyping={aiIsTyping || isInitializing || !conversationId}
          isChatFinished={false}
          isUploadingCv={false}
          customPlaceholder={t("askMeAnything.inputPlaceholder")}
        />
      </Box>
    </Box>
  );
};

export default AMAChat;
