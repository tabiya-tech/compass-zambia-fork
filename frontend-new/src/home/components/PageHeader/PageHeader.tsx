import React, { useCallback, useContext, useMemo, useState, startTransition } from "react";
import { Box, Typography, useTheme, useMediaQuery } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { NavLink, useNavigate } from "react-router-dom";
import { routerPaths } from "src/app/routerPaths";
import PrimaryIconButton from "src/theme/PrimaryIconButton/PrimaryIconButton";
import ContextMenu from "src/theme/ContextMenu/ContextMenu";
import { MenuItemConfig } from "src/theme/ContextMenu/menuItemConfig.types";
import { IsOnlineContext } from "src/app/isOnlineProvider/IsOnlineProvider";
import AuthenticationServiceFactory from "src/auth/services/Authentication.service.factory";
import LanguageContextMenu from "src/i18n/languageContextMenu/LanguageContextMenu";
import { getAppIconUrl } from "src/envService";
import { useSnackbar } from "src/theme/SnackbarProvider/SnackbarProvider";
import { useTranslation } from "react-i18next";
import type { TranslationKey } from "src/react-i18next";
import FeedbackOutlinedIcon from "@mui/icons-material/FeedbackOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import authenticationStateService from "src/auth/services/AuthenticationState.service";
import { PersistentStorageService } from "src/app/PersistentStorageService/PersistentStorageService";
import AnonymousAccountConversionDialog from "src/auth/components/anonymousAccountConversionDialog/AnonymousAccountConversionDialog";
import TextConfirmModalDialog from "src/theme/textConfirmModalDialog/TextConfirmModalDialog";
import { HighlightedSpan } from "src/consent/components/consentPage/Consent";
import { Backdrop } from "src/theme/Backdrop/Backdrop";
import { useSentryFeedbackForm } from "src/feedback/hooks/useSentryFeedbackForm";
import { parseEnvSupportedLocales } from "src/i18n/languageContextMenu/parseEnvSupportedLocales";
import { LocalesLabels } from "src/i18n/constants";
import BackButton from "src/knowledgeHub/components/BackButton";

const uniqueId = "b2e4c1a8-3f5d-4e6a-9c7b-1d2e3f4a5b6c";

export const DATA_TEST_ID = {
  PAGE_HEADER_CONTAINER: `page-header-container-${uniqueId}`,
  PAGE_HEADER_LOGO: `page-header-logo-${uniqueId}`,
  PAGE_HEADER_LOGO_LINK: `page-header-logo-link-${uniqueId}`,
  PAGE_HEADER_TITLE: `page-header-title-${uniqueId}`,
  PAGE_HEADER_SUBTITLE: `page-header-subtitle-${uniqueId}`,
  PAGE_HEADER_BACK_LINK: `page-header-back-link-${uniqueId}`,
  PAGE_HEADER_BUTTON_USER: `page-header-button-user-${uniqueId}`,
  PAGE_HEADER_ICON_USER: `page-header-icon-user-${uniqueId}`,
  PAGE_HEADER_BUTTON_FEEDBACK: `page-header-button-feedback-${uniqueId}`,
  PAGE_HEADER_BUTTON_MENU: `page-header-button-menu-${uniqueId}`,
  PAGE_HEADER_MOBILE_LANGUAGE_TRIGGER: `page-header-mobile-language-trigger-${uniqueId}`,
};

