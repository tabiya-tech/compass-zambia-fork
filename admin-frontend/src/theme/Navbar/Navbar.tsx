import React, { useState, useCallback } from "react";
import { AppBar, Box, Toolbar, Typography, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import { getLogoUrl, getProductName } from "src/envService";
import ContextMenu from "src/theme/ContextMenu/ContextMenu";
import { MenuItemConfig } from "src/theme/ContextMenu/menuItemConfig.types";
import PrimaryIconButton from "src/theme/PrimaryIconButton/PrimaryIconButton";
import UserStateService from "src/userState/UserStateService";
import AuthenticationStateService from "src/auth/services/AuthenticationState.service";
import { Role } from "src/auth/services/FirebaseAuthenticationService/types";

const uniqueId = "navbar-a1b2c3d4-e5f6-7890-abcd-ef1234567890";

export const DATA_TEST_ID = {
  NAVBAR_CONTAINER: `${uniqueId}-container`,
  NAVBAR_LOGO: `${uniqueId}-logo`,
  NAVBAR_LOGO_TEXT: `${uniqueId}-logo-text`,
  NAVBAR_PROFILE_BUTTON: `${uniqueId}-profile-button`,
  NAVBAR_PROFILE_MENU: `${uniqueId}-profile-menu`,
};

export interface NavbarProps {
  /** Callback function to handle logout */
  onLogout: () => void;
}

/**
 * Navbar component that displays a bordered navigation bar with:
 * - Logo on the left side
 * - Profile dropdown with user info and logout on the right side
 */
const Navbar: React.FC<NavbarProps> = ({ onLogout }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const isMenuOpen = Boolean(anchorEl);

  // Get user state from UserStateService (includes access role)
  const userStateService = UserStateService.getInstance();
  const userState = userStateService.getUserState();

  // Fallback to AuthenticationStateService for basic user info if UserStateService is not populated
  const authStateService = AuthenticationStateService.getInstance();
  const authUser = authStateService.getUser();

  // Use UserStateService data if available, otherwise fallback to AuthenticationStateService
  const userName = userState?.name || authUser?.name || null;
  const userEmail = userState?.email || authUser?.email || null;
  const accessRole = userState?.accessRole || null;

  const logoUrl = getLogoUrl() || "/logo.svg";
  const productName = getProductName();

  const handleProfileClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleLogout = useCallback(() => {
    handleMenuClose();
    onLogout();
  }, [handleMenuClose, onLogout]);

  const getRoleDisplayName = (): string => {
    if (!accessRole) return "";

    if (accessRole.role === Role.ADMIN) {
      return t("navbar.role.admin", "Admin");
    }

    if (accessRole.role === Role.INSTITUTION_STAFF) {
      return t("navbar.role.institutionStaff", "Institution Staff");
    }

    return "";
  };

  const menuItems: MenuItemConfig[] = [
    {
      id: "profile-info",
      text: "",
      disabled: true,
      action: () => {},
      closeMenuOnClick: false,
      customNode: (
        <Box
          sx={{
            px: theme.fixedSpacing(theme.tabiyaSpacing.md),
            py: theme.fixedSpacing(theme.tabiyaSpacing.sm),
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: theme.fixedSpacing(theme.tabiyaSpacing.sm) }}>
            <PersonIcon sx={{ color: theme.palette.text.secondary }} />
            <Box>
              <Typography variant="body2" fontWeight="bold" color="textPrimary">
                {userName || userEmail}
              </Typography>
              {userName && (
                <Typography variant="caption" color="textSecondary">
                  {userEmail}
                </Typography>
              )}
            </Box>
          </Box>
          {accessRole && (
            <Box
              sx={{
                mt: theme.fixedSpacing(theme.tabiyaSpacing.xs),
                px: theme.fixedSpacing(theme.tabiyaSpacing.lg + theme.tabiyaSpacing.sm),
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  backgroundColor: theme.palette.primary.light,
                  color: theme.palette.primary.contrastText,
                  px: theme.fixedSpacing(theme.tabiyaSpacing.sm),
                  py: theme.fixedSpacing(theme.tabiyaSpacing.xxs),
                  borderRadius: theme.rounding(theme.tabiyaRounding.xs),
                  display: "inline-block",
                }}
              >
                {getRoleDisplayName()}
              </Typography>
            </Box>
          )}
        </Box>
      ),
    },
    {
      id: "logout",
      text: t("navbar.logout", "Logout"),
      icon: <LogoutIcon fontSize="small" />,
      disabled: false,
      action: handleLogout,
      textColor: theme.palette.error.main,
    },
  ];

  return (
    <AppBar
      position="static"
      elevation={0}
      data-testid={DATA_TEST_ID.NAVBAR_CONTAINER}
      sx={{
        backgroundColor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Toolbar
        sx={{
          justifyContent: "space-between",
          px: theme.fixedSpacing(theme.tabiyaSpacing.lg),
        }}
      >
        {/* Logo Section */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: theme.fixedSpacing(theme.tabiyaSpacing.sm),
          }}
        >
          <Box
            component="img"
            src={logoUrl}
            alt={t("app.logoAlt", { appName: productName })}
            data-testid={DATA_TEST_ID.NAVBAR_LOGO}
            sx={{
              height: 40,
              width: "auto",
              maxWidth: 120,
            }}
          />
          <Typography
            variant="h6"
            component="span"
            data-testid={DATA_TEST_ID.NAVBAR_LOGO_TEXT}
            sx={{
              color: theme.palette.text.primary,
              fontWeight: 600,
            }}
          >
            {t("navbar.title", "{{appName}} Admin", { appName: productName })}
          </Typography>
        </Box>

        {/* Profile Section */}
        <Box>
          <PrimaryIconButton
            onClick={handleProfileClick}
            data-testid={DATA_TEST_ID.NAVBAR_PROFILE_BUTTON}
            aria-label={t("navbar.profileMenu", "Profile menu")}
            aria-controls={isMenuOpen ? "profile-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={isMenuOpen ? "true" : undefined}
          >
            <AccountCircleIcon />
          </PrimaryIconButton>
          <ContextMenu
            items={menuItems}
            open={isMenuOpen}
            anchorEl={anchorEl}
            notifyOnClose={handleMenuClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            paperSx={{
              minWidth: 220,
              mt: theme.fixedSpacing(theme.tabiyaSpacing.xs),
            }}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
