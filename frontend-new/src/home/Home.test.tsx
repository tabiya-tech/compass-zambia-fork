import "src/_test_utilities/consoleMock";
import "src/_test_utilities/envServiceMock";
import "src/_test_utilities/sentryMock";

import React from "react";
import { render, screen } from "src/_test_utilities/test-utils";
import Home, { DATA_TEST_ID } from "./Home";
import { getEnabledModules } from "src/home/modulesService";
import { DATA_TEST_ID as MODULE_CARD_DATA_TEST_ID } from "src/home/components/ModuleCard/ModuleCard";
import { DATA_TEST_ID as FOOTER_DATA_TEST_ID } from "src/home/components/Footer/Footer";
import { DATA_TEST_ID as PROGRESS_BAR_DATA_TEST_ID } from "src/home/components/ProgressBar/ProgressBar";
import { BadgeStatus } from "src/home/constants";

// Mock useModuleProgress
const mockOverallProgress = 40;
const mockGetBadgeStatus = jest.fn((_moduleId: string): BadgeStatus => null);
const mockProfileData = { name: "Test User" };

jest.mock("src/profile/hooks/useUserProfile", () => ({
  useUserProfile: () => ({
    profileData: mockProfileData,
  }),
}));

jest.mock("src/home/hooks/useModuleProgress", () => ({
  useModuleProgress: () => ({
    overallProgress: mockOverallProgress,
    getBadgeStatus: mockGetBadgeStatus,
    isModuleStarted: false,
  }),
}));

describe("Home", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetBadgeStatus.mockImplementation((_moduleId: string) => null);
    mockProfileData.name = "Test User";
  });

  describe("render", () => {
    test("should render full layout with container, header, welcome section, progress bar, modules grid, and footer", () => {
      // GIVEN default user and mocked useModuleProgress
      // WHEN the Home page is rendered
      render(<Home />);

      // THEN the home container is in the document
      expect(screen.getByTestId(DATA_TEST_ID.HOME_CONTAINER)).toBeInTheDocument();
      // AND the welcome title and subtitle are present
      expect(screen.getByTestId(DATA_TEST_ID.HOME_WELCOME_TITLE)).toBeInTheDocument();
      expect(screen.getByTestId(DATA_TEST_ID.HOME_WELCOME_SUBTITLE)).toHaveTextContent("mockProduct");
      // AND the progress bar shows the value from useModuleProgress
      expect(screen.getByTestId(PROGRESS_BAR_DATA_TEST_ID.PROGRESS_BAR)).toHaveAttribute("aria-valuenow", "40");
      // AND the module grid is present
      expect(screen.getByTestId(DATA_TEST_ID.HOME_MODULES_GRID)).toBeInTheDocument();
      // AND the footer is present
      expect(screen.getByTestId(FOOTER_DATA_TEST_ID.FOOTER_COLLABORATION)).toBeInTheDocument();
      // AND a module card is rendered for each enabled module
      const cards = screen.getAllByTestId(MODULE_CARD_DATA_TEST_ID.MODULE_CARD);
      expect(cards).toHaveLength(getEnabledModules().length);
    });

    test("should display modules section title and subtitle with translated text", () => {
      // GIVEN default mocks
      // WHEN the Home page is rendered
      render(<Home />);

      // THEN the modules title shows the translated whatToDo text
      expect(screen.getByTestId(DATA_TEST_ID.HOME_MODULES_TITLE)).toHaveTextContent(/what would you like to do today/i);
      // AND the modules subtitle shows the translated whatToDoSubtitle text
      expect(screen.getByTestId(DATA_TEST_ID.HOME_MODULES_SUBTITLE)).toHaveTextContent(/each module is an ai-guided/i);
    });

    test("should show Welcome back with user name when user has a name", () => {
      // GIVEN a user with a name
      mockProfileData.name = "Jane";

      // WHEN the Home page is rendered
      render(<Home />);

      // THEN the welcome title shows Welcome back and the user name
      expect(screen.getByTestId(DATA_TEST_ID.HOME_WELCOME_TITLE)).toHaveTextContent(/Welcome back, Jane/i);
    });

    test("should call getBadgeStatus for each enabled module", () => {
      // GIVEN default mocks
      // WHEN the Home page is rendered
      render(<Home />);

      // THEN getBadgeStatus was called for each enabled module id
      const modules = getEnabledModules();
      const calledModuleIds = mockGetBadgeStatus.mock.calls.map(([moduleId]) => moduleId);
      modules.forEach((m) => expect(calledModuleIds).toContain(m.id));
    });

    test("should show continue chip on skills_discovery card when getBadgeStatus returns continue", () => {
      // GIVEN getBadgeStatus returns continue for skills_discovery
      mockGetBadgeStatus.mockImplementation((moduleId: string) => {
        if (moduleId === "skills_discovery") return "continue" as BadgeStatus;
        return null;
      });

      // WHEN the Home page is rendered
      render(<Home />);

      // THEN the skills_discovery module card shows the continue chip
      expect(screen.getByTestId(MODULE_CARD_DATA_TEST_ID.MODULE_CARD_CONTINUE_CHIP)).toBeInTheDocument();
    });

    test("should show completed chip on skills_discovery card when getBadgeStatus returns completed", () => {
      // GIVEN getBadgeStatus returns completed for skills_discovery
      mockGetBadgeStatus.mockImplementation((moduleId: string) => {
        if (moduleId === "skills_discovery") return "completed" as BadgeStatus;
        return null;
      });

      // WHEN the Home page is rendered
      render(<Home />);

      // THEN the skills_discovery module card shows the completed chip
      expect(screen.getByTestId(MODULE_CARD_DATA_TEST_ID.MODULE_CARD_COMPLETED_CHIP)).toBeInTheDocument();
    });
  });
});
