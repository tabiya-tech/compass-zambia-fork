import { FirebaseErrorCode } from "./firebaseError.constants";

/**
 * Custom Firebase error class for handling authentication errors
 */
export class FirebaseError extends Error {
  public readonly serviceName: string;
  public readonly serviceFunction: string;
  public readonly code: FirebaseErrorCode | string;
  public readonly details?: Record<string, unknown>;

  constructor(
    serviceName: string,
    serviceFunction: string,
    code: FirebaseErrorCode | string,
    message: string,
    cause?: unknown,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "FirebaseError";
    this.serviceName = serviceName;
    this.serviceFunction = serviceFunction;
    this.code = code;
    this.cause = cause;
    this.details = details;
  }
}

/**
 * Factory function type for creating Firebase errors
 */
export type FirebaseErrorFactory = (
  code: FirebaseErrorCode | string,
  message: string,
  details?: Record<string, unknown>
) => FirebaseError;

/**
 * Creates a factory function for generating Firebase errors with predefined service context
 */
export const getFirebaseErrorFactory = (serviceName: string, serviceFunction: string): FirebaseErrorFactory => {
  return (code: FirebaseErrorCode | string, message: string, details?: Record<string, unknown>) => {
    return new FirebaseError(serviceName, serviceFunction, code, message, undefined, details);
  };
};

/**
 * Casts an unknown error to a FirebaseError
 */
export const castToFirebaseError = (error: unknown, factory: FirebaseErrorFactory): FirebaseError => {
  if (error instanceof FirebaseError) {
    return error;
  }

  // Check if it's a Firebase SDK error
  if (error && typeof error === "object" && "code" in error && "message" in error) {
    const firebaseError = error as { code: string; message: string };
    return factory(firebaseError.code, firebaseError.message);
  }

  // Generic error handling
  if (error instanceof Error) {
    return factory("auth/unknown-error", error.message);
  }

  return factory("auth/unknown-error", "An unknown error occurred");
};
