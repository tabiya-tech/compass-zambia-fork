import type { ModuleData } from "src/types";
import { mockModules } from "src/data/mockModules";

export interface UseModulesResult {
  modules: ModuleData[];
  loading: boolean;
  error: Error | null;
}

/**
 * Provides modules data for the dashboard modules tab.
 * Currently returns mock data; replace with API call when backend is ready.
 */
export function useModules(): UseModulesResult {
  return {
    modules: mockModules,
    loading: false,
    error: null,
  };
}
