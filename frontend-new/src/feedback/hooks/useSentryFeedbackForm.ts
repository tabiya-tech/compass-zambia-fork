import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import * as Sentry from "@sentry/react";
import authenticationStateService from "src/auth/services/AuthenticationState.service";
import { PersistentStorageService } from "src/app/PersistentStorageService/PersistentStorageService";

interface OpenFeedbackFormOptions {
  markNotificationSeen?: boolean;
}

interface UseSentryFeedbackFormOptions {
  markNotificationSeenOnOpen?: boolean;
}

export const useSentryFeedbackForm = (options: UseSentryFeedbackFormOptions = {}) => {
  const { markNotificationSeenOnOpen = false } = options;
  const { t } = useTranslation();
  const [sentryEnabled, setSentryEnabled] = useState(false);

  useEffect(() => {
    setSentryEnabled(Sentry.isInitialized());
  }, []);

  const feedbackFormLabels = useMemo(
    () => ({
      formTitle: t("chat.chatHeader.giveGeneralFeedback"),
      nameLabel: t("chat.chatHeader.nameLabel"),
      namePlaceholder: t("chat.chatHeader.namePlaceholder"),
      emailLabel: t("chat.chatHeader.emailLabel"),
      emailPlaceholder: t("chat.chatHeader.emailPlaceholder"),
      isRequiredLabel: t("chat.chatHeader.requiredLabel"),
      messageLabel: t("chat.chatHeader.descriptionLabel"),
      messagePlaceholder: t("chat.chatHeader.feedbackMessagePlaceholder"),
      addScreenshotButtonLabel: t("chat.chatHeader.addScreenshot"),
      submitButtonLabel: t("chat.chatHeader.sendFeedback"),
      cancelButtonLabel: t("chat.chatHeader.cancelButton"),
      successMessageText: t("chat.chatHeader.feedbackSuccessMessage"),
    }),
    [t]
  );

  const openFeedbackForm = useCallback(
    async (openOptions: OpenFeedbackFormOptions = {}): Promise<boolean> => {
      if (!sentryEnabled) {
        console.debug("Sentry is not initialized, feedback form cannot be created.");
        return false;
      }

      try {
        const feedback = Sentry.getFeedback();
        if (!feedback) {
          return false;
        }

        const form = await feedback.createForm(feedbackFormLabels);
        form.appendToDom();
        form.open();

        const shouldMarkAsSeen = openOptions.markNotificationSeen ?? markNotificationSeenOnOpen;
        if (shouldMarkAsSeen) {
          const user = authenticationStateService.getInstance().getUser();
          if (user) {
            PersistentStorageService.setSeenFeedbackNotification(user.id);
          }
        }

        return true;
      } catch (error) {
        console.error("Error creating feedback form:", error);
        return false;
      }
    },
    [feedbackFormLabels, markNotificationSeenOnOpen, sentryEnabled]
  );

  return {
    sentryEnabled,
    openFeedbackForm,
  };
};
