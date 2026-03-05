import { getRestAPIErrorFactory } from "src/error/restAPIError/RestAPIError";
import { StatusCodes } from "http-status-codes";
import ErrorConstants from "src/error/restAPIError/RestAPIError.constants";
import { customFetch } from "src/utils/customFetch/customFetch";
import { getBackendUrl } from "src/envService";
import type {
  ModuleListResponse,
  ModuleDetail,
  CareerReadinessConversationResponse,
  CareerReadinessConversationInput,
} from "src/careerReadiness/types";

const SERVICE_NAME = "CareerReadinessService";

export default class CareerReadinessService {
  private static instance: CareerReadinessService;
  private readonly baseUrl: string;

  private constructor() {
    this.baseUrl = `${getBackendUrl()}/career-readiness`;
  }

  static getInstance(): CareerReadinessService {
    if (!CareerReadinessService.instance) {
      CareerReadinessService.instance = new CareerReadinessService();
    }
    return CareerReadinessService.instance;
  }

  async listModules(): Promise<ModuleListResponse> {
    const url = `${this.baseUrl}/modules`;
    const errorFactory = getRestAPIErrorFactory(SERVICE_NAME, "listModules", "GET", url);
    const response = await customFetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      expectedStatusCode: StatusCodes.OK,
      serviceName: SERVICE_NAME,
      serviceFunction: "listModules",
      failureMessage: "Failed to list career readiness modules",
      expectedContentType: "application/json",
    });
    const body = await response.text();
    try {
      return JSON.parse(body) as ModuleListResponse;
    } catch (e: unknown) {
      throw errorFactory(
        response.status,
        ErrorConstants.ErrorCodes.INVALID_RESPONSE_BODY,
        "Response did not contain valid JSON",
        { responseBody: body, error: e }
      );
    }
  }

  async getModule(moduleId: string): Promise<ModuleDetail> {
    const url = `${this.baseUrl}/modules/${encodeURIComponent(moduleId)}`;
    const errorFactory = getRestAPIErrorFactory(SERVICE_NAME, "getModule", "GET", url);
    const response = await customFetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      expectedStatusCode: StatusCodes.OK,
      serviceName: SERVICE_NAME,
      serviceFunction: "getModule",
      failureMessage: `Failed to get module ${moduleId}`,
      expectedContentType: "application/json",
    });
    const body = await response.text();
    try {
      return JSON.parse(body) as ModuleDetail;
    } catch (e: unknown) {
      throw errorFactory(
        response.status,
        ErrorConstants.ErrorCodes.INVALID_RESPONSE_BODY,
        "Response did not contain valid JSON",
        { responseBody: body, error: e }
      );
    }
  }

  async createConversation(moduleId: string): Promise<CareerReadinessConversationResponse> {
    const url = `${this.baseUrl}/modules/${encodeURIComponent(moduleId)}/conversations`;
    const errorFactory = getRestAPIErrorFactory(SERVICE_NAME, "createConversation", "POST", url);
    const response = await customFetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      expectedStatusCode: StatusCodes.CREATED,
      serviceName: SERVICE_NAME,
      serviceFunction: "createConversation",
      failureMessage: `Failed to create conversation for module ${moduleId}`,
      expectedContentType: "application/json",
    });
    const body = await response.text();
    try {
      return JSON.parse(body) as CareerReadinessConversationResponse;
    } catch (e: unknown) {
      throw errorFactory(
        response.status,
        ErrorConstants.ErrorCodes.INVALID_RESPONSE_BODY,
        "Response did not contain valid JSON",
        { responseBody: body, error: e }
      );
    }
  }

  async getConversationHistory(moduleId: string, conversationId: string): Promise<CareerReadinessConversationResponse> {
    const url = `${this.baseUrl}/modules/${encodeURIComponent(moduleId)}/conversations/${encodeURIComponent(conversationId)}/messages`;
    const errorFactory = getRestAPIErrorFactory(SERVICE_NAME, "getConversationHistory", "GET", url);
    const response = await customFetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      expectedStatusCode: StatusCodes.OK,
      serviceName: SERVICE_NAME,
      serviceFunction: "getConversationHistory",
      failureMessage: `Failed to get conversation history for module ${moduleId}`,
      expectedContentType: "application/json",
    });
    const body = await response.text();
    try {
      return JSON.parse(body) as CareerReadinessConversationResponse;
    } catch (e: unknown) {
      throw errorFactory(
        response.status,
        ErrorConstants.ErrorCodes.INVALID_RESPONSE_BODY,
        "Response did not contain valid JSON",
        { responseBody: body, error: e }
      );
    }
  }

  async sendMessage(
    moduleId: string,
    conversationId: string,
    userInput: string
  ): Promise<CareerReadinessConversationResponse> {
    const url = `${this.baseUrl}/modules/${encodeURIComponent(moduleId)}/conversations/${encodeURIComponent(conversationId)}/messages`;
    const errorFactory = getRestAPIErrorFactory(SERVICE_NAME, "sendMessage", "POST", url);
    const body: CareerReadinessConversationInput = { user_input: userInput };
    const response = await customFetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      expectedStatusCode: StatusCodes.CREATED,
      serviceName: SERVICE_NAME,
      serviceFunction: "sendMessage",
      failureMessage: `Failed to send message in module ${moduleId}`,
      expectedContentType: "application/json",
    });
    const responseBody = await response.text();
    try {
      return JSON.parse(responseBody) as CareerReadinessConversationResponse;
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
