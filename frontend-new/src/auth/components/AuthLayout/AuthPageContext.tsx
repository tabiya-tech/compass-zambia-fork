import React, { createContext, useCallback, useContext } from "react";

interface AuthPageState {
  isLoading: boolean;
  loadingMessage?: string;
}

interface AuthPageContextType {
  setPageLoading: (isLoading: boolean, message?: string) => void;
}

const AuthPageContext = createContext<AuthPageContextType | null>(null);

export const useAuthPageContext = (): AuthPageContextType => {
  const ctx = useContext(AuthPageContext);
  if (!ctx) throw new Error("useAuthPageContext must be used within AuthLayout");
  return ctx;
};

export const AuthPageProvider: React.FC<{
  children: React.ReactNode;
  onStateChange: (state: AuthPageState) => void;
}> = ({ children, onStateChange }) => {
  const setPageLoading = useCallback(
    (isLoading: boolean, message?: string) => {
      onStateChange({ isLoading, loadingMessage: message });
    },
    [onStateChange]
  );

  return <AuthPageContext.Provider value={{ setPageLoading }}>{children}</AuthPageContext.Provider>;
};
