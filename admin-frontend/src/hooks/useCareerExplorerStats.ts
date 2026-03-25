import { useEffect, useState } from "react";
import AnalyticsService from "src/analytics/AnalyticsService";
import type { CareerExplorerStatsResponse } from "src/analytics/AnalyticsService.types";

export interface CareerExplorerFilters {
  institution?: string;
  location?: string;
  program?: string;
  year?: string;
}

export interface UseCareerExplorerStatsResult {
  data: CareerExplorerStatsResponse | null;
  loading: boolean;
  error: Error | null;
}

export function useCareerExplorerStats(filters?: CareerExplorerFilters): UseCareerExplorerStatsResult {
  const [data, setData] = useState<CareerExplorerStatsResponse | null>(null);
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
      .getCareerExplorerStats({ institution, location, program, year })
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
