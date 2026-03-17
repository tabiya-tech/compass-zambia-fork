/**
 * Firebase error codes that we handle specifically
 */
export const FirebaseErrorCodes = {
  // Authentication errors
  USER_NOT_FOUND: "auth/user-not-found",
  WRONG_PASSWORD: "auth/wrong-password",
  INVALID_CREDENTIAL: "auth/invalid-credential",
  EMAIL_ALREADY_IN_USE: "auth/email-already-in-use",
  WEAK_PASSWORD: "auth/weak-password",
  INVALID_EMAIL: "auth/invalid-email",
  USER_DISABLED: "auth/user-disabled",
  TOO_MANY_REQUESTS: "auth/too-many-requests",
  OPERATION_NOT_ALLOWED: "auth/operation-not-allowed",
  NETWORK_REQUEST_FAILED: "auth/network-request-failed",
  POPUP_CLOSED_BY_USER: "auth/popup-closed-by-user",
  UNAUTHORIZED_DOMAIN: "auth/unauthorized-domain",
  ACCOUNT_EXISTS_WITH_DIFFERENT_CREDENTIAL: "auth/account-exists-with-different-credential",

  // Custom error codes
  EMAIL_NOT_VERIFIED: "auth/email-not-verified",
  NO_USER_LOGGED_IN: "auth/no-user-logged-in",
  USER_ACCESS_DISABLED: "auth/user-access-disabled",
} as const;

export type FirebaseErrorCode = (typeof FirebaseErrorCodes)[keyof typeof FirebaseErrorCodes];
