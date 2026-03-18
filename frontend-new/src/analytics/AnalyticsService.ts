import { StatusCodes } from "http-status-codes";
import { getBackendUrl } from "src/envService";
import { getRestAPIErrorFactory } from "src/error/restAPIError/RestAPIError";
import { customFetch } from "src/utils/customFetch/customFetch";

// ---------------------------------------------------------------------------
// Response types matching the backend models
// ---------------------------------------------------------------------------

export interface ModuleBreakdown {
  module_id: string;
  module_title: string;
  started_count: number;
  completed_count: number;
}

export interface CareerReadinessStats {
  total_registered_students: number;
  started: { count: number; percentage: number };
  completed_all_modules: { count: number; percentage_of_started: number };
  avg_modules_completed: number;
  total_modules: number;
  module_breakdown: ModuleBreakdown[];
}

export interface SkillGapEntry {
  skill_id: string;
  skill_label: string;
  students_with_gap_count: number;
  avg_job_unlock_count: number;
  avg_proximity_score: number;
}

export interface SkillGapStats {
  total_students_with_skill_gaps: number;
  top_skill_gaps: SkillGapEntry[];
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export default class AnalyticsService {
  private static instance: AnalyticsService;
  private readonly baseUrl: string;

  private constructor() {
    this.baseUrl = getBackendUrl().replace(/\/$/, "");
  }

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  async getCareerReadinessStats(): Promise<CareerReadinessStats> {
    const serviceName = "AnalyticsService";
    const serviceFunction = "getCareerReadinessStats";
    const method = "GET";
    const url = `${this.baseUrl}/analytics/career-readiness-stats`;
    const errorFactory = getRestAPIErrorFactory(serviceName, serviceFunction, method, url);

    const response = await customFetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      expectedStatusCode: StatusCodes.OK,
      serviceName,
      serviceFunction,
      failureMessage: "Failed to fetch career readiness stats",
      expectedContentType: "application/json",
      authRequired: true,
    });

    try {
      return JSON.parse(await response.text()) as CareerReadinessStats;
    } catch (e) {
      throw errorFactory(response.status, "INVALID_RESPONSE_BODY", "Response did not contain valid JSON", { error: e });
    }
  }

  async getSkillGapStats(limit = 10): Promise<SkillGapStats> {
    const serviceName = "AnalyticsService";
    const serviceFunction = "getSkillGapStats";
    const method = "GET";
    const url = `${this.baseUrl}/analytics/skill-gap-stats?limit=${limit}`;
    const errorFactory = getRestAPIErrorFactory(serviceName, serviceFunction, method, url);

    const response = await customFetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      expectedStatusCode: StatusCodes.OK,
      serviceName,
      serviceFunction,
      failureMessage: "Failed to fetch skill gap stats",
      expectedContentType: "application/json",
      authRequired: true,
    });

    try {
      return JSON.parse(await response.text()) as SkillGapStats;
    } catch (e) {
      throw errorFactory(response.status, "INVALID_RESPONSE_BODY", "Response did not contain valid JSON", { error: e });
    }
  }
}
