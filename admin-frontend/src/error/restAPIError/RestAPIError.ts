import { StatusCodes } from "http-status-codes";
import ErrorConstants from "src/error/restAPIError/RestAPIError.constants";
import { ServiceError } from "src/error/ServiceError";
import i18n from "src/i18n/i18n";

export type RestAPIErrorDetails = string | object | undefined | null;

export class RestAPIError extends ServiceError {
  method: string;
  path: string;
  statusCode: number;
  errorCode: ErrorConstants.ErrorCodes | string;

  constructor(
    serviceName: string,
    serviceFunction: string,
    method: string,
    path: string,
    statusCode: number,
    errorCode: ErrorConstants.ErrorCodes | string,
    message: string,
    cause?: RestAPIErrorDetails
  ) {
    super(serviceName, serviceFunction, `RestAPIError: ${message}`, cause);
    this.method = method;
    this.path = path;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
  }
}

export type RestAPIErrorFactory = (
  statusCode: number,
  errorCode: ErrorConstants.ErrorCodes | string,
  message: string,
  cause?: RestAPIErrorDetails
) => RestAPIError;

export function getRestAPIErrorFactory(
  serviceName: string,
  serviceFunction: string,
  method: string,
  path: string
): RestAPIErrorFactory {
  return (
    statusCode: number,
    errorCode: ErrorConstants.ErrorCodes | string,
    message: string,
    cause?: RestAPIErrorDetails
  ): RestAPIError => {
    return new RestAPIError(serviceName, serviceFunction, method, path, statusCode, errorCode, message, cause);
  };
}

function translateUserFriendlyErrorMessage(
  key: (typeof ErrorConstants.USER_FRIENDLY_ERROR_I18N_KEYS)[keyof typeof ErrorConstants.USER_FRIENDLY_ERROR_I18N_KEYS]
): string {
  return i18n.t(key);
}

export function getUserFriendlyErrorMessage(error: RestAPIError | Error): string {
  if (!(error instanceof RestAPIError)) {
    return translateUserFriendlyErrorMessage(ErrorConstants.USER_FRIENDLY_ERROR_I18N_KEYS.UNEXPECTED_ERROR);
  }
  switch (error.errorCode) {
    case ErrorConstants.ErrorCodes.FAILED_TO_FETCH:
      return translateUserFriendlyErrorMessage(ErrorConstants.USER_FRIENDLY_ERROR_I18N_KEYS.SERVER_CONNECTION_ERROR);
    case ErrorConstants.ErrorCodes.API_ERROR:
      if (error.statusCode >= 300 && error.statusCode < 400) {
        return translateUserFriendlyErrorMessage(
          ErrorConstants.USER_FRIENDLY_ERROR_I18N_KEYS.UNABLE_TO_PROCESS_RESPONSE
        );
      }
      switch (error.statusCode) {
        case StatusCodes.UNAUTHORIZED:
          return translateUserFriendlyErrorMessage(ErrorConstants.USER_FRIENDLY_ERROR_I18N_KEYS.AUTHENTICATION_FAILURE);
        case StatusCodes.FORBIDDEN:
          return translateUserFriendlyErrorMessage(ErrorConstants.USER_FRIENDLY_ERROR_I18N_KEYS.PERMISSION_DENIED);
        case StatusCodes.NOT_FOUND:
          return translateUserFriendlyErrorMessage(ErrorConstants.USER_FRIENDLY_ERROR_I18N_KEYS.RESOURCE_NOT_FOUND);
        case StatusCodes.TOO_MANY_REQUESTS:
          return translateUserFriendlyErrorMessage(ErrorConstants.USER_FRIENDLY_ERROR_I18N_KEYS.TOO_MANY_REQUESTS);
        case StatusCodes.REQUEST_TOO_LONG:
          return translateUserFriendlyErrorMessage(ErrorConstants.USER_FRIENDLY_ERROR_I18N_KEYS.REQUEST_TOO_LONG);
      }
      if (error.statusCode >= 400 && error.statusCode < 500) {
        return translateUserFriendlyErrorMessage(ErrorConstants.USER_FRIENDLY_ERROR_I18N_KEYS.DATA_VALIDATION_ERROR);
      }
      if (error.statusCode === 500) {
        return translateUserFriendlyErrorMessage(ErrorConstants.USER_FRIENDLY_ERROR_I18N_KEYS.UNEXPECTED_ERROR);
      }
      if (error.statusCode >= 501) {
        return translateUserFriendlyErrorMessage(ErrorConstants.USER_FRIENDLY_ERROR_I18N_KEYS.SERVICE_UNAVAILABLE);
      }
      break;
    case ErrorConstants.ErrorCodes.INVALID_RESPONSE_BODY:
    case ErrorConstants.ErrorCodes.INVALID_RESPONSE_HEADER:
      return translateUserFriendlyErrorMessage(ErrorConstants.USER_FRIENDLY_ERROR_I18N_KEYS.UNABLE_TO_PROCESS_RESPONSE);
    case ErrorConstants.ErrorCodes.FORBIDDEN:
      if (error.statusCode === 422) {
        return translateUserFriendlyErrorMessage(
          ErrorConstants.USER_FRIENDLY_ERROR_I18N_KEYS.UNABLE_TO_PROCESS_REQUEST
        );
      }
      break;
  }
  return translateUserFriendlyErrorMessage(ErrorConstants.USER_FRIENDLY_ERROR_I18N_KEYS.UNEXPECTED_ERROR);
}
