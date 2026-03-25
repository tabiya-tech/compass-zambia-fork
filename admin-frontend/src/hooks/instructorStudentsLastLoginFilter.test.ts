import { lastLoginDisplayMatchesFilter } from "./instructorStudentsLastLoginFilter";

describe("lastLoginDisplayMatchesFilter", () => {
  it("today only matches Today", () => {
    expect(lastLoginDisplayMatchesFilter("Today", "today")).toBe(true);
    expect(lastLoginDisplayMatchesFilter("Yesterday", "today")).toBe(false);
    expect(lastLoginDisplayMatchesFilter("2 days ago", "today")).toBe(false);
  });

  it("week matches last ~7 days window used by formatLastLogin", () => {
    expect(lastLoginDisplayMatchesFilter("Today", "week")).toBe(true);
    expect(lastLoginDisplayMatchesFilter("Yesterday", "week")).toBe(true);
    expect(lastLoginDisplayMatchesFilter("2 days ago", "week")).toBe(true);
    expect(lastLoginDisplayMatchesFilter("7 days ago", "week")).toBe(true);
    expect(lastLoginDisplayMatchesFilter("8 days ago", "week")).toBe(false);
  });

  it("older matches Never and 8+ days", () => {
    expect(lastLoginDisplayMatchesFilter("Never", "older")).toBe(true);
    expect(lastLoginDisplayMatchesFilter("8 days ago", "older")).toBe(true);
    expect(lastLoginDisplayMatchesFilter("Yesterday", "older")).toBe(false);
    expect(lastLoginDisplayMatchesFilter("Today", "older")).toBe(false);
  });
});
