import React, { SetStateAction, useCallback, useContext, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Box, Typography, useTheme } from "@mui/material";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import PrimaryIconButton from "src/theme/PrimaryIconButton/PrimaryIconButton";
import AnimatedBadge from "src/theme/AnimatedBadge/AnimatedBadge";
import { IsOnlineContext } from "src/app/isOnlineProvider/IsOnlineProvider";
import authenticationStateService from "src/auth/services/AuthenticationState.service";
import { useChatContext } from "src/chat/ChatContext";
import { MetricsError, SessionError } from "src/error/commonErrors";
import MetricsService from "src/metrics/metricsService";
import { EventType } from "src/metrics/types";
import { ConversationPhase } from "src/chat/chatProgressbar/types";
import { useSnackbar } from "src/theme/SnackbarProvider/SnackbarProvider";
import CustomLink from "src/theme/CustomLink/CustomLink";
import { PersistentStorageService } from "src/app/PersistentStorageService/PersistentStorageService";
import { useSentryFeedbackForm } from "src/feedback/hooks/useSentryFeedbackForm";

export type ChatHeaderProps = {
  startNewConversation: () => void;
  experiencesExplored: number;
  exploredExperiencesNotification: boolean;
  setExploredExperiencesNotification: React.Dispatch<SetStateAction<boolean>>;
  conversationCompleted: boolean;
  timeUntilNotification: number | null;
  progressPercentage: number;
  conversationPhase: ConversationPhase;
  collectedExperiences: number;
};

const uniqueId = "7413b63a-887b-4f41-b930-89e9770db12b";
export const DATA_TEST_ID = {
  CHAT_HEADER_CONTAINER: `chat-header-container-${uniqueId}`,
  CHAT_HEADER_BUTTON_MENU: `chat-header-button-menu-${uniqueId}`,
  CHAT_HEADER_BUTTON_EXPERIENCES: `chat-header-button-experiences-${uniqueId}`,
  CHAT_HEADER_ICON_EXPERIENCES: `chat-header-icon-experiences-${uniqueId}`,
  CHAT_HEADER_FEEDBACK_LINK: `chat-header-feedback-link-${uniqueId}`,
};

export const MENU_ITEM_ID = {
  START_NEW_CONVERSATION: `start-new-conversation-${uniqueId}`,
  VIEW_EXPERIENCES: `view-experiences-${uniqueId}`,
};

