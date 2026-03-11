import "src/_test_utilities/consoleMock";
import "src/_test_utilities/envServiceMock";

import { renderHook, waitFor } from "src/_test_utilities/test-utils";
import { useUserProfile } from "./useUserProfile";
import CareerReadinessService from "src/careerReadiness/services/CareerReadinessService";
import type { ModuleSummary } from "src/careerReadiness/types";

// Mock all external dependencies
jest.mock("src/careerReadiness/services/CareerReadinessService");
jest.mock("src/auth/services/AuthenticationState.service", () => ({
  __esModule: true,
  default: { getInstance: jest.fn(() => ({ getUser: jest.fn(() => ({ id: "user-1", email: "test@test.com" })) })) },
}));
jest.mock("src/userPreferences/UserPreferencesStateService", () => ({
  __esModule: true,
  default: {
    getInstance: jest.fn(() => ({
      getUserPreferences: jest.fn(() => ({ accepted_tc: null, language: "en" })),
    })),
  },
}));
jest.mock("./utils/fetchPersonalData", () => ({
  fetchPersonalData: jest.fn(() => Promise.resolve({ name: null, location: null, school: null, program: null, year: null })),
}));
jest.mock("./utils/fetchSkills", () => ({
  fetchSkills: jest.fn(() => Promise.resolve([])),
}));

const mockModules: ModuleSummary[] = [
  { id: "m1", title: "Module 1", description: "", icon: "", status: "COMPLETED", sort_order: 1, input_placeholder: "" },
  { id: "m2", title: "Module 2", description: "", icon: "", status: "IN_PROGRESS", sort_order: 2, input_placeholder: "" },
];

describe("useUserProfile", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (CareerReadinessService.getInstance as jest.Mock).mockReturnValue({
      listModules: jest.fn(() => Promise.resolve({ modules: mockModules })),
    });
  });

  test("should fetch and return module statuses from CareerReadinessService", async () => {
    // WHEN the hook is rendered
    const { result } = renderHook(() => useUserProfile());

    // THEN eventually modules are populated from the API
    await waitFor(() => {
      expect(result.current.isLoadingModules).toBe(false);
    });

    expect(result.current.profileData.modules).toEqual(mockModules);
  });

  test("should set modules error when API call fails", async () => {
    // GIVEN the service throws
    (CareerReadinessService.getInstance as jest.Mock).mockReturnValue({
      listModules: jest.fn(() => Promise.reject(new Error("Network error"))),
    });

    // WHEN the hook is rendered
    const { result } = renderHook(() => useUserProfile());

    // THEN modules error is set and modules remain empty
    await waitFor(() => {
      expect(result.current.isLoadingModules).toBe(false);
    });

    expect(result.current.errors.modules).toBeInstanceOf(Error);
    expect(result.current.profileData.modules).toEqual([]);
  });
});