export const MENU_ITEM_ID = {
  LOGOUT_BUTTON: `page-logout-button-${uniqueId}`,
  REPORT_BUG_BUTTON: `report-bug-button-${uniqueId}`,
  REGISTER: `register-${uniqueId}`,
  VIEW_PROFILE: `page-header-view-profile-${uniqueId}`,
  MOBILE_LANGUAGE: `page-header-mobile-language-${uniqueId}`,
};

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backLinkLabel?: string;
  onBackClick?: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, backLinkLabel, onBackClick }) => {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));
  const { enqueueSnackbar } = useSnackbar();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [languageSubmenuAnchorEl, setLanguageSubmenuAnchorEl] = useState<HTMLElement | null>(null);
  const [showConversionDialog, setShowConversionDialog] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const isOnline = useContext(IsOnlineContext);
  const { sentryEnabled, openFeedbackForm } = useSentryFeedbackForm();

  const user = authenticationStateService.getInstance().getUser();
  const isAnonymous = !user?.name || !user?.email;

  const logoUrlFromEnv = getAppIconUrl();
  const logoSrc = logoUrlFromEnv || `${process.env.PUBLIC_URL}/compass.svg`;

  const handleGiveFeedback = useCallback(async () => {
    await openFeedbackForm();
  }, [openFeedbackForm]);

  const handleReportBug = useCallback(() => {
    void openFeedbackForm();
  }, [openFeedbackForm]);

  const handleLogout = useCallback(async () => {
    if (isAnonymous) {
      setShowLogoutConfirmation(true);
    } else {
      setIsLoggingOut(true);
      const authenticationService = AuthenticationServiceFactory.getCurrentAuthenticationService();
      await authenticationService!.logout();
      navigate(routerPaths.LANDING, { replace: true });
      enqueueSnackbar(t("chat.chat.notifications.logoutSuccess"), { variant: "success" });
      setIsLoggingOut(false);
    }
  }, [isAnonymous, enqueueSnackbar, navigate, t]);

  const handleConfirmLogout = useCallback(async () => {
    setShowLogoutConfirmation(false);
    setIsLoggingOut(true);
    const authenticationService = AuthenticationServiceFactory.getCurrentAuthenticationService();
    await authenticationService!.logout();
    navigate(routerPaths.LANDING, { replace: true });
    enqueueSnackbar(t("chat.chat.notifications.logoutSuccess"), { variant: "success" });
    setIsLoggingOut(false);
  }, [enqueueSnackbar, navigate, t]);

  const handleRegister = useCallback(() => {
    setShowLogoutConfirmation(false);
    setShowConversionDialog(true);
  }, []);

  const contextMenuItems: MenuItemConfig[] = useMemo(
    () => [
      {
        id: MENU_ITEM_ID.VIEW_PROFILE,
        text: t("chat.chatHeader.viewMyProfile").toLowerCase(),
        disabled: false,
        action: () => {
          setAnchorEl(null);
          navigate(routerPaths.SETTINGS);
        },
      },
      ...(sentryEnabled
        ? [
            {
              id: MENU_ITEM_ID.REPORT_BUG_BUTTON,
              text: t("feedback.bugReport.reportBug").toLowerCase(),
              disabled: !isOnline,
              action: handleReportBug,
            },
          ]
        : []),
      ...(isAnonymous
        ? [
            {
              id: MENU_ITEM_ID.REGISTER,
              text: t("common.buttons.register").toLowerCase(),
              disabled: !isOnline,
              action: handleRegister,
            },
          ]
        : []),
      {
        id: MENU_ITEM_ID.LOGOUT_BUTTON,
        text: t("common.buttons.logout").toLowerCase(),
        disabled: !isOnline,
        action: () => {
          void handleLogout();
        },
      },
    ],
    [t, sentryEnabled, isOnline, handleReportBug, isAnonymous, handleRegister, handleLogout, navigate]
  );

  const supportedLocales = useMemo(() => parseEnvSupportedLocales(), []);

  const localeMenuItems: MenuItemConfig[] = useMemo(
    () =>
      supportedLocales.map((locale) => ({
        id: `locale-${locale}`,
        text: LocalesLabels[locale],
        disabled: false,
        action: () => {
          void i18n.changeLanguage(locale);
          setAnchorEl(null);
          setLanguageSubmenuAnchorEl(null);
        },
      })),
    [supportedLocales, i18n]
  );

  const mobileMenuItems: MenuItemConfig[] = useMemo(() => {
    return [
      {
        id: MENU_ITEM_ID.VIEW_PROFILE,
        text: t("chat.chatHeader.viewMyProfile").toLowerCase(),
        disabled: false,
        action: () => {
          setAnchorEl(null);
          navigate(routerPaths.SETTINGS);
        },
      },
      {
        id: MENU_ITEM_ID.MOBILE_LANGUAGE,
        text: t("i18n.languageContextMenu.selector" as TranslationKey).toLowerCase(),
        disabled: false,
        action: () => {
          setLanguageSubmenuAnchorEl(anchorEl);
        },
        closeMenuOnClick: false,
        trailingIcon: <ChevronRightOutlinedIcon />,
      },
      ...(sentryEnabled
        ? [
            {
              id: MENU_ITEM_ID.REPORT_BUG_BUTTON,
              text: t("feedback.bugReport.reportBug").toLowerCase(),
              disabled: !isOnline,
              action: handleReportBug,
            },
          ]
        : []),
      ...(isAnonymous
        ? [
            {
              id: MENU_ITEM_ID.REGISTER,
              text: t("common.buttons.register").toLowerCase(),
              disabled: !isOnline,
              action: handleRegister,
            },
          ]
        : []),
      {
        id: MENU_ITEM_ID.LOGOUT_BUTTON,
        text: t("common.buttons.logout").toLowerCase(),
        disabled: !isOnline,
        action: () => {
          void handleLogout();
        },
      },
    ];
  }, [t, anchorEl, sentryEnabled, isOnline, handleReportBug, isAnonymous, handleRegister, handleLogout, navigate]);

  return (
    <>
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: theme.zIndex.appBar,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        {/* Zambia flag stripe: green, red, black, orange */}
        <Box
          className="zambia-stripe"
          sx={{
            width: "100%",
            height: isMobile ? 5 : 8,
            "& svg": {
              display: "block",
              width: "100%",
              height: "100%",
            },
          }}
        >
          <svg viewBox="0 0 1000 10" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <polygon points="0,0 270,0 250,10 0,10" fill="#198a00" />
            <polygon points="270,0 520,0 540,10 250,10" fill="#DE2010" />
            <polygon points="520,0 760,0 740,10 540,10" fill="#000000" />
            <polygon points="760,0 1000,0 1000,10 740,10" fill="#FF6600" />
          </svg>
        </Box>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          textAlign="center"
          gap={theme.fixedSpacing(theme.tabiyaSpacing.sm)}
          paddingX={theme.spacing(isMobile ? theme.tabiyaSpacing.xs : theme.tabiyaSpacing.md)}
          paddingY={theme.spacing(isMobile ? theme.tabiyaSpacing.sm : theme.tabiyaSpacing.md)}
          data-testid={DATA_TEST_ID.PAGE_HEADER_CONTAINER}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <NavLink style={{ lineHeight: 0 }} to={routerPaths.ROOT} data-testid={DATA_TEST_ID.PAGE_HEADER_LOGO_LINK}>
              <img
                src={logoSrc}
                alt={t("app.compassLogoAlt")}
                height={12 * theme.tabiyaSpacing.xl}
                data-testid={DATA_TEST_ID.PAGE_HEADER_LOGO}
              />
            </NavLink>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: theme.tabiyaSpacing.xs,
              justifySelf: "center",
              textAlign: "center",
            }}
          >
            <Typography variant={isMobile ? "h4" : "h3"} data-testid={DATA_TEST_ID.PAGE_HEADER_TITLE}>
              {t(title as TranslationKey)}
            </Typography>
            {subtitle && !isMobile && (
              <Typography variant="body2" color="text.secondary" data-testid={DATA_TEST_ID.PAGE_HEADER_SUBTITLE}>
                {t(subtitle as TranslationKey)}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexDirection: "row",
              gap: theme.spacing(theme.tabiyaSpacing.lg),
              justifySelf: "end",
            }}
          >
            {isMobile ? (
              <PrimaryIconButton
                sx={{ color: theme.palette.common.black }}
                onClick={(event) => setAnchorEl(event.currentTarget)}
                data-testid={DATA_TEST_ID.PAGE_HEADER_BUTTON_MENU}
                title={t("chat.chatHeader.userInfo").toLowerCase()}
              >
                <MenuIcon />
              </PrimaryIconButton>
            ) : (
              <>
                {sentryEnabled && (
                  <PrimaryIconButton
                    sx={{
                      color: theme.palette.common.black,
                    }}
                    onClick={() => {
                      void handleGiveFeedback();
                    }}
                    data-testid={DATA_TEST_ID.PAGE_HEADER_BUTTON_FEEDBACK}
                    title={t("chat.chatHeader.giveFeedback").toLowerCase()}
                    disabled={!isOnline}
                  >
                    <FeedbackOutlinedIcon />
                  </PrimaryIconButton>
                )}
                <LanguageContextMenu removeMargin={true} />
                <PrimaryIconButton
                  sx={{
                    color: theme.palette.common.black,
                  }}
                  onClick={(event) => setAnchorEl(event.currentTarget)}
                  data-testid={DATA_TEST_ID.PAGE_HEADER_BUTTON_USER}
                  title={t("chat.chatHeader.userInfo").toLowerCase()}
                >
                  <img
                    src={`${process.env.PUBLIC_URL}/user-icon.svg`}
                    alt={t("chat.chatHeader.userIconAlt")}
                    data-testid={DATA_TEST_ID.PAGE_HEADER_ICON_USER}
                  />
                </PrimaryIconButton>
              </>
            )}
          </Box>
          <ContextMenu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            notifyOnClose={() => {
              setAnchorEl(null);
              setLanguageSubmenuAnchorEl(null);
            }}
            items={isMobile ? mobileMenuItems : contextMenuItems}
          />
          <ContextMenu
            anchorEl={languageSubmenuAnchorEl}
            open={Boolean(languageSubmenuAnchorEl)}
            notifyOnClose={() => setLanguageSubmenuAnchorEl(null)}
            items={localeMenuItems}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
            paperSx={{ maxHeight: 320 }}
          />
          <AnonymousAccountConversionDialog
            isOpen={showConversionDialog}
            onClose={() => setShowConversionDialog(false)}
            onSuccess={() => {
              // Set the account conversion flag in persistent storage
              PersistentStorageService.setAccountConverted(true);
            }}
          />
          <TextConfirmModalDialog
            isOpen={showLogoutConfirmation}
            onCancel={handleConfirmLogout}
            onDismiss={() => setShowLogoutConfirmation(false)}
            onConfirm={handleRegister}
            title={t("chat.chatHeader.beforeYouGo")}
            confirmButtonText={t("common.buttons.register")}
            cancelButtonText={t("common.buttons.logout")}
            showCloseIcon={true}
            textParagraphs={[
              {
                id: "1",
                text: <>{t("chat.chatHeader.logoutConfirmationMessage")}</>,
              },
              {
                id: "2",
                text: (
                  <>
                    {t("chat.chatHeader.anonymousAccountWarning")}
                    <HighlightedSpan> {t("chat.chatHeader.logoutWarningAnonymous")}</HighlightedSpan>.
                  </>
                ),
              },
              {
                id: "3",
                text: (
                  <>
                    <HighlightedSpan>{t("chat.chatHeader.createAccountToSaveProgress")}</HighlightedSpan>{" "}
                    {t("chat.chatHeader.continueYourJourneyLater")}
                  </>
                ),
              },
            ]}
          />
        </Box>
        {isLoggingOut && <Backdrop isShown={isLoggingOut} message={t("chat.chat.backdrop.loggingOut")} />}
      </Box>
      {backLinkLabel && onBackClick && (
        <Box
          sx={{
            paddingTop: isMobile
              ? theme.fixedSpacing(theme.tabiyaSpacing.md)
              : theme.fixedSpacing(theme.tabiyaSpacing.xs),
            paddingBottom: theme.fixedSpacing(theme.tabiyaSpacing.xs),
            paddingX: theme.spacing(theme.tabiyaSpacing.md),
            width: { xs: "100%", md: "60%" },
            margin: "0 auto",
            boxSizing: "border-box",
          }}
        >
          <Box mb={theme.spacing(theme.tabiyaSpacing.sm)}>
            <BackButton
              onClick={() => {
                startTransition(() => {
                  onBackClick();
                });
              }}
              labelKey={backLinkLabel}
              dataTestId={DATA_TEST_ID.PAGE_HEADER_BACK_LINK}
            />
          </Box>
        </Box>
      )}
    </>
  );
};

export default PageHeader;
