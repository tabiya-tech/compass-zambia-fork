import { StatusCodes } from "http-status-codes";
import { customFetch } from "src/utils/customFetch/customFetch";
import { getBackendUrl } from "src/envService";
import { getRestAPIErrorFactory } from "src/error/restAPIError/RestAPIError";
import ErrorConstants from "src/error/restAPIError/RestAPIError.constants";
import type {
  DashboardStats,
  InstitutionApiItem,
  PaginatedResponse,
  AdoptionTrendsResponse,
} from "./AnalyticsService.types";

export type { DashboardStats, InstitutionApiItem, PaginatedResponse, AdoptionTrendsResponse };

const SERVICE_NAME = "AnalyticsService";

export default class AnalyticsService {
  private static instance: AnalyticsService;
  private readonly baseUrl: string;

  private constructor() {
    this.baseUrl = getBackendUrl();
  }

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const url = `${this.baseUrl}/analytics/stats`;
    const errorFactory = getRestAPIErrorFactory(SERVICE_NAME, "getDashboardStats", "GET", url);
    const response = await customFetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      expectedStatusCode: StatusCodes.OK,
      serviceName: SERVICE_NAME,
      serviceFunction: "getDashboardStats",
      failureMessage: "Failed to fetch dashboard stats",
      expectedContentType: "application/json",
    });
    try {
      return (await response.json()) as DashboardStats;
    } catch (e) {
      throw errorFactory(response.status, ErrorConstants.ErrorCodes.INVALID_RESPONSE_BODY, "Invalid JSON", {
        error: e,
      });
    }
  }

  async listInstitutions(limit = 100, cursor?: string): Promise<PaginatedResponse<InstitutionApiItem>> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) params.set("cursor", cursor);
    const url = `${this.baseUrl}/institutions?${params}`;
    const errorFactory = getRestAPIErrorFactory(SERVICE_NAME, "listInstitutions", "GET", url);
    const response = await customFetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      expectedStatusCode: StatusCodes.OK,
      serviceName: SERVICE_NAME,
      serviceFunction: "listInstitutions",
      failureMessage: "Failed to fetch institutions",
      expectedContentType: "application/json",
    });
    try {
      return (await response.json()) as PaginatedResponse<InstitutionApiItem>;
    } catch (e) {
      throw errorFactory(response.status, ErrorConstants.ErrorCodes.INVALID_RESPONSE_BODY, "Invalid JSON", {
        error: e,
      });
    }
  }

  async getAdoptionTrends(startDate: string, endDate: string, interval = "day"): Promise<AdoptionTrendsResponse> {
    const params = new URLSearchParams({ start_date: startDate, end_date: endDate, interval });
    const url = `${this.baseUrl}/analytics/adoption-trends?${params}`;
    const errorFactory = getRestAPIErrorFactory(SERVICE_NAME, "getAdoptionTrends", "GET", url);
    const response = await customFetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      expectedStatusCode: StatusCodes.OK,
      serviceName: SERVICE_NAME,
      serviceFunction: "getAdoptionTrends",
      failureMessage: "Failed to fetch adoption trends",
      expectedContentType: "application/json",
    });
    try {
      return (await response.json()) as AdoptionTrendsResponse;
    } catch (e) {
      throw errorFactory(response.status, ErrorConstants.ErrorCodes.INVALID_RESPONSE_BODY, "Invalid JSON", {
        error: e,
      });
    }
  }
}
