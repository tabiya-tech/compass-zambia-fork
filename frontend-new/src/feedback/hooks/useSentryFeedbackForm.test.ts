import "src/_test_utilities/consoleMock";
import "src/_test_utilities/sentryMock";

import { renderHook, waitFor } from "src/_test_utilities/test-utils";
import { useSentryFeedbackForm } from "./useSentryFeedbackForm";
import * as Sentry from "@sentry/react";
import authenticationStateService from "src/auth/services/AuthenticationState.service";
import { PersistentStorageService } from "src/app/PersistentStorageService/PersistentStorageService";

jest.mock("src/app/PersistentStorageService/PersistentStorageService");

const mockCreateForm = jest.fn();
const mockGetFeedback = jest.fn();

describe("useSentryFeedbackForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateForm.mockResolvedValue({
      appendToDom: jest.fn(),
      open: jest.fn(),
    });
    mockGetFeedback.mockReturnValue({ createForm: mockCreateForm });
    (Sentry.getFeedback as jest.Mock).mockImplementation(mockGetFeedback);
    (Sentry.isInitialized as jest.Mock).mockReturnValue(false);
  });

  describe("sentryEnabled", () => {
    test("should return sentryEnabled false when Sentry is not initialized", async () => {
      // GIVEN Sentry.isInitialized returns false
      (Sentry.isInitialized as jest.Mock).mockReturnValue(false);

      // WHEN the hook is run
      const { result } = renderHook(() => useSentryFeedbackForm());

      // THEN sentryEnabled is false (after effect runs)
      await waitFor(() => {
        expect(result.current.sentryEnabled).toBe(false);
      });
    });

    test("should return sentryEnabled true when Sentry is initialized", async () => {
      // GIVEN Sentry.isInitialized returns true
      (Sentry.isInitialized as jest.Mock).mockReturnValue(true);

      // WHEN the hook is run
      const { result } = renderHook(() => useSentryFeedbackForm());

      // THEN sentryEnabled is true
      await waitFor(() => {
        expect(result.current.sentryEnabled).toBe(true);
      });
    });
  });

  describe("openFeedbackForm", () => {
    test("should return false when Sentry is not initialized", async () => {
      // GIVEN Sentry is not initialized
      (Sentry.isInitialized as jest.Mock).mockReturnValue(false);
      const { result } = renderHook(() => useSentryFeedbackForm());
      await waitFor(() => expect(result.current.sentryEnabled).toBe(false));

      // WHEN openFeedbackForm is called
      const opened = await result.current.openFeedbackForm();

      // THEN it returns false
      expect(opened).toBe(false);
      expect(Sentry.getFeedback).not.toHaveBeenCalled();
    });

    test("should create and open form and return true when Sentry is initialized", async () => {
      // GIVEN Sentry is initialized and getFeedback returns a form builder
      (Sentry.isInitialized as jest.Mock).mockReturnValue(true);
      const { result } = renderHook(() => useSentryFeedbackForm());
      await waitFor(() => expect(result.current.sentryEnabled).toBe(true));

      // WHEN openFeedbackForm is called
      const opened = await result.current.openFeedbackForm();

      // THEN it returns true and createForm was called
      expect(opened).toBe(true);
      expect(Sentry.getFeedback).toHaveBeenCalled();
      expect(mockCreateForm).toHaveBeenCalled();
    });

    test("should call setSeenFeedbackNotification when markNotificationSeen is true and user exists", async () => {
      // GIVEN Sentry is initialized and the user exists
      (Sentry.isInitialized as jest.Mock).mockReturnValue(true);
      const givenUserId = "user-123";
      jest.spyOn(authenticationStateService.getInstance(), "getUser").mockReturnValue({
        id: givenUserId,
        name: "Test",
        email: "test@test.com",
      } as unknown as ReturnType<ReturnType<typeof authenticationStateService.getInstance>["getUser"]>);
      const { result } = renderHook(() => useSentryFeedbackForm());
      await waitFor(() => expect(result.current.sentryEnabled).toBe(true));

      // WHEN openFeedbackForm is called with markNotificationSeen true
      await result.current.openFeedbackForm({ markNotificationSeen: true });

      // THEN setSeenFeedbackNotification was called with the user id
      expect(PersistentStorageService.setSeenFeedbackNotification).toHaveBeenCalledWith(givenUserId);
    });
  });
});
