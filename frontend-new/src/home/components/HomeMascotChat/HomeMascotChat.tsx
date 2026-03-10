import React, { useCallback, useEffect, useRef, useState } from "react";
import { Box, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import { nanoid } from "nanoid";
import AMAService from "src/askMeAnything/services/AMAService";
import type { AMAMessage } from "src/askMeAnything/types";
import { Bushbaby } from "src/theme/Bushbaby/Bushbaby";
import { useSnackbar } from "src/theme/SnackbarProvider/SnackbarProvider";
import MascotChatThread from "./MascotChatThread";
import i18n from "src/i18n/i18n";

const uniqueId = "mascot-chat-home-a1b2c3d4";

export const DATA_TEST_ID = {
  HOME_MASCOT_CHAT: `home-mascot-chat-${uniqueId}`,
};

const createErrorMessage = (): AMAMessage => ({
  message_id: nanoid(),
  message: i18n.t("chat.util.errorSomethingWentWrong"),
  sent_at: new Date().toISOString(),
  sender: "AGENT",
});

const HomeMascotChat: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const [amaMessages, setAMAMessages] = useState<AMAMessage[]>([]);
  const [aiIsTyping, setAiIsTyping] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);

  const initializeConversation = useCallback(async () => {
    setIsInitializing(true);
    try {
      const res = await AMAService.getInstance().sendMessage(null, []);
      setAMAMessages(res.messages);
    } catch (e) {
      console.error("Failed to initialize AMA conversation", e);
      enqueueSnackbar(t("askMeAnything.loadError"), { variant: "error" });
    } finally {
      setIsInitializing(false);
      setAiIsTyping(false);
    }
  }, [t, enqueueSnackbar]);

  const initializeRef = useRef(initializeConversation);
  initializeRef.current = initializeConversation;

  useEffect(() => {
    initializeRef.current();
  }, []);

  const handleSend = useCallback(
    async (userMessageText: string) => {
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
        const history = amaMessages;
        const res = await AMAService.getInstance().sendMessage(userMessageText, history);
        setAMAMessages(res.messages);
      } catch (e) {
        console.error("Failed to send AMA message", e);
        setAMAMessages((prev) => [...prev, createErrorMessage()]);
      } finally {
        setAiIsTyping(false);
      }
    },
    [amaMessages]
  );

  return (
    <Box
      data-testid={DATA_TEST_ID.HOME_MASCOT_CHAT}
      sx={{
        flexShrink: 0,
        width: "100%",
        minWidth: 0,
        maxWidth: 520,
        overflow: "visible",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 0,
          padding: theme.spacing(theme.tabiyaSpacing.lg),
          paddingRight: theme.spacing(theme.tabiyaSpacing.xl),
          minHeight: 0,
          overflow: "visible",
        }}
      >
        <Box
          sx={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            paddingRight: theme.spacing(theme.tabiyaSpacing.md),
            overflow: "visible",
          }}
        >
          <Bushbaby width="100px" />
        </Box>

        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            width: 360,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              height: 200,
            }}
          >
            <MascotChatThread
              messages={amaMessages}
              aiIsTyping={aiIsTyping || isInitializing}
              onSend={handleSend}
              placeholder={t("askMeAnything.inputPlaceholder")}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default HomeMascotChat;
