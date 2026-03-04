import "src/_test_utilities/consoleMock";

import React from "react";
import { render, screen } from "src/_test_utilities/test-utils";
import { Bushbaby, DATA_TEST_ID, BushbabyProps } from "./Bushbaby";

describe("Bushbaby", () => {
  it("should render the bushbaby with the default props", () => {
    const children = <div data-testid="children" />;
    render(<Bushbaby>{children}</Bushbaby>);

    expect(screen.getByTestId("children")).toBeInTheDocument();

    const actualBushbaby = screen.getByTestId(DATA_TEST_ID.BUSHBABY);
    expect(actualBushbaby).toBeInTheDocument();

    expect(actualBushbaby).toMatchSnapshot();
  });

  it("should render the bushbaby with given props", () => {
    const children = <div data-testid="children" />;
    const givenProps: BushbabyProps = {
      width: "100px",
      strokeColor: "green",
      bodyColor: "red",
      faceColor: "blue",
    };
    render(<Bushbaby {...givenProps}>{children}</Bushbaby>);

    expect(screen.getByTestId("children")).toBeInTheDocument();

    const actualBushbaby = screen.getByTestId(DATA_TEST_ID.BUSHBABY);
    expect(actualBushbaby).toBeInTheDocument();

    expect(actualBushbaby).toMatchSnapshot();
  });
});
