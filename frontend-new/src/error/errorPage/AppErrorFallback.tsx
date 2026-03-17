import React from "react";
import { useTranslation } from "react-i18next";
import ErrorPage from "src/error/errorPage/ErrorPage";
import { isChunkLoadError } from "src/error/isChunkLoadError";

interface AppErrorFallbackProps {
  error?: unknown;
}

/**
 * Shared error fallback UI: shows ErrorPage with an optional refresh button for chunk load errors.
 * Used by Sentry.ErrorBoundary and by the router's errorElement (via AppRouteErrorFallback).
 */
export const AppErrorFallback: React.FC<AppErrorFallbackProps> = ({ error }) => {
  const { t } = useTranslation();
  return <ErrorPage errorMessage={t("error.errorPage.defaultMessage")} showRefreshButton={isChunkLoadError(error)} />;
};
