import { useEffect, useState } from "react";
import CareerExplorerService from "src/careerExplorer/services/CareerExplorerService";
import type { UserSectorEngagementItem } from "src/careerExplorer/services/CareerExplorerService";

export interface UseCareerExplorerEngagementResult {
  data: UserSectorEngagementItem[];
  isLoading: boolean;
  error: Error | null;
}

export const useCareerExplorerEngagement = (): UseCareerExplorerEngagementResult => {
  const [data, setData] = useState<UserSectorEngagementItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    CareerExplorerService.getInstance()
      .getSectorEngagementForUser()
      .then((result) => {
        if (!isMounted) return;
        setData(result.data);
        setError(null);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return { data, isLoading, error };
};
