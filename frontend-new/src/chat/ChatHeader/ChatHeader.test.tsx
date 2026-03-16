// mute the console
import "src/_test_utilities/consoleMock";
import "src/_test_utilities/envServiceMock";

// standard sentry mock
import "src/_test_utilities/sentryMock";

import ChatHeader, { DATA_TEST_ID } from "./ChatHeader";
import { fireEvent, render, screen, userEvent, waitFor } from "src/_test_utilities/test-utils";
import { mockBrowserIsOnLine } from "src/_test_utilities/mockBrowserIsOnline";
import { DATA_TEST_ID as ANIMATED_BADGE_DATA_TEST_ID } from "src/theme/AnimatedBadge/AnimatedBadge";
import AuthenticationStateService from "src/auth/services/AuthenticationState.service";
import { resetAllMethodMocks } from "src/_test_utilities/resetAllMethodMocks";
import { ChatProvider } from "src/chat/ChatContext";
import { PersistentStorageService } from "src/app/PersistentStorageService/PersistentStorageService";
import * as Sentry from "@sentry/react";
import { useSnackbar } from "src/theme/SnackbarProvider/SnackbarProvider";
import React from "react";
import UserPreferencesStateService from "src/userPreferences/UserPreferencesStateService";
import { FEEDBACK_NOTIFICATION_DELAY } from "src/chat/Chat";
import { SessionError } from "src/error/commonErrors";
import { ConversationPhase } from "src/chat/chatProgressbar/types";
import MetricsService from "src/metrics/metricsService";
import { EventType } from "src/metrics/types";

// Mock PersistentStorageService
jest.mock("src/app/PersistentStorageService/PersistentStorageService");

// mock the router
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    __esModule: true,
    useNavigate: jest.fn().mockReturnValue(jest.fn()),
  };
});

// mock the SocialAuthServices
jest.mock("src/auth/services/FirebaseAuthenticationService/socialAuth/FirebaseSocialAuthentication.service", () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => {
      return {
        logout: jest.fn(),
      };
    }),
  };
});

// mock the snackbar
jest.mock("src/theme/SnackbarProvider/SnackbarProvider", () => {
  const actual = jest.requireActual("src/theme/SnackbarProvider/SnackbarProvider");
  return {
    ...actual,
    __esModule: true,
    useSnackbar: jest.fn().mockReturnValue({
      enqueueSnackbar: jest.fn(),
      closeSnackbar: jest.fn(),
    }),
  };
});

const renderWithChatProvider = (child: React.ReactNode) => {
  render(
    <ChatProvider handleOpenExperiencesDrawer={jest.fn} removeMessageFromChat={jest.fn} addMessageToChat={jest.fn}>
      {child}
    </ChatProvider>
  );
};

