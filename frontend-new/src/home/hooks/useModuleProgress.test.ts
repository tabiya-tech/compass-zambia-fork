import "src/_test_utilities/consoleMock";
import "src/_test_utilities/envServiceMock";

import { renderHook, waitFor } from "src/_test_utilities/test-utils";
import { useModuleProgress } from "./useModuleProgress";
import { ConversationPhase } from "src/chat/chatProgressbar/types";
import type { ConversationResponse } from "src/chat/ChatService/ChatService.types";

const mockGetChatHistory = jest.fn();

const mockPrefsInstance = {
  getUserPreferences: jest.fn().mockReturnValue({ sessions: [] }),
  getActiveSessionId: jest.fn().mockReturnValue(null),
};

jest.mock("src/userPreferences/UserPreferencesStateService", () => ({
  __esModule: true,
  default: {
    getInstance: () => mockPrefsInstance,
  },
}));
jest.mock("src/chat/ChatService/ChatService", () => ({
  __esModule: true,
  default: {
    getInstance: () => ({
      getChatHistory: mockGetChatHistory,
    }),
  },
}));

describe("useModuleProgress", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetChatHistory.mockResolvedValue(null);
    mockPrefsInstance.getUserPreferences.mockReturnValue({ sessions: [] });
    mockPrefsInstance.getActiveSessionId.mockReturnValue(null);
  });

  describe("overallProgress and isModuleStarted", () => {
    test("should return overallProgress 0 and isModuleStarted false when no sessions", () => {
      // GIVEN user preferences with no sessions and no active session
      // WHEN the hook is run
      const { result } = renderHook(() => useModuleProgress());

      // THEN overallProgress is 0
      expect(result.current.overallProgress).toBe(0);
      // AND isModuleStarted is false
      expect(result.current.isModuleStarted).toBe(false);
    });

    test("should return isModuleStarted true when user has sessions", () => {
      // GIVEN user preferences with at least one session
      mockPrefsInstance.getUserPreferences.mockReturnValue({ sessions: [{ id: "s1" }] });

      // WHEN the hook is run
      const { result } = renderHook(() => useModuleProgress());

      // THEN isModuleStarted is true
      expect(result.current.isModuleStarted).toBe(true);
    });
  });

  describe("getBadgeStatus", () => {
    test("should return null for modules other than skills_discovery", () => {
      // GIVEN the hook is run (any state)
      const { result } = renderHook(() => useModuleProgress());

      // WHEN getBadgeStatus is called for career_explorer
      const status = result.current.getBadgeStatus("career_explorer");

      // THEN it returns null
      expect(status).toBeNull();
    });

    test("should return null for skills_discovery when there is no active session", () => {
      // GIVEN no active session
      const { result } = renderHook(() => useModuleProgress());

      // WHEN getBadgeStatus is called for skills_discovery
      const status = result.current.getBadgeStatus("skills_discovery");

      // THEN it returns null
      expect(status).toBeNull();
    });

    test("should return continue when active session and phase is COLLECT_EXPERIENCES", async () => {
      // GIVEN an active session and chat history with COLLECT_EXPERIENCES phase
      const history: ConversationResponse = {
        messages: [],
        conversation_completed: false,
        conversation_conducted_at: null,
        experiences_explored: 0,
        current_phase: { phase: ConversationPhase.COLLECT_EXPERIENCES, percentage: 0, current: null, total: null },
      };
      mockGetChatHistory.mockResolvedValue(history);
      mockPrefsInstance.getUserPreferences.mockReturnValue({ sessions: [{ id: "s1" }] });
      mockPrefsInstance.getActiveSessionId.mockReturnValue("session-123");

      // WHEN the hook is run and chat history has loaded
      const { result } = renderHook(() => useModuleProgress());
      await waitFor(() => {
        expect(result.current.getBadgeStatus("skills_discovery")).not.toBeNull();
      });

      // THEN getBadgeStatus returns continue for skills_discovery
      expect(result.current.getBadgeStatus("skills_discovery")).toBe("continue");
    });

    test("should return completed when active session and phase is ENDED", async () => {
      // GIVEN an active session and chat history with ENDED phase
      const history: ConversationResponse = {
        messages: [],
        conversation_completed: true,
        conversation_conducted_at: null,
        experiences_explored: 0,
        current_phase: { phase: ConversationPhase.ENDED, percentage: 100, current: null, total: null },
      };
      mockGetChatHistory.mockResolvedValue(history);
      mockPrefsInstance.getUserPreferences.mockReturnValue({ sessions: [{ id: "s1" }] });
      mockPrefsInstance.getActiveSessionId.mockReturnValue("session-123");

      // WHEN the hook is run and chat history has loaded
      const { result } = renderHook(() => useModuleProgress());
      await waitFor(() => {
        expect(result.current.getBadgeStatus("skills_discovery")).toBe("completed");
      });

      // THEN getBadgeStatus returns completed and overallProgress reflects one completed module
      expect(result.current.getBadgeStatus("skills_discovery")).toBe("completed");
      // AND overallProgress is 20% (1 of 5 modules completed)
      expect(result.current.overallProgress).toBe(20);
    });
  });
});
