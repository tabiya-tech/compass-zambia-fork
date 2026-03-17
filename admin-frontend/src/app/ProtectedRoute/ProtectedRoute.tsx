import React, { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { routerPaths } from "src/app/routerPaths";
import AuthenticationStateService from "src/auth/services/AuthenticationState.service";

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * ProtectedRoute component that guards routes from unauthenticated access.
 * Redirects unauthenticated users to the login page.
 * Redirects authenticated users away from the login page to the root.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const user = AuthenticationStateService.getInstance().getUser();
  const targetPath = useLocation().pathname;

  // If on login page
  if (targetPath === routerPaths.LOGIN) {
    // If already authenticated, redirect to root
    if (user) {
      console.debug("redirecting from /login --> / because user is authenticated");
      return <Navigate to={routerPaths.ROOT} replace />;
    }
    // Otherwise, show login page
    console.debug("showing login page because no user");
    return <>{children}</>;
  }

  // For all other routes, require authentication
  if (!user) {
    console.debug(`redirecting from ${targetPath} --> /login because no user`);
    return <Navigate to={routerPaths.LOGIN} replace />;
  }

  // User is authenticated, show the page
  return <>{children}</>;
};

export default ProtectedRoute;
