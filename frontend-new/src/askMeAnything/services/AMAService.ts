import { getRestAPIErrorFactory } from "src/error/restAPIError/RestAPIError";
import { StatusCodes } from "http-status-codes";
import ErrorConstants from "src/error/restAPIError/RestAPIError.constants";
import { customFetch } from "src/utils/customFetch/customFetch";
import { getBackendUrl } from "src/envService";
import type { AMAConversationInput, AMAConversationResponse } from "src/askMeAnything/types";

const SERVICE_NAME = "AMAService";

export default class AMAService {
  private static instance: AMAService;
  private readonly baseUrl: string;

  private constructor() {
    this.baseUrl = `${getBackendUrl()}/ask-me-anything`;
  }

  static getInstance(): AMAService {
    if (!AMAService.instance) {
      AMAService.instance = new AMAService();
    }
    return AMAService.instance;
  }

  async sendMessage(
    userInput: string | null | undefined,
    history: AMAConversationResponse["messages"]
  ): Promise<AMAConversationResponse> {
    const url = `${this.baseUrl}/messages`;
    const errorFactory = getRestAPIErrorFactory(SERVICE_NAME, "sendMessage", "POST", url);
    const requestBody: AMAConversationInput = { user_input: userInput ?? null, history };
    const response = await customFetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
      expectedStatusCode: StatusCodes.CREATED,
      serviceName: SERVICE_NAME,
      serviceFunction: "sendMessage",
      failureMessage: "Failed to send AMA message",
      expectedContentType: "application/json",
    });
    const responseBody = await response.text();
    try {
      return JSON.parse(responseBody) as AMAConversationResponse;
    } catch (e: unknown) {
      throw errorFactory(
        response.status,
        ErrorConstants.ErrorCodes.INVALID_RESPONSE_BODY,
        "Response did not contain valid JSON",
        { responseBody, error: e }
      );
    }
  }
}
