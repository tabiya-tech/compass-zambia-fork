import "src/_test_utilities/consoleMock";
import "src/_test_utilities/envServiceMock";
import "src/_test_utilities/sentryMock";

import React from "react";
import { act, render, screen, userEvent, waitFor } from "src/_test_utilities/test-utils";
import PageHeader, { DATA_TEST_ID, MENU_ITEM_ID } from "./PageHeader";
import { routerPaths } from "src/app/routerPaths";
import AuthenticationStateService from "src/auth/services/AuthenticationState.service";
import { MenuItemConfig } from "src/theme/ContextMenu/menuItemConfig.types";
import { resetAllMethodMocks } from "src/_test_utilities/resetAllMethodMocks";
import ContextMenu from "src/theme/ContextMenu/ContextMenu";
import AnonymousAccountConversionDialog, {
  DATA_TEST_ID as ANONYMOUS_DIALOG_DATA_TEST_ID,
} from "src/auth/components/anonymousAccountConversionDialog/AnonymousAccountConversionDialog";
import { DATA_TEST_ID as TEXT_CONFIRM_MODAL_DATA_TEST_ID } from "src/theme/textConfirmModalDialog/TextConfirmModalDialog";
import { DATA_TEST_ID as CONFIRM_MODAL_DATA_TEST_ID } from "src/theme/confirmModalDialog/ConfirmModalDialog";
import { PersistentStorageService } from "src/app/PersistentStorageService/PersistentStorageService";

// Mock PersistentStorageService
jest.mock("src/app/PersistentStorageService/PersistentStorageService");

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return { ...actual, __esModule: true, useNavigate: () => mockNavigate };
});

// Mock useSentryFeedbackForm
const mockOpenFeedbackForm = jest.fn();
jest.mock("src/feedback/hooks/useSentryFeedbackForm", () => ({
  useSentryFeedbackForm: () => ({ sentryEnabled: true, openFeedbackForm: mockOpenFeedbackForm }),
}));

// Mock useSnackbar
const mockEnqueueSnackbar = jest.fn();
jest.mock("src/theme/SnackbarProvider/SnackbarProvider", () => {
  const actual = jest.requireActual("src/theme/SnackbarProvider/SnackbarProvider");
  return {
    ...actual,
    __esModule: true,
    useSnackbar: () => ({ enqueueSnackbar: mockEnqueueSnackbar, closeSnackbar: jest.fn() }),
  };
});

// Mock ContextMenu
jest.mock("src/theme/ContextMenu/ContextMenu", () => {
  const actual = jest.requireActual("src/theme/ContextMenu/ContextMenu");
  const USER_MENU_TEST_ID = "page-header-user-context-menu";
  const OTHER_MENU_TEST_ID = "context-menu-other";
  return {
    __esModule: true,
    default: jest.fn(({ items }: { items: MenuItemConfig[] }) => {
      const isUserMenu = items.some((item) => item.id && String(item.id).includes("page-logout-button"));
      return (
        <div data-testid={isUserMenu ? USER_MENU_TEST_ID : OTHER_MENU_TEST_ID}>
          {items.map((item) => (
            <div key={item.id} data-testid={item.id} onClick={item.action}>
              {item.text}
            </div>
          ))}
        </div>
      );
    }),
    DATA_TEST_ID: actual.DATA_TEST_ID,
  };
});

const PAGE_HEADER_USER_MENU_TEST_ID = "page-header-user-context-menu";

// Mock AnonymousAccountConversionDialog
jest.mock("src/auth/components/anonymousAccountConversionDialog/AnonymousAccountConversionDialog", () => {
  const actual = jest.requireActual(
    "src/auth/components/anonymousAccountConversionDialog/AnonymousAccountConversionDialog"
  );
  return { __esModule: true, ...actual, default: jest.fn(() => <div data-testid={actual.DATA_TEST_ID.DIALOG} />) };
});

// Mock AuthenticationService
const mockLogout = jest.fn();
jest.mock("src/auth/services/Authentication.service.factory", () => ({
  __esModule: true,
  default: { getCurrentAuthenticationService: () => ({ logout: mockLogout }) },
}));

