import { getBackendUrl } from "src/envService";
import { getRestAPIErrorFactory } from "src/error/restAPIError/RestAPIError";
import { customFetch } from "src/utils/customFetch/customFetch";
import { StatusCodes } from "http-status-codes";
import ErrorConstants from "src/error/restAPIError/RestAPIError.constants";
import { PlainPersonalData } from "./plainPersonalData.types";

export default class PlainPersonalDataService {
  readonly apiServerUrl: string;
  readonly endpointUrl: string;

  private static instance: PlainPersonalDataService;

  /**
   * Get the singleton instance of PlainPersonalDataService.
   * @returns {PlainPersonalDataService} The singleton instance.
   */
  public static getInstance(): PlainPersonalDataService {
    if (!PlainPersonalDataService.instance) {
      PlainPersonalDataService.instance = new PlainPersonalDataService();
    }
    return PlainPersonalDataService.instance;
  }

  private constructor() {
    this.apiServerUrl = getBackendUrl();
    this.endpointUrl = `${this.apiServerUrl}/users`;
  }

  /**
   * Fetches plain personal data for a given user ID.
   * @param userId - The unique identifier of the user
   * @returns Promise<PlainPersonalData> - The user's plain personal data
   * @throws RestAPIError if the request fails or returns invalid JSON
   */
  async getPlainPersonalData(userId: string): Promise<PlainPersonalData> {
    const serviceName = "PlainPersonalDataService";
    const serviceFunction = "getPlainPersonalData";
    const method = "GET";
    const url = `${this.endpointUrl}/${userId}/plain-personal-data`;
    const errorFactory = getRestAPIErrorFactory(serviceName, serviceFunction, method, url);

    const response = await customFetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      expectedStatusCode: StatusCodes.OK,
      serviceName,
      serviceFunction,
      failureMessage: `Failed to retrieve plain personal data for user ${userId}`,
      expectedContentType: "application/json",
      retryOnFailedToFetch: true,
    });

    let data: PlainPersonalData;
    try {
      data = JSON.parse(await response.text());
    } catch (error: unknown) {
      throw errorFactory(
        response.status,
        ErrorConstants.ErrorCodes.INVALID_RESPONSE_BODY,
        "Response did not contain valid JSON",
        {
          error: error,
        }
      );
    }

    return data;
  }
}
