import type { InstitutionRow } from "src/types";
import { mockInstitutions } from "src/data/mockInstitutions";

export interface UseInstitutionsResult {
  institutions: InstitutionRow[];
  loading: boolean;
  error: Error | null;
}

/**
 * Provides institutions data for the dashboard institutions tab.
 * Currently returns mock data; replace with API call when backend is ready.
 */
export function useInstitutions(): UseInstitutionsResult {
  return {
    institutions: mockInstitutions,
    loading: false,
    error: null,
  };
}
