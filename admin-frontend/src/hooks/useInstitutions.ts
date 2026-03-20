import React, { useCallback, useEffect, useState } from "react";
import type { InstitutionRow } from "src/types";
import AnalyticsService from "src/analytics/AnalyticsService";
import type { InstitutionApiItem } from "src/analytics/AnalyticsService.types";

const PAGE_SIZE = 20;

export interface UseInstitutionsResult {
  institutions: InstitutionRow[];
  loading: boolean;
  error: Error | null;
  page: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  goToNextPage: () => void;
  goToPrevPage: () => void;
}

function mapApiItemToRow(item: InstitutionApiItem): InstitutionRow {
  return {
    id: item.id,
    institution: item.name,
    students: item.students,
    active7Days: item.active_7_days,
    skillsDiscoveryStartedPct: item.skills_discovery_started_pct,
    skillsDiscoveryCompletedPct: item.skills_discovery_completed_pct,
    careerReadinessStartedPct: item.career_readiness_started_pct,
    careerReadinessCompletedPct: item.career_readiness_completed_pct,
  };
}

export function useInstitutions(): UseInstitutionsResult {
  // cursor stack: index 0 = page 1 (no cursor), index N = cursor for page N+1
  const [cursorStack, setCursorStack] = useState<(string | undefined)[]>([undefined]);
  const [pageIndex, setPageIndex] = useState(0);
  const [institutions, setInstitutions] = useState<InstitutionRow[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const cursorStackRef = React.useRef(cursorStack);
  cursorStackRef.current = cursorStack;

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    const cursor = cursorStackRef.current[pageIndex];
    AnalyticsService.getInstance()
      .listInstitutions(PAGE_SIZE, cursor)
      .then((data) => {
        if (!isMounted) return;
        setInstitutions(data.data.map(mapApiItemToRow));
        setNextCursor(data.meta.next_cursor);
        setError(null);
        // Push the next cursor onto the stack if we don't already have it
        if (data.meta.next_cursor) {
          setCursorStack((prev) => {
            if (prev.length <= pageIndex + 1) {
              return [...prev, data.meta.next_cursor!];
            }
            return prev;
          });
        }
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
  }, [pageIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const goToNextPage = useCallback(() => {
    if (nextCursor) setPageIndex((p) => p + 1);
  }, [nextCursor]);

  const goToPrevPage = useCallback(() => {
    setPageIndex((p) => Math.max(0, p - 1));
  }, []);

  return {
    institutions,
    loading,
    error,
    page: pageIndex + 1,
    hasNextPage: Boolean(nextCursor),
    hasPrevPage: pageIndex > 0,
    goToNextPage,
    goToPrevPage,
  };
}
