import { useEffect, useState } from "react";
import AnalyticsService from "src/analytics/AnalyticsService";
import type { SkillsDiscoveryStatsResponse } from "src/analytics/AnalyticsService.types";
import type { CareerReadinessFilters } from "src/hooks/useCareerReadinessStats";

export interface UseSkillsDiscoveryStatsResult {
  data: SkillsDiscoveryStatsResponse | null;
  loading: boolean;
  error: Error | null;
}

export function useSkillsDiscoveryStats(filters?: CareerReadinessFilters): UseSkillsDiscoveryStatsResult {
  const [data, setData] = useState<SkillsDiscoveryStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const institution = filters?.institution;
  const location = filters?.location;
  const program = filters?.program;
  const year = filters?.year;

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    AnalyticsService.getInstance()
      .getSkillsDiscoveryStats({ institution, location, program, year })
      .then((result) => {
        if (!isMounted) return;
        setData(result);
        setError(null);
      })
      .catch((err) => {
        if (isMounted) setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [institution, location, program, year]);

  return { data, loading, error };
}
