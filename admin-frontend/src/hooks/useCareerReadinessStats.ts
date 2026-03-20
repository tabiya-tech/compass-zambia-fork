import { useEffect, useState } from "react";
import AnalyticsService from "src/analytics/AnalyticsService";
import type { CareerReadinessStatsResponse } from "src/analytics/AnalyticsService.types";

export interface CareerReadinessFilters {
  institution?: string;
  location?: string;
  program?: string;
  year?: string;
}

export interface UseCareerReadinessStatsResult {
  data: CareerReadinessStatsResponse | null;
  loading: boolean;
  error: Error | null;
}

export function useCareerReadinessStats(filters?: CareerReadinessFilters): UseCareerReadinessStatsResult {
  const [data, setData] = useState<CareerReadinessStatsResponse | null>(null);
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
      .getCareerReadinessStats({ institution, location, program, year })
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
