import type { ModuleData } from "src/types";

export interface UseModulesResult {
  modules: ModuleData[];
  loading: boolean;
  error: Error | null;
}

/**
 * Provides modules data for the dashboard modules tab.
 * No backend endpoint for module analytics exists yet — returns empty state.
 */
export function useModules(): UseModulesResult {
  return { modules: [], loading: false, error: null };
}