const registeredUser = {
  id: "user-1",
  name: "Test User",
  email: "test@example.com",
} as ReturnType<typeof AuthenticationStateService.prototype.getUser>;

const anonymousUser = {
  id: "anon-1",
  name: "",
  email: "",
} as ReturnType<typeof AuthenticationStateService.prototype.getUser>;

describe("PageHeader", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLogout.mockResolvedValue(undefined);
    (ContextMenu as jest.Mock).mockClear();
    resetAllMethodMocks(AuthenticationStateService.getInstance());
    jest.spyOn(AuthenticationStateService.getInstance(), "getUser").mockReturnValue(registeredUser);
  });

  describe("render", () => {
    test("should render container, logo, title, subtitle, feedback button, and user button", () => {
      // GIVEN a title and optional subtitle
      const givenTitle = "home.dashboard";
      const givenSubtitle = "home.subtitle";

      // WHEN the PageHeader is rendered
      render(<PageHeader title={givenTitle} subtitle={givenSubtitle} />);

      // THEN the container is in the document
      expect(screen.getByTestId(DATA_TEST_ID.PAGE_HEADER_CONTAINER)).toBeInTheDocument();
      // AND the logo and logo link are present
      expect(screen.getByTestId(DATA_TEST_ID.PAGE_HEADER_LOGO)).toBeInTheDocument();
      expect(screen.getByTestId(DATA_TEST_ID.PAGE_HEADER_LOGO_LINK)).toHaveAttribute("href", `#${routerPaths.ROOT}`);
      // AND the title and subtitle are present
      expect(screen.getByTestId(DATA_TEST_ID.PAGE_HEADER_TITLE)).toBeInTheDocument();
      expect(screen.getByTestId(DATA_TEST_ID.PAGE_HEADER_SUBTITLE)).toBeInTheDocument();
      // AND the feedback and user buttons are present
      expect(screen.getByTestId(DATA_TEST_ID.PAGE_HEADER_BUTTON_FEEDBACK)).toBeInTheDocument();
      expect(screen.getByTestId(DATA_TEST_ID.PAGE_HEADER_BUTTON_USER)).toBeInTheDocument();
      expect(screen.getByTestId(DATA_TEST_ID.PAGE_HEADER_ICON_USER)).toBeInTheDocument();
    });
  });

  describe("feedback button", () => {
    test("should call openFeedbackForm when feedback button is clicked", async () => {
      // GIVEN the PageHeader is rendered
      render(<PageHeader title="home.dashboard" />);

      // WHEN the feedback button is clicked
      await userEvent.click(screen.getByTestId(DATA_TEST_ID.PAGE_HEADER_BUTTON_FEEDBACK));

      // THEN openFeedbackForm is called
      expect(mockOpenFeedbackForm).toHaveBeenCalledTimes(1);
    });
  });

  describe("user menu", () => {
    test("should open context menu with logout when user button is clicked", async () => {
      // GIVEN the PageHeader is rendered (registered user, sentry enabled)
      render(<PageHeader title="home.dashboard" />);

      // WHEN the user button is clicked
      await userEvent.click(screen.getByTestId(DATA_TEST_ID.PAGE_HEADER_BUTTON_USER));

      // THEN the user context menu is visible
      expect(screen.getByTestId(PAGE_HEADER_USER_MENU_TEST_ID)).toBeInTheDocument();
      // AND it contains report bug (sentry enabled) and logout
      expect(screen.getByTestId(MENU_ITEM_ID.REPORT_BUG_BUTTON)).toBeInTheDocument();
      expect(screen.getByTestId(MENU_ITEM_ID.LOGOUT_BUTTON)).toBeInTheDocument();
    });

    test("should show register in menu for anonymous user", async () => {
      // GIVEN an anonymous user
      jest.spyOn(AuthenticationStateService.getInstance(), "getUser").mockReturnValue(anonymousUser);

      // WHEN the PageHeader is rendered and user button is clicked
      render(<PageHeader title="home.dashboard" />);
      await userEvent.click(screen.getByTestId(DATA_TEST_ID.PAGE_HEADER_BUTTON_USER));

      // THEN the register item is in the menu
      expect(screen.getByTestId(MENU_ITEM_ID.REGISTER)).toBeInTheDocument();
    });

    test("should not show register in menu for registered user", async () => {
      // GIVEN a registered user (default)
      // WHEN the PageHeader is rendered, and the user button is clicked
      render(<PageHeader title="home.dashboard" />);
      await userEvent.click(screen.getByTestId(DATA_TEST_ID.PAGE_HEADER_BUTTON_USER));

      // THEN the register item is not in the menu
      expect(screen.queryByTestId(MENU_ITEM_ID.REGISTER)).not.toBeInTheDocument();
    });

    test("should close context menu when notifyOnClose is called", async () => {
      // GIVEN the PageHeader is rendered
      render(<PageHeader title="home.dashboard" />);
      // AND the user button is clicked to open the menu
      await userEvent.click(screen.getByTestId(DATA_TEST_ID.PAGE_HEADER_BUTTON_USER));
      expect(screen.getByTestId(PAGE_HEADER_USER_MENU_TEST_ID)).toBeInTheDocument();

      // WHEN notifyOnClose is called (last call is the user menu we just opened)
      act(() => {
        const mock = (ContextMenu as jest.Mock).mock;
        mock.lastCall[0].notifyOnClose();
      });

      // THEN the context menu is closed (re-render: menu is closed so ContextMenu is called with open: false)
      expect(ContextMenu).toHaveBeenLastCalledWith(
        expect.objectContaining({ anchorEl: null, open: false }),
        expect.anything()
      );
    });
  });

  describe("logout", () => {
    test("should logout and navigate to landing when registered user clicks logout", async () => {
      // GIVEN a registered user
      render(<PageHeader title="home.dashboard" />);

      // WHEN the user opens the menu and clicks logout
      await userEvent.click(screen.getByTestId(DATA_TEST_ID.PAGE_HEADER_BUTTON_USER));
      await userEvent.click(screen.getByTestId(MENU_ITEM_ID.LOGOUT_BUTTON));

      // THEN logout is called and navigate is called with landing
      await waitFor(() => expect(mockLogout).toHaveBeenCalled());
      expect(mockNavigate).toHaveBeenCalledWith(routerPaths.LANDING, { replace: true });
    });

    test("should show logout confirmation dialog when anonymous user clicks logout", async () => {
      // GIVEN an anonymous user
      jest.spyOn(AuthenticationStateService.getInstance(), "getUser").mockReturnValue(anonymousUser);
      render(<PageHeader title="home.dashboard" />);

      // WHEN the user opens the menu and clicks logout
      await userEvent.click(screen.getByTestId(DATA_TEST_ID.PAGE_HEADER_BUTTON_USER));
      await userEvent.click(screen.getByTestId(MENU_ITEM_ID.LOGOUT_BUTTON));

      // THEN the confirmation dialog is shown
      expect(screen.getByTestId(TEXT_CONFIRM_MODAL_DATA_TEST_ID.TEXT_CONFIRM_MODAL_CONTENT)).toBeInTheDocument();
    });

    test("should logout and navigate to landing when anonymous user confirms logout from dialog", async () => {
      // GIVEN an anonymous user
      jest.spyOn(AuthenticationStateService.getInstance(), "getUser").mockReturnValue(anonymousUser);
      render(<PageHeader title="home.dashboard" />);

      // WHEN the user opens the menu, clicks logout, then clicks cancel (confirm logout)
      await userEvent.click(screen.getByTestId(DATA_TEST_ID.PAGE_HEADER_BUTTON_USER));
      await userEvent.click(screen.getByTestId(MENU_ITEM_ID.LOGOUT_BUTTON));
      await userEvent.click(screen.getByTestId(CONFIRM_MODAL_DATA_TEST_ID.CONFIRM_MODAL_CANCEL));

      // THEN logout is called and navigate is called with landing
      await waitFor(() => expect(mockLogout).toHaveBeenCalled());
      expect(mockNavigate).toHaveBeenCalledWith(routerPaths.LANDING, { replace: true });
    });

    test("should close logout confirmation when close icon is clicked", async () => {
      // GIVEN an anonymous user and logout confirmation open
      jest.spyOn(AuthenticationStateService.getInstance(), "getUser").mockReturnValue(anonymousUser);
      render(<PageHeader title="home.dashboard" />);
      await userEvent.click(screen.getByTestId(DATA_TEST_ID.PAGE_HEADER_BUTTON_USER));
      await userEvent.click(screen.getByTestId(MENU_ITEM_ID.LOGOUT_BUTTON));
      const dialog = screen.getByTestId(CONFIRM_MODAL_DATA_TEST_ID.CONFIRM_MODAL);

      // WHEN the close icon is clicked
      await userEvent.click(screen.getByTestId(CONFIRM_MODAL_DATA_TEST_ID.CONFIRM_MODAL_CLOSE));

      // THEN the dialog is closed
      await waitFor(() => expect(dialog).not.toBeInTheDocument());
    });
  });

  describe("register", () => {
    test("should open conversion dialog when anonymous user clicks register in menu", async () => {
      // GIVEN an anonymous user
      jest.spyOn(AuthenticationStateService.getInstance(), "getUser").mockReturnValue(anonymousUser);
      render(<PageHeader title="home.dashboard" />);

      // WHEN the user opens the menu and clicks register
      await userEvent.click(screen.getByTestId(DATA_TEST_ID.PAGE_HEADER_BUTTON_USER));
      await userEvent.click(screen.getByTestId(MENU_ITEM_ID.REGISTER));

      // THEN the conversion dialog is shown
      expect(screen.getByTestId(ANONYMOUS_DIALOG_DATA_TEST_ID.DIALOG)).toBeInTheDocument();
    });

    test("should open conversion dialog when anonymous user chooses register from logout confirmation", async () => {
      // GIVEN an anonymous user
      jest.spyOn(AuthenticationStateService.getInstance(), "getUser").mockReturnValue(anonymousUser);
      render(<PageHeader title="home.dashboard" />);

      // WHEN the user opens the menu, clicks logout, then clicks confirm (register)
      await userEvent.click(screen.getByTestId(DATA_TEST_ID.PAGE_HEADER_BUTTON_USER));
      await userEvent.click(screen.getByTestId(MENU_ITEM_ID.LOGOUT_BUTTON));
      await userEvent.click(screen.getByTestId(CONFIRM_MODAL_DATA_TEST_ID.CONFIRM_MODAL_CONFIRM));

      // THEN the conversion dialog is shown
      expect(screen.getByTestId(ANONYMOUS_DIALOG_DATA_TEST_ID.DIALOG)).toBeInTheDocument();
    });

    test("should set account converted flag when conversion succeeds", async () => {
      // GIVEN an anonymous user and conversion dialog open
      jest.spyOn(AuthenticationStateService.getInstance(), "getUser").mockReturnValue(anonymousUser);
      render(<PageHeader title="home.dashboard" />);
      await userEvent.click(screen.getByTestId(DATA_TEST_ID.PAGE_HEADER_BUTTON_USER));
      await userEvent.click(screen.getByTestId(MENU_ITEM_ID.REGISTER));

      // WHEN onSuccess is called on the conversion dialog
      (AnonymousAccountConversionDialog as jest.Mock).mock.calls[0][0].onSuccess();

      // THEN the account converted flag is set
      expect(PersistentStorageService.setAccountConverted).toHaveBeenCalledWith(true);
    });

    test("should close conversion dialog when onClose is called", async () => {
      // GIVEN an anonymous user and conversion dialog open
      jest.spyOn(AuthenticationStateService.getInstance(), "getUser").mockReturnValue(anonymousUser);
      render(<PageHeader title="home.dashboard" />);
      await userEvent.click(screen.getByTestId(DATA_TEST_ID.PAGE_HEADER_BUTTON_USER));
      await userEvent.click(screen.getByTestId(MENU_ITEM_ID.REGISTER));

      // WHEN onClose is called on the conversion dialog
      act(() => {
        (AnonymousAccountConversionDialog as jest.Mock).mock.calls[0][0].onClose();
      });

      // THEN the dialog is called with isOpen false
      expect(AnonymousAccountConversionDialog).toHaveBeenCalledWith(
        expect.objectContaining({ isOpen: false }),
        expect.anything()
      );
    });
  });
});