const ChatHeader: React.FC<Readonly<ChatHeaderProps>> = ({
  startNewConversation: _startNewConversation, // kept for when start-conversation menu is re-enabled (see commented code below)
  experiencesExplored,
  exploredExperiencesNotification,
  setExploredExperiencesNotification,
  conversationCompleted,
  timeUntilNotification,
  progressPercentage,
  conversationPhase,
  collectedExperiences,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  // const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null); // for context menu when start-conversation is re-enabled
  const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const notificationShownRef = useRef<boolean>(false);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { openFeedbackForm } = useSentryFeedbackForm();

  const isOnline = useContext(IsOnlineContext);
  const { handleOpenExperiencesDrawer } = useChatContext();

  const handleGiveFeedback = useCallback(async () => {
    await openFeedbackForm({ markNotificationSeen: true });
  }, [openFeedbackForm]);

  // Show notification after 30 minutes if the conversation is not completed
  useEffect(() => {
    const user = authenticationStateService.getInstance().getUser();
    if (!user) {
      console.error(new SessionError("User is not available"));
      return;
    }

    // Clean up any existing timer
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }

    // Don't set a timer if conversation is completed, notification already shown, or no time was given
    if (
      conversationCompleted ||
      PersistentStorageService.hasSeenFeedbackNotification(user.id) ||
      timeUntilNotification === null ||
      notificationShownRef.current
    ) {
      return;
    }

    feedbackTimerRef.current = setTimeout(() => {
      if (conversationCompleted) {
        // Don't show a notification if the conversation is completed
        return;
      }

      // Check if phase progress is 66% or less
      const shouldPrompt: boolean = (progressPercentage ?? 0) <= 66;

      if (shouldPrompt && !notificationShownRef.current) {
        const snackbarKey = enqueueSnackbar(
          <Typography variant="body1">
            {t("chat.chatHeader.feedbackMessage")}{" "}
            <CustomLink
              onClick={async () => {
                closeSnackbar(snackbarKey);
                await handleGiveFeedback();
              }}
              data-testid={DATA_TEST_ID.CHAT_HEADER_FEEDBACK_LINK}
            >
              {t("chat.chatHeader.giveFeedback")}
            </CustomLink>
          </Typography>,
          {
            variant: "info",
            persist: true,
            autoHideDuration: null,
            preventDuplicate: true,
          }
        );
        // Mark the notification as shown
        notificationShownRef.current = true;
      }
    }, timeUntilNotification);

    return () => {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
        feedbackTimerRef.current = null;
      }
    };
  }, [
    enqueueSnackbar,
    closeSnackbar,
    conversationCompleted,
    handleGiveFeedback,
    timeUntilNotification,
    progressPercentage,
    t,
  ]);

  const handleViewExperiences = useCallback(() => {
    handleOpenExperiencesDrawer();
    setExploredExperiencesNotification(false);
    try {
      const user_id = authenticationStateService.getInstance().getUser()?.id;
      if (!user_id) {
        console.error(new MetricsError("Unable to send Experiences and Skills view metrics: user id is missing"));
        return;
      }

      MetricsService.getInstance().sendMetricsEvent({
        event_type: EventType.UI_INTERACTION,
        user_id: user_id,
        actions: ["view_experiences_and_skills"],
        element_id: DATA_TEST_ID.CHAT_HEADER_BUTTON_EXPERIENCES,
        timestamp: new Date().toISOString(),
        relevant_experiments: {},
        details: {
          conversation_phase: conversationPhase,
          experiences_explored: experiencesExplored,
          collected_experiences: collectedExperiences,
        },
      });
    } catch (error) {
      console.error(new MetricsError(`Unable to send Experiences and Skills view metrics: ${error}`));
    }
  }, [
    handleOpenExperiencesDrawer,
    setExploredExperiencesNotification,
    conversationPhase,
    experiencesExplored,
    collectedExperiences,
  ]);

  // commented out for now, not shown in UI
  // const contextMenuItems: MenuItemConfig[] = useMemo(
  //   () => [
  //     {
  //       id: MENU_ITEM_ID.START_NEW_CONVERSATION,
  //       text: t("common.buttons.startNewConversation").toLowerCase(),
  //       disabled: !isOnline,
  //       action: startNewConversation,
  //     },
  //     {
  //       id: MENU_ITEM_ID.VIEW_EXPERIENCES,
  //       text: t("chat.chatHeader.viewExperiences").toLowerCase(),
  //       disabled: !isOnline,
  //       action: handleViewExperiences,
  //     },
  //   ],
  //   [isOnline, startNewConversation, handleViewExperiences, t]
  // );

  return (
    <Box display="flex" justifyContent="flex-end" alignItems="center" data-testid={DATA_TEST_ID.CHAT_HEADER_CONTAINER}>
      {/* Start conversation commented out; only show view experiences */}
      {/* <PrimaryIconButton
        sx={{
          color: theme.palette.common.black,
        }}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        data-testid={DATA_TEST_ID.CHAT_HEADER_BUTTON_MENU}
        title={t("common.buttons.startNewConversation").toLowerCase()}
      >
        <AnimatedBadge
          badgeContent={experiencesExplored}
          invisible={!exploredExperiencesNotification || experiencesExplored === 0}
        >
          <MenuIcon />
        </AnimatedBadge>
      </PrimaryIconButton>
      <ContextMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        notifyOnClose={() => setAnchorEl(null)}
        items={contextMenuItems}
      /> */}
      <PrimaryIconButton
        sx={{
          color: theme.palette.common.black,
        }}
        onClick={handleViewExperiences}
        data-testid={DATA_TEST_ID.CHAT_HEADER_BUTTON_EXPERIENCES}
        title={t("chat.chatHeader.viewExperiences").toLowerCase()}
        disabled={!isOnline}
      >
        <AnimatedBadge
          badgeContent={experiencesExplored}
          invisible={!exploredExperiencesNotification || experiencesExplored === 0}
        >
          <BadgeOutlinedIcon data-testid={DATA_TEST_ID.CHAT_HEADER_ICON_EXPERIENCES} />
        </AnimatedBadge>
      </PrimaryIconButton>
    </Box>
  );
};

export default ChatHeader;
