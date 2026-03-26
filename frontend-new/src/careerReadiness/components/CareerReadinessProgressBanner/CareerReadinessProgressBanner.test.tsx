import "src/_test_utilities/consoleMock";
import "src/_test_utilities/envServiceMock";

import React from "react";
import { render, screen } from "src/_test_utilities/test-utils";
import CareerReadinessProgressBanner, { DATA_TEST_ID } from "./CareerReadinessProgressBanner";
import type { ModuleSummary } from "src/careerReadiness/types";

const makeModule = (id: string, status: ModuleSummary["status"]): ModuleSummary => ({
  id,
  title: id,
  description: "",
  icon: "",
  status,
  sort_order: 0,
  input_placeholder: "",
});

describe("CareerReadinessProgressBanner", () => {
  test("should show 50% when 3 of 6 modules are completed", () => {
    // GIVEN 6 modules, 3 completed
    const modules = [
      makeModule("m1", "COMPLETED"),
      makeModule("m2", "COMPLETED"),
      makeModule("m3", "COMPLETED"),
      makeModule("m4", "IN_PROGRESS"),
      makeModule("m5", "NOT_STARTED"),
      makeModule("m6", "NOT_STARTED"),
    ];

    // WHEN rendered
    render(<CareerReadinessProgressBanner modules={modules} />);

    // THEN percentage shows 50%
    expect(screen.getByTestId(DATA_TEST_ID.PROGRESS_BAR)).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();

    // AND completed count shows 3
    const completedBox = screen.getByTestId(DATA_TEST_ID.PROGRESS_COMPLETED);
    expect(completedBox).toHaveTextContent("3");

    // AND remaining count shows 3
    const remainingBox = screen.getByTestId(DATA_TEST_ID.PROGRESS_REMAINING);
    expect(remainingBox).toHaveTextContent("3");
  });

  test("should show 0% when no modules are completed", () => {
    // GIVEN modules with none completed
    const modules = [makeModule("m1", "NOT_STARTED"), makeModule("m2", "NOT_STARTED")];

    // WHEN rendered
    render(<CareerReadinessProgressBanner modules={modules} />);

    // THEN percentage is 0%
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  test("should show 100% when all modules are completed", () => {
    // GIVEN all modules completed
    const modules = [makeModule("m1", "COMPLETED"), makeModule("m2", "COMPLETED")];

    // WHEN rendered
    render(<CareerReadinessProgressBanner modules={modules} />);

    // THEN percentage is 100%
    expect(screen.getByText("100%")).toBeInTheDocument();

    // AND remaining count shows 0
    const remainingBox = screen.getByTestId(DATA_TEST_ID.PROGRESS_REMAINING);
    expect(remainingBox).toHaveTextContent("0");
  });

  test("should show 0% when modules list is empty", () => {
    // GIVEN no modules
    render(<CareerReadinessProgressBanner modules={[]} />);

    // THEN percentage is 0%
    expect(screen.getByText("0%")).toBeInTheDocument();
  });
});
