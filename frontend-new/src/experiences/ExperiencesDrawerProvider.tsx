import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import ExperiencesDrawer from "src/experiences/experiencesDrawer/ExperiencesDrawer";
import ExperienceService from "src/experiences/experienceService/experienceService";
import UserPreferencesStateService from "src/userPreferences/UserPreferencesStateService";
import { Experience } from "src/experiences/experienceService/experiences.types";
import { useSnackbar } from "src/theme/SnackbarProvider/SnackbarProvider";
import { useTranslation } from "react-i18next";
import { ChatError } from "src/error/commonErrors";
import ChatService from "src/chat/ChatService/ChatService";

export interface ExperiencesDrawerContextType {
  openExperiencesDrawer: () => Promise<void>;
  closeExperiencesDrawer: () => void;
  isDrawerOpen: boolean;
  experiences: Experience[];
  conversationConductedAt: string | null;
  setConversationConductedAt: (value: string | null) => void;
  fetchExperiences: () => Promise<void>;
}

const defaultExperiencesDrawerContext: ExperiencesDrawerContextType = {
  openExperiencesDrawer: () => Promise.resolve(),
  closeExperiencesDrawer: () => {},
  isDrawerOpen: false,
  experiences: [],
  conversationConductedAt: null,
  setConversationConductedAt: () => {},
  fetchExperiences: () => Promise.resolve(),
};

export const ExperiencesDrawerContext = createContext<ExperiencesDrawerContextType>(defaultExperiencesDrawerContext);

export const ExperiencesDrawerProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [conversationConductedAt, setConversationConductedAt] = useState<string | null>(null);

  const fetchExperiences = useCallback(async () => {
    const activeSessionId = UserPreferencesStateService.getInstance().getActiveSessionId();
    if (!activeSessionId) {
      throw new ChatError("Session id is not available");
    }
    setIsLoading(true);
    try {
      const experienceService = ExperienceService.getInstance();
      const data = await experienceService.getExperiences(activeSessionId);
      setExperiences(data);

      try {
        const history = await ChatService.getInstance().getChatHistory(activeSessionId);
        setConversationConductedAt(history.conversation_conducted_at ?? null);
      } catch {
        setConversationConductedAt(null);
      }
    } catch (error) {
      console.error(new ChatError("Failed to retrieve experiences", error));
      enqueueSnackbar(t("chat.chat.notifications.experiencesFetchFailed"), { variant: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [enqueueSnackbar, t]);

  const openExperiencesDrawer = useCallback(async () => {
    setIsDrawerOpen(true);
    await fetchExperiences();
  }, [fetchExperiences]);

  const closeExperiencesDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const contextValue: ExperiencesDrawerContextType = useMemo(
    () => ({
      openExperiencesDrawer,
      closeExperiencesDrawer,
      isDrawerOpen,
      experiences,
      conversationConductedAt,
      setConversationConductedAt,
      fetchExperiences,
    }),
    [
      openExperiencesDrawer,
      closeExperiencesDrawer,
      isDrawerOpen,
      experiences,
      conversationConductedAt,
      fetchExperiences,
    ]
  );

  return (
    <ExperiencesDrawerContext.Provider value={contextValue}>
      {children}
      <ExperiencesDrawer
        isOpen={isDrawerOpen}
        notifyOnClose={() => closeExperiencesDrawer()}
        isLoading={isLoading}
        experiences={experiences}
        conversationConductedAt={conversationConductedAt}
        onExperiencesUpdated={fetchExperiences}
      />
    </ExperiencesDrawerContext.Provider>
  );
};

export const useExperiencesDrawer = (): ExperiencesDrawerContextType => {
  return useContext(ExperiencesDrawerContext);
};
