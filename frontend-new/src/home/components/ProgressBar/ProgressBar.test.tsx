import "src/_test_utilities/consoleMock";
import "src/_test_utilities/envServiceMock";

import React from "react";
import { render, screen, userEvent } from "src/_test_utilities/test-utils";
import ProgressBar, { DATA_TEST_ID } from "./ProgressBar";
import { routerPaths } from "src/app/routerPaths";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    __esModule: true,
    useNavigate: () => mockNavigate,
  };
});

describe("ProgressBar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should render container, progress bar, profile strength text, see profile link, and hint", () => {
    // GIVEN a progress value in the 0-100 range
    const givenProgress = 40;

    // WHEN the ProgressBar is rendered
    render(<ProgressBar progress={givenProgress} />);

    // THEN the container is in the document
    const container = screen.getByTestId(DATA_TEST_ID.PROGRESS_BAR_CONTAINER);
    expect(container).toBeInTheDocument();
    // AND the progress bar shows the value
    const progressBar = screen.getByTestId(DATA_TEST_ID.PROGRESS_BAR);
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute("aria-valuenow", "40");
    // AND the profile strength text, see a profile link, and a hint is present
    expect(screen.getByTestId(DATA_TEST_ID.PROGRESS_BAR_STRENGTH_TEXT)).toBeInTheDocument();
    expect(screen.getByTestId(DATA_TEST_ID.PROGRESS_BAR_SEE_PROFILE_LINK)).toBeInTheDocument();
    expect(screen.getByTestId(DATA_TEST_ID.PROGRESS_BAR_HINT)).toBeInTheDocument();
    // AND to match the snapshot
    expect(container).toMatchSnapshot();
  });

  test("should navigate to settings when see profile link is clicked", async () => {
    // GIVEN the ProgressBar is rendered
    render(<ProgressBar progress={30} />);

    // WHEN the see profile link is clicked
    await userEvent.click(screen.getByTestId(DATA_TEST_ID.PROGRESS_BAR_SEE_PROFILE_LINK));

    // THEN navigate is called with the settings route
    expect(mockNavigate).toHaveBeenCalledWith(routerPaths.SETTINGS);
  });
});