describe("ChatHeader", () => {
  beforeEach(() => {
    // set sentry as uninitialized by default
    (Sentry.isInitialized as jest.Mock).mockReturnValue(false);
    resetAllMethodMocks(UserPreferencesStateService.getInstance());
    jest.clearAllMocks();
  });

  test.each([
    ["exploredExperiencesNotification shown", true],
    ["exploredExperiencesNotification not shown", false],
  ])("should render the Chat Header with %s", (desc, givenExploredExperiencesNotification) => {
    // GIVEN a ChatHeader component
    const givenNumberOfExploredExperiences = 1;
    const givenChatHeader = (
      <ChatHeader
        experiencesExplored={givenNumberOfExploredExperiences}
        exploredExperiencesNotification={givenExploredExperiencesNotification}
        setExploredExperiencesNotification={jest.fn()}
        conversationCompleted={false}
        progressPercentage={0}
        timeUntilNotification={null}
        conversationPhase={ConversationPhase.INTRO}
        collectedExperiences={1}
      />
    );
    // AND a user is logged in
    const mockUser = { id: "123", name: "Foo Bar", email: "foo@bar.baz" };
    jest.spyOn(AuthenticationStateService.getInstance(), "getUser").mockReturnValue(mockUser);

    // WHEN the chat header is rendered
    renderWithChatProvider(givenChatHeader);

    // THEN expect no errors or warning to have occurred
    expect(console.error).not.toHaveBeenCalled();
    expect(console.warn).not.toHaveBeenCalled();
    // AND the chat header to be visible
    expect(screen.getByTestId(DATA_TEST_ID.CHAT_HEADER_CONTAINER)).toBeInTheDocument();
    // AND the view experiences button to be visible
    const viewExperiencesButton = screen.getByTestId(DATA_TEST_ID.CHAT_HEADER_BUTTON_EXPERIENCES);
    expect(viewExperiencesButton).toBeInTheDocument();
    // AND to match the snapshot
    expect(screen.getByTestId(DATA_TEST_ID.CHAT_HEADER_CONTAINER)).toMatchSnapshot();
  });

  describe("chatHeader action tests", () => {
    test("should call handleOpenExperiencesDrawer when the view experiences button is clicked", async () => {
      // GIVEN a ChatHeader component
      const givenNotifyOnExperiencesDrawerOpen = jest.fn();
      const givenChatHeader = (
        <ChatHeader
          experiencesExplored={0}
          exploredExperiencesNotification={true}
          setExploredExperiencesNotification={jest.fn()}
          conversationCompleted={false}
          progressPercentage={0}
          timeUntilNotification={null}
          conversationPhase={ConversationPhase.INTRO}
          collectedExperiences={1}
        />
      );
      // AND the chat header is rendered
      render(
        <ChatProvider
          handleOpenExperiencesDrawer={givenNotifyOnExperiencesDrawerOpen}
          removeMessageFromChat={jest.fn()}
          addMessageToChat={jest.fn()}
        >
          {givenChatHeader}
        </ChatProvider>
      );

      // WHEN the view experiences button is clicked
      const viewExperiencesButton = screen.getByTestId(DATA_TEST_ID.CHAT_HEADER_BUTTON_EXPERIENCES);
      await userEvent.click(viewExperiencesButton);

      // THEN expect handleOpenExperiencesDrawer to be called
      expect(givenNotifyOnExperiencesDrawerOpen).toHaveBeenCalled();
    });

    test("should call handleOpenExperiencesDrawer and send metrics when view experiences button is clicked", async () => {
      // GIVEN a ChatHeader component
      const givenNotifyOnExperiencesDrawerOpen = jest.fn();
      const mockUser = { id: "foo123", name: "Foo", email: "foo@bar" };
      jest.spyOn(AuthenticationStateService.getInstance(), "getUser").mockReturnValue(mockUser);
      const metricsSpy = jest.spyOn(MetricsService.getInstance(), "sendMetricsEvent").mockReturnValue();
      const givenChatHeader = (
        <ChatHeader
          experiencesExplored={0}
          exploredExperiencesNotification={true}
          setExploredExperiencesNotification={jest.fn()}
          conversationCompleted={false}
          progressPercentage={0}
          timeUntilNotification={null}
          conversationPhase={ConversationPhase.INTRO}
          collectedExperiences={1}
        />
      );
      render(
        <ChatProvider
          handleOpenExperiencesDrawer={givenNotifyOnExperiencesDrawerOpen}
          removeMessageFromChat={jest.fn()}
          addMessageToChat={jest.fn()}
        >
          {givenChatHeader}
        </ChatProvider>
      );

      // WHEN the view experiences button is clicked
      const viewExperiencesButton = screen.getByTestId(DATA_TEST_ID.CHAT_HEADER_BUTTON_EXPERIENCES);
      fireEvent.click(viewExperiencesButton);

      // THEN expect handleOpenExperiencesDrawer to be called
      expect(givenNotifyOnExperiencesDrawerOpen).toHaveBeenCalled();
      // AND the metrics event to be sent
      expect(metricsSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          event_type: EventType.UI_INTERACTION,
          user_id: mockUser.id,
          actions: ["view_experiences_and_skills"],
          element_id: DATA_TEST_ID.CHAT_HEADER_BUTTON_EXPERIENCES,
          timestamp: expect.any(String),
          relevant_experiments: {},
          details: {
            conversation_phase: ConversationPhase.INTRO,
            experiences_explored: 0,
            collected_experiences: 1,
          },
        })
      );
    });

    test("should show notification badge when new experience is explored", async () => {
      // GIVEN experience explored
      const givenExploredExperiences = 1;
      // AND the notification badge
      const givenExploredExperiencesNotification = true;

      // WHEN the component is rendered
      const givenChatHeader = (
        <ChatHeader
          experiencesExplored={givenExploredExperiences}
          exploredExperiencesNotification={givenExploredExperiencesNotification}
          setExploredExperiencesNotification={jest.fn()}
          conversationCompleted={false}
          progressPercentage={0}
          timeUntilNotification={null}
          conversationPhase={ConversationPhase.INTRO}
          collectedExperiences={1}
        />
      );
      renderWithChatProvider(givenChatHeader);

      // THEN expect the notification badge to be shown on the view experiences button
      const badge = screen.getByTestId(ANIMATED_BADGE_DATA_TEST_ID.ANIMATED_BADGE);
      expect(badge).toBeInTheDocument();
      // AND the badge content to be displayed
      expect(screen.getByText(givenExploredExperiences)).toBeInTheDocument();
    });

    test("should call setExploredExperiencesNotification(false) when view experiences button is clicked", async () => {
      // GIVEN experience explored and notification shown
      const givenExploredExperiences = 1;
      const givenExploredExperiencesNotification = true;
      const givenNotifyOnExperiencesDrawerOpen = jest.fn();
      const setExploredExperiencesNotification = jest.fn();
      const givenChatHeader = (
        <ChatHeader
          experiencesExplored={givenExploredExperiences}
          exploredExperiencesNotification={givenExploredExperiencesNotification}
          setExploredExperiencesNotification={setExploredExperiencesNotification}
          conversationCompleted={false}
          progressPercentage={0}
          timeUntilNotification={null}
          conversationPhase={ConversationPhase.INTRO}
          collectedExperiences={1}
        />
      );
      render(
        <ChatProvider
          handleOpenExperiencesDrawer={givenNotifyOnExperiencesDrawerOpen}
          removeMessageFromChat={jest.fn()}
          addMessageToChat={jest.fn()}
        >
          {givenChatHeader}
        </ChatProvider>
      );

      // WHEN the view experiences button is clicked
      const viewExperiencesButton = screen.getByTestId(DATA_TEST_ID.CHAT_HEADER_BUTTON_EXPERIENCES);
      await userEvent.click(viewExperiencesButton);

      // THEN expect handleOpenExperiencesDrawer to be called
      await waitFor(() => {
        expect(givenNotifyOnExperiencesDrawerOpen).toHaveBeenCalled();
      });
      // AND the notification to be cleared
      expect(setExploredExperiencesNotification).toHaveBeenCalledWith(false);
    });
  });

  describe("view experiences button", () => {
    test.each([
      ["online", true],
      ["chat.chatMessageField.placeholders.offline", false],
    ])(
      "should render the view experiences button disabled when browser is %s",
      async (_description, browserIsOnline) => {
        mockBrowserIsOnLine(browserIsOnline);
        // GIVEN a ChatHeader component
        const givenChatHeader = (
          <ChatHeader
            experiencesExplored={0}
            exploredExperiencesNotification={false}
            setExploredExperiencesNotification={jest.fn()}
            conversationCompleted={false}
            progressPercentage={0}
            timeUntilNotification={null}
            conversationPhase={ConversationPhase.INTRO}
            collectedExperiences={1}
          />
        );
        // AND the chat header is rendered
        renderWithChatProvider(givenChatHeader);

        // THEN the view experiences button is in the document and has the correct disabled state
        const viewExperiencesButton = screen.getByTestId(DATA_TEST_ID.CHAT_HEADER_BUTTON_EXPERIENCES);
        expect(viewExperiencesButton).toBeInTheDocument();
        expect(viewExperiencesButton).toHaveProperty("disabled", !browserIsOnline);
      }
    );
  });

  describe("Feedback notification", () => {
    beforeEach(() => {
      jest.useFakeTimers();
      mockBrowserIsOnLine(true);
      // Reset mocks
      jest.clearAllMocks();
      // Mock PersistentStorageService
      jest.spyOn(PersistentStorageService, "hasSeenFeedbackNotification").mockReturnValue(false);
      jest.spyOn(PersistentStorageService, "setSeenFeedbackNotification").mockImplementation();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test("should log an warning and exit if no current user exists", () => {
      // GIVEN no active user
      jest.spyOn(AuthenticationStateService.getInstance(), "getUser").mockReturnValue(null);
      // AND experiences explored
      const givenExploredExperiences = 4;
      // AND the time until notification
      const givenTimeUntilNotification = FEEDBACK_NOTIFICATION_DELAY;
      // WHEN the component is rendered
      renderWithChatProvider(
        <ChatHeader
          experiencesExplored={givenExploredExperiences}
          exploredExperiencesNotification={false}
          setExploredExperiencesNotification={jest.fn()}
          conversationCompleted={false}
          progressPercentage={50}
          timeUntilNotification={givenTimeUntilNotification}
          conversationPhase={ConversationPhase.INTRO}
          collectedExperiences={1}
        />
      );
      // AND the time is advanced by the given time until notification
      jest.advanceTimersByTime(givenTimeUntilNotification);
      // THEN expect no feedback notification to be shown
      expect(useSnackbar().enqueueSnackbar).not.toHaveBeenCalled();
      // AND expect a warning to be logged
      expect(console.error).toHaveBeenCalledWith(new SessionError("User is not available"));
    });

    test("should show feedback notification after 30 minutes when conversation progress is <= 66%", async () => {
      // GIVEN mock user
      const mockUser = { id: "123", name: "Foo Bar", email: "foo@bar.baz" };
      jest.spyOn(AuthenticationStateService.getInstance(), "getUser").mockReturnValue(mockUser);
      // AND experiences explored
      const givenExploredExperiences = 4;
      // AND the time until notification
      const givenTimeUntilNotification = FEEDBACK_NOTIFICATION_DELAY;

      // WHEN the component is rendered
      renderWithChatProvider(
        <ChatHeader
          experiencesExplored={givenExploredExperiences}
          exploredExperiencesNotification={false}
          setExploredExperiencesNotification={jest.fn()}
          conversationCompleted={false}
          progressPercentage={50}
          timeUntilNotification={givenTimeUntilNotification}
          conversationPhase={ConversationPhase.INTRO}
          collectedExperiences={1}
        />
      );
      // AND the time is advanced by the given time until notification
      jest.advanceTimersByTime(givenTimeUntilNotification);

      // THEN expect the feedback notification to be shown once
      expect(useSnackbar().enqueueSnackbar).toHaveBeenCalledTimes(1);
      expect(useSnackbar().enqueueSnackbar).toHaveBeenCalledWith(
        expect.any(Object), // since the message is a react element
        expect.objectContaining({
          variant: "info",
          persist: true,
          autoHideDuration: null,
          preventDuplicate: true,
        })
      );
      // AND expect the feedback notification to be marked as seen
      jest.spyOn(PersistentStorageService, "hasSeenFeedbackNotification").mockReturnValue(true);
      // AND no errors or warnings to be shown
      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
    });

    test("should mark feedback notification as seen when reminder link opens feedback form", async () => {
      // GIVEN mock user
      const mockUser = { id: "123", name: "Foo Bar", email: "foo@bar.baz" };
      jest.spyOn(AuthenticationStateService.getInstance(), "getUser").mockReturnValue(mockUser);
      // AND sentry feedback form available
      (Sentry.isInitialized as jest.Mock).mockReturnValue(true);
      const appendToDom = jest.fn();
      const open = jest.fn();
      const createForm = jest.fn().mockResolvedValue({ appendToDom, open });
      (Sentry.getFeedback as jest.Mock).mockReturnValue({ createForm });
      const setSeenSpy = jest.spyOn(PersistentStorageService, "setSeenFeedbackNotification").mockImplementation();

      // WHEN the feedback reminder is shown immediately
      renderWithChatProvider(
        <ChatHeader
          experiencesExplored={1}
          exploredExperiencesNotification={false}
          setExploredExperiencesNotification={jest.fn()}
          conversationCompleted={false}
          progressPercentage={50}
          timeUntilNotification={0}
          conversationPhase={ConversationPhase.INTRO}
          collectedExperiences={1}
        />
      );
      jest.advanceTimersByTime(0);

      // AND the reminder link is clicked
      const [snackbarContent] = (useSnackbar().enqueueSnackbar as jest.Mock).mock.calls[0];
      render(snackbarContent);
      fireEvent.click(screen.getByTestId(DATA_TEST_ID.CHAT_HEADER_FEEDBACK_LINK));

      // THEN the feedback form opens and the reminder is marked as seen
      await waitFor(() => {
        expect(createForm).toHaveBeenCalledTimes(1);
      });
      expect(appendToDom).toHaveBeenCalledTimes(1);
      expect(open).toHaveBeenCalledTimes(1);
      expect(setSeenSpy).toHaveBeenCalledWith(mockUser.id);
    });

    test("should not show feedback notification if conversation progress is > 66%", () => {
      // GIVEN mock user
      const mockUser = { id: "123", name: "", email: "" };
      jest.spyOn(AuthenticationStateService.getInstance(), "getUser").mockReturnValue(mockUser);
      // AND experiences explored
      const givenExploredExperiences = 4;
      // AND the time until notification
      const givenTimeUntilNotification = FEEDBACK_NOTIFICATION_DELAY;

      // WHEN the component is rendered
      renderWithChatProvider(
        <ChatHeader
          experiencesExplored={givenExploredExperiences}
          exploredExperiencesNotification={false}
          setExploredExperiencesNotification={jest.fn()}
          conversationCompleted={false}
          progressPercentage={70}
          timeUntilNotification={givenTimeUntilNotification}
          conversationPhase={ConversationPhase.INTRO}
          collectedExperiences={1}
        />
      );
      // AND the time is advanced by the feedback notification delay
      jest.advanceTimersByTime(FEEDBACK_NOTIFICATION_DELAY);

      // THEN expect no notification to be shown
      expect(useSnackbar().enqueueSnackbar).not.toHaveBeenCalled();
      // AND no errors or warnings to be shown
      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
    });

    test("should not show feedback notification if it is already shown for current user", () => {
      // GIVEN mock user
      const mockUser = { id: "123", name: "", email: "" };
      jest.spyOn(AuthenticationStateService.getInstance(), "getUser").mockReturnValue(mockUser);
      // AND mock feedback notification to return true (already shown)
      jest.spyOn(PersistentStorageService, "hasSeenFeedbackNotification").mockReturnValue(true);
      // AND experiences explored
      const givenExploredExperiences = 4;

      // WHEN the component is rendered
      renderWithChatProvider(
        <ChatHeader
          experiencesExplored={givenExploredExperiences}
          exploredExperiencesNotification={false}
          setExploredExperiencesNotification={jest.fn()}
          conversationCompleted={false}
          progressPercentage={50}
          timeUntilNotification={0}
          conversationPhase={ConversationPhase.INTRO}
          collectedExperiences={1}
        />
      );

      // THEN expect no notification to be shown
      expect(useSnackbar().enqueueSnackbar).not.toHaveBeenCalled();
      // AND no errors or warnings to be shown
      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
    });
  });
});
