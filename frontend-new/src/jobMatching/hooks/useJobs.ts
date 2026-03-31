import { useCallback, useEffect, useState } from "react";
import JobService from "src/jobMatching/services/JobService";
import type { JobApiDocument, JobFilters, JobRow } from "src/jobMatching/types";

const PAGE_SIZE = 20;

let _rowCounter = 0;
const nextId = () => String(++_rowCounter);

function mapDocToRow(doc: JobApiDocument): JobRow {
  return {
    id: nextId(),
    jobTitle: (doc.title as string | undefined) ?? "",
    company: (doc.employer as string | undefined) ?? "",
    category: (doc.category as string | undefined) ?? "",
    employmentType: (doc.employment_type as string | undefined) ?? "",
    location: (doc.location as string | undefined) ?? "",
    posted: (doc.posted_date as string | undefined) ?? "",
    jobUrl: (doc.application_url as string | undefined) ?? undefined,
    skills: Array.isArray(doc.skills) ? (doc.skills as string[]) : undefined,
  };
}

export interface UseJobsResult {
  jobs: JobRow[];
  loading: boolean;
  error: string | null;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  page: number;
  goToNextPage: () => void;
  goToPrevPage: () => void;
  reload: () => void;
}

export function useJobs(filters: JobFilters): UseJobsResult {
  // Stack of cursors: index 0 = first page (cursor undefined), index N = cursor for page N
  const [cursorStack, setCursorStack] = useState<(string | undefined)[]>([undefined]);
  const [pageIndex, setPageIndex] = useState(0);
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reset to page 0 when filters change
  useEffect(() => {
    setCursorStack([undefined]);
    setPageIndex(0);
  }, [filters.category, filters.employmentType, filters.location]);

  useEffect(() => {
    const cursor = cursorStack[pageIndex];
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await JobService.getInstance().listJobs({
          category: filters.category !== "all" ? filters.category : undefined,
          employment_type: filters.employmentType !== "all" ? filters.employmentType : undefined,
          location: filters.location !== "all" ? filters.location : undefined,
          cursor,
          limit: PAGE_SIZE,
        });
        if (!cancelled) {
          setJobs(result.data.map(mapDocToRow));
          setNextCursor(result.meta.next_cursor);
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load jobs");
          setJobs([]);
          setNextCursor(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [cursorStack, pageIndex, filters.category, filters.employmentType, filters.location]);

  const goToNextPage = useCallback(() => {
    if (!nextCursor) return;
    setCursorStack((prev) => {
      const updated = [...prev];
      updated[pageIndex + 1] = nextCursor;
      return updated;
    });
    setPageIndex((p) => p + 1);
  }, [nextCursor, pageIndex]);

  const goToPrevPage = useCallback(() => {
    setPageIndex((p) => Math.max(0, p - 1));
  }, []);

  const reload = useCallback(() => {
    setCursorStack([undefined]);
    setPageIndex(0);
  }, []);

  return {
    jobs,
    loading,
    error,
    hasNextPage: Boolean(nextCursor),
    hasPrevPage: pageIndex > 0,
    page: pageIndex + 1,
    goToNextPage,
    goToPrevPage,
    reload,
  };
}
