import { StatusCodes } from "http-status-codes";
import { getRestAPIErrorFactory, RestAPIErrorFactory } from "src/error/restAPIError/RestAPIError";
import ErrorConstants from "src/error/restAPIError/RestAPIError.constants";
import AuthenticationStateService from "src/auth/services/AuthenticationState.service";

export type ExtendedRequestInit = RequestInit & {
  expectedStatusCode: number | number[];
  serviceName: string;
  serviceFunction: string;
  failureMessage: string;
  expectedContentType?: string;
  authRequired?: boolean;
};

export const defaultInit: ExtendedRequestInit = {
  expectedStatusCode: StatusCodes.OK,
  serviceName: "Unknown service",
  serviceFunction: "Unknown method",
  failureMessage: "Unknown error",
  authRequired: true,
};

/**
 * A thin fetch wrapper that validates response status and content-type,
 * and throws typed RestAPIErrors on failure.
 * Injects Authorization header with Bearer token when authRequired is true.
 */
export const customFetch = async (url: string, init: ExtendedRequestInit = defaultInit): Promise<Response> => {
  const {
    expectedStatusCode,
    serviceName,
    serviceFunction,
    failureMessage,
    expectedContentType,
    authRequired = true,
    ...fetchInit
  } = init;

  const errorFactory: RestAPIErrorFactory = getRestAPIErrorFactory(
    serviceName,
    serviceFunction,
    fetchInit.method ?? "GET",
    url
  );

  const headers = new Headers(fetchInit.headers);
  if (authRequired) {
    const token = AuthenticationStateService.getInstance().getToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }
  const enhancedInit = { ...fetchInit, headers };

  let response: Response;
  try {
    response = await fetch(url, enhancedInit);
  } catch (e) {
    throw errorFactory(0, ErrorConstants.ErrorCodes.FAILED_TO_FETCH, failureMessage, { error: e });
  }

  const expectedCodes = Array.isArray(expectedStatusCode) ? expectedStatusCode : [expectedStatusCode];
  if (!expectedCodes.includes(response.status)) {
    const body = await response.text().catch(() => "");
    throw errorFactory(response.status, ErrorConstants.ErrorCodes.API_ERROR, failureMessage, { responseBody: body });
  }

  if (expectedContentType) {
    const contentType = response.headers.get("Content-Type") ?? "";
    if (!contentType.includes(expectedContentType)) {
      throw errorFactory(
        response.status,
        ErrorConstants.ErrorCodes.INVALID_RESPONSE_HEADER,
        `Expected Content-Type "${expectedContentType}" but got "${contentType}"`,
        { contentType }
      );
    }
  }

  return response;
};
