import type { DashboardStatItem } from "src/types";
import { mockDashboardStats } from "src/data/mockDashboardStats";

export interface UseDashboardStatsResult {
  stats: DashboardStatItem[];
  loading: boolean;
  error: Error | null;
}

/**
 * Provides stat cards data for the dashboard.
 * Currently returns mock data; replace with API call when backend is ready.
 */
export function useDashboardStats(): UseDashboardStatsResult {
  return {
    stats: mockDashboardStats,
    loading: false,
    error: null,
  };
}
