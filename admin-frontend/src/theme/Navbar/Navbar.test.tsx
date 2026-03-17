// mock the console logs
import "src/_test_utilities/consoleMock";

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ThemeProvider } from "@mui/material";
import Navbar, { DATA_TEST_ID } from "./Navbar";
import { applicationTheme, ThemeMode } from "src/theme/applicationTheme/applicationTheme";
import UserStateService from "src/userState/UserStateService";
import AuthenticationStateService from "src/auth/services/AuthenticationState.service";
import { Role } from "src/auth/services/FirebaseAuthenticationService/types";

// Mock the envService
jest.mock("src/envService", () => ({
  getLogoUrl: jest.fn(() => "/test-logo.svg"),
  getProductName: jest.fn(() => "TestApp"),
}));

// Mock i18next
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue: string) => defaultValue,
  }),
}));

const theme = applicationTheme(ThemeMode.LIGHT);

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe("Navbar", () => {
  const mockOnLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    UserStateService.getInstance().clearUserState();
    AuthenticationStateService.getInstance().clearUser();
  });

  describe("render", () => {
    test("should render the navbar with logo and profile button", () => {
      // GIVEN an admin user state is set
      UserStateService.getInstance().setUserState({
        id: "user-123",
        name: "John Doe",
        email: "john@example.com",
        accessRole: { role: Role.ADMIN },
      });

      // WHEN rendering the Navbar
      renderWithTheme(<Navbar onLogout={mockOnLogout} />);

      // THEN expect the navbar container to be visible
      expect(screen.getByTestId(DATA_TEST_ID.NAVBAR_CONTAINER)).toBeInTheDocument();

      // AND expect the logo to be visible
      expect(screen.getByTestId(DATA_TEST_ID.NAVBAR_LOGO)).toBeInTheDocument();

      // AND expect the logo text to be visible
      expect(screen.getByTestId(DATA_TEST_ID.NAVBAR_LOGO_TEXT)).toBeInTheDocument();

      // AND expect the profile button to be visible
      expect(screen.getByTestId(DATA_TEST_ID.NAVBAR_PROFILE_BUTTON)).toBeInTheDocument();
    });

    test("should display the correct logo alt text", () => {
      // GIVEN an admin user state is set
      UserStateService.getInstance().setUserState({
        id: "user-123",
        name: "John Doe",
        email: "john@example.com",
        accessRole: { role: Role.ADMIN },
      });

      // WHEN rendering the Navbar
      renderWithTheme(<Navbar onLogout={mockOnLogout} />);

      // THEN expect the logo to have the correct src
      const logo = screen.getByTestId(DATA_TEST_ID.NAVBAR_LOGO);
      expect(logo).toHaveAttribute("src", "/test-logo.svg");
    });
  });

  describe("profile menu", () => {
    test("should open the profile menu when clicking the profile button", async () => {
      // GIVEN an admin user state is set
      UserStateService.getInstance().setUserState({
        id: "user-123",
        name: "John Doe",
        email: "john@example.com",
        accessRole: { role: Role.ADMIN },
      });

      // AND the navbar is rendered
      renderWithTheme(<Navbar onLogout={mockOnLogout} />);

      // WHEN clicking the profile button
      const profileButton = screen.getByTestId(DATA_TEST_ID.NAVBAR_PROFILE_BUTTON);
      fireEvent.click(profileButton);

      // THEN expect the menu to be visible with user info
      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
    });

    test("should display admin role badge for admin users", async () => {
      // GIVEN an admin user state is set
      UserStateService.getInstance().setUserState({
        id: "user-123",
        name: "John Doe",
        email: "john@example.com",
        accessRole: { role: Role.ADMIN },
      });

      // AND the navbar is rendered
      renderWithTheme(<Navbar onLogout={mockOnLogout} />);

      // WHEN clicking the profile button
      const profileButton = screen.getByTestId(DATA_TEST_ID.NAVBAR_PROFILE_BUTTON);
      fireEvent.click(profileButton);

      // THEN expect the admin role badge to be visible
      await waitFor(() => {
        expect(screen.getByText("Admin")).toBeInTheDocument();
      });
    });

    test("should display institution staff role badge for institution staff users", async () => {
      // GIVEN an institution staff user state is set
      UserStateService.getInstance().setUserState({
        id: "user-456",
        name: "Jane Smith",
        email: "jane@example.com",
        accessRole: { role: Role.INSTITUTION_STAFF, institutionId: "inst-789" },
      });

      // AND the navbar is rendered
      renderWithTheme(<Navbar onLogout={mockOnLogout} />);

      // WHEN clicking the profile button
      const profileButton = screen.getByTestId(DATA_TEST_ID.NAVBAR_PROFILE_BUTTON);
      fireEvent.click(profileButton);

      // THEN expect the institution staff role badge to be visible
      await waitFor(() => {
        expect(screen.getByText("Institution Staff")).toBeInTheDocument();
      });
    });

    test("should display email only when name is not available", async () => {
      // GIVEN a user state with no name is set
      UserStateService.getInstance().setUserState({
        id: "user-123",
        name: "",
        email: "john@example.com",
        accessRole: { role: Role.ADMIN },
      });

      // AND the navbar is rendered
      renderWithTheme(<Navbar onLogout={mockOnLogout} />);

      // WHEN clicking the profile button
      const profileButton = screen.getByTestId(DATA_TEST_ID.NAVBAR_PROFILE_BUTTON);
      fireEvent.click(profileButton);

      // THEN expect only the email to be visible as the primary text
      await waitFor(() => {
        expect(screen.getByText("john@example.com")).toBeInTheDocument();
      });
    });
  });

  describe("logout", () => {
    test("should call onLogout when clicking the logout button", async () => {
      // GIVEN an admin user state is set
      UserStateService.getInstance().setUserState({
        id: "user-123",
        name: "John Doe",
        email: "john@example.com",
        accessRole: { role: Role.ADMIN },
      });

      // AND the navbar is rendered
      renderWithTheme(<Navbar onLogout={mockOnLogout} />);

      // AND the profile menu is opened
      const profileButton = screen.getByTestId(DATA_TEST_ID.NAVBAR_PROFILE_BUTTON);
      fireEvent.click(profileButton);

      // WHEN clicking the logout button
      await waitFor(() => {
        expect(screen.getByText("Logout")).toBeInTheDocument();
      });
      const logoutButton = screen.getByText("Logout");
      fireEvent.click(logoutButton);

      // THEN expect onLogout to be called
      expect(mockOnLogout).toHaveBeenCalledTimes(1);
    });
  });

  describe("accessibility", () => {
    test("should have correct aria attributes on profile button", () => {
      // GIVEN an admin user state is set
      UserStateService.getInstance().setUserState({
        id: "user-123",
        name: "John Doe",
        email: "john@example.com",
        accessRole: { role: Role.ADMIN },
      });

      // WHEN rendering the Navbar
      renderWithTheme(<Navbar onLogout={mockOnLogout} />);

      // THEN expect the profile button to have correct aria-label
      const profileButton = screen.getByTestId(DATA_TEST_ID.NAVBAR_PROFILE_BUTTON);
      expect(profileButton).toHaveAttribute("aria-label", "Profile menu");
      expect(profileButton).toHaveAttribute("aria-haspopup", "true");
    });

    test("should update aria-expanded when menu is opened", async () => {
      // GIVEN an admin user state is set
      UserStateService.getInstance().setUserState({
        id: "user-123",
        name: "John Doe",
        email: "john@example.com",
        accessRole: { role: Role.ADMIN },
      });

      // AND the navbar is rendered
      renderWithTheme(<Navbar onLogout={mockOnLogout} />);

      // WHEN clicking the profile button
      const profileButton = screen.getByTestId(DATA_TEST_ID.NAVBAR_PROFILE_BUTTON);
      fireEvent.click(profileButton);

      // THEN expect aria-expanded to be true
      await waitFor(() => {
        expect(profileButton).toHaveAttribute("aria-expanded", "true");
      });
    });
  });

  describe("fallback to AuthenticationStateService", () => {
    test("should display user info from AuthenticationStateService when UserStateService is empty", async () => {
      // GIVEN UserStateService is empty
      UserStateService.getInstance().clearUserState();

      // AND AuthenticationStateService has user data
      AuthenticationStateService.getInstance().setUser({
        id: "auth-user-123",
        name: "Auth User",
        email: "auth@example.com",
      });

      // WHEN rendering the Navbar
      renderWithTheme(<Navbar onLogout={mockOnLogout} />);

      // AND clicking the profile button
      const profileButton = screen.getByTestId(DATA_TEST_ID.NAVBAR_PROFILE_BUTTON);
      fireEvent.click(profileButton);

      // THEN expect user info from AuthenticationStateService to be displayed
      await waitFor(() => {
        expect(screen.getByText("Auth User")).toBeInTheDocument();
      });
      expect(screen.getByText("auth@example.com")).toBeInTheDocument();
    });

    test("should not display role badge when UserStateService is empty (no access role)", async () => {
      // GIVEN UserStateService is empty
      UserStateService.getInstance().clearUserState();

      // AND AuthenticationStateService has user data
      AuthenticationStateService.getInstance().setUser({
        id: "auth-user-123",
        name: "Auth User",
        email: "auth@example.com",
      });

      // WHEN rendering the Navbar
      renderWithTheme(<Navbar onLogout={mockOnLogout} />);

      // AND clicking the profile button
      const profileButton = screen.getByTestId(DATA_TEST_ID.NAVBAR_PROFILE_BUTTON);
      fireEvent.click(profileButton);

      // THEN expect no role badge to be displayed
      await waitFor(() => {
        expect(screen.getByText("Auth User")).toBeInTheDocument();
      });
      expect(screen.queryByText("Admin")).not.toBeInTheDocument();
      expect(screen.queryByText("Institution Staff")).not.toBeInTheDocument();
    });
  });
});
