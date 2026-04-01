import React, { useMemo } from "react";
import { Box } from "@mui/material";
import { Outlet, useMatches } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { TranslationKey } from "src/react-i18next";
import NavBar from "src/navigation/NavBar/NavBar";
import SubNavBar from "src/navigation/SubNavBar/SubNavBar";

export interface RouteHandle {
  title?: string;
  subtitle?: string;
  headerColor?: string;
}

const Layout: React.FC = () => {
  const matches = useMatches();
  const { t } = useTranslation();

  const { currentHandle, headerColor } = useMemo(() => {
    let handleWithTitle: RouteHandle | undefined;
    let firstHeaderColor: string | undefined;

    for (let i = matches.length - 1; i >= 0; i--) {
      const routeHandle = matches[i].handle as RouteHandle | undefined;
      if (!routeHandle) continue;

      if (!handleWithTitle && routeHandle.title) {
        handleWithTitle = routeHandle;
      }

      if (!firstHeaderColor && routeHandle.headerColor) {
        firstHeaderColor = routeHandle.headerColor;
      }

      if (handleWithTitle && firstHeaderColor) break;
    }

    return {
      currentHandle: handleWithTitle,
      headerColor: handleWithTitle?.headerColor ?? firstHeaderColor ?? "brandAction",
    };
  }, [matches]);

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <NavBar headerColor={headerColor} />
      {currentHandle?.title && currentHandle?.subtitle && (
        <SubNavBar
          title={t(currentHandle.title as TranslationKey)}
          subtitle={t(currentHandle.subtitle as TranslationKey)}
          headerColor={headerColor}
        />
      )}
      <Box display="flex" flexDirection="column" flex={1}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
