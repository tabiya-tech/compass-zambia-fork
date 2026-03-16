import React from "react";
import { createHashRouter, RouterProvider, Navigate } from "react-router-dom";
import * as Sentry from "@sentry/react";

import { routerPaths } from "src/app/routerPaths";
import Login from "src/pages/Login";
import Dashboard from "src/pages/Dashboard";
import Users from "src/pages/Users";
import Settings from "src/pages/Settings";
import NotFound from "src/pages/NotFound";

// Wrap the createHashRouter function with Sentry to capture errors that occur during router initialization
const sentryCreateHashRouter = Sentry.wrapCreateBrowserRouterV6(createHashRouter);

const router = sentryCreateHashRouter([
  {
    path: routerPaths.ROOT,
    element: <Navigate to={routerPaths.DASHBOARD} replace />,
  },
  {
    path: routerPaths.LOGIN,
    element: <Login />,
  },
  {
    path: routerPaths.DASHBOARD,
    element: <Dashboard />,
  },
  {
    path: routerPaths.USERS,
    element: <Users />,
  },
  {
    path: routerPaths.SETTINGS,
    element: <Settings />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
