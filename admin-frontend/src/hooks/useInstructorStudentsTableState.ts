import { useEffect, useMemo, useState } from "react";
import { CAREER_MODULE_LABELS, PLACEHOLDER_SYMBOL } from "src/constants";
import { MODULE_FILTER_PROGRAMMES } from "src/data/moduleFilterOptions";
import type { InstructorStudentRow } from "src/types";

export type StudentsSortKey = "modulesExplored" | "careerReady" | "skillsInterestsExplored";
type SortDir = "asc" | "desc";

type UseInstructorStudentsTableStateOptions = {
  pageSize?: number;
  hasMoreRows?: boolean;
  loadingRows?: boolean;
  onLoadMoreRows?: () => Promise<void>;
};

const KNOWN_GENDERS = ["Male", "Female"] as const;
const DEFAULT_PAGE_SIZE = 20;

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => window.clearTimeout(timeoutId);
  }, [delayMs, value]);

  return debouncedValue;
}

const fracRatio = (value: string): number => {
  const matched = value.trim().match(/^(\d+)\s*\/\s*(\d+)$/);
  if (!matched) return -1;
  const numerator = Number(matched[1]);
  const denominator = Number(matched[2]);
  return denominator > 0 ? numerator / denominator : -1;
};

export function useInstructorStudentsTableState(
  rows: InstructorStudentRow[],
  options?: number | UseInstructorStudentsTableStateOptions
) {
  const resolvedOptions: UseInstructorStudentsTableStateOptions =
    typeof options === "number" ? { pageSize: options } : (options ?? {});

  const pageSize = resolvedOptions.pageSize ?? DEFAULT_PAGE_SIZE;
  const hasMoreRows = resolvedOptions.hasMoreRows ?? false;
  const loadingRows = resolvedOptions.loadingRows ?? false;
  const onLoadMoreRows = resolvedOptions.onLoadMoreRows;
  const [sortKey, setSortKey] = useState<StudentsSortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [nameSearch, setNameSearch] = useState("");
  const [programme, setProgramme] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [gender, setGender] = useState("all");
  const [lastLoginFilter, setLastLoginFilter] = useState("all");
  const [lastModuleFilter, setLastModuleFilter] = useState("all");
  const [pageIndex, setPageIndex] = useState(0);

  const debouncedNameSearch = useDebouncedValue(nameSearch, 250);

  const programmes = useMemo(() => ["all", ...MODULE_FILTER_PROGRAMMES], []);
  const years = useMemo(() => ["all", ...Array.from(new Set(rows.map((r) => r.year)))], [rows]);
  const genders = useMemo(() => {
    const dynamic = Array.from(new Set(rows.map((r) => r.gender).filter((g) => g !== PLACEHOLDER_SYMBOL)));
    const merged = Array.from(new Set([...KNOWN_GENDERS, ...dynamic]));
    return ["all", ...merged];
  }, [rows]);

  const modules = useMemo(() => {
    const knownModuleIds = Object.keys(CAREER_MODULE_LABELS);
    const dynamic = Array.from(
      new Set(rows.map((r) => r.lastActiveModuleId).filter((moduleId) => moduleId !== PLACEHOLDER_SYMBOL))
    );
    return ["all", ...Array.from(new Set([...knownModuleIds, ...dynamic]))];
  }, [rows]);

  const filteredRows = useMemo(() => {
    const query = debouncedNameSearch.trim().toLowerCase();
    return rows.filter((row) => {
      if (query && !row.studentName.toLowerCase().includes(query)) return false;
      if (programme !== "all" && row.programme !== programme) return false;
      if (yearFilter !== "all" && row.year !== yearFilter) return false;
      if (gender !== "all" && row.gender !== gender) return false;
      if (lastModuleFilter !== "all" && row.lastActiveModuleId !== lastModuleFilter) return false;

      if (lastLoginFilter === "all") return true;
      const lastLoginValue = row.lastLogin.trim();
      const recent = lastLoginValue === "Today" || lastLoginValue === "Yesterday";
      const dayMatch = lastLoginValue.match(/^(\d+)\s*days?\s*ago$/i);
      const daysAgo = dayMatch ? Number(dayMatch[1]) : null;

      if (lastLoginFilter === "today") return recent;
      if (lastLoginFilter === "week") return recent || (daysAgo != null && daysAgo >= 1 && daysAgo <= 6);
      if (lastLoginFilter === "older") {
        return !recent && (daysAgo == null || daysAgo >= 7 || /week/i.test(lastLoginValue));
      }
      return true;
    });
  }, [debouncedNameSearch, gender, lastLoginFilter, lastModuleFilter, programme, rows, yearFilter]);

  const sortedRows = useMemo(() => {
    if (!sortKey) {
      return filteredRows;
    }

    const getValue = (row: InstructorStudentRow, key: StudentsSortKey): number => {
      if (key === "modulesExplored") return row.modulesExplored;
      if (key === "careerReady") return fracRatio(row.careerReady);
      return row.skillsInterestsExplored;
    };

    return [...filteredRows].sort((a, b) => {
      const left = getValue(a, sortKey);
      const right = getValue(b, sortKey);
      const comparison = left < right ? -1 : left > right ? 1 : 0;
      return sortDir === "asc" ? comparison : -comparison;
    });
  }, [filteredRows, sortDir, sortKey]);

  useEffect(() => {
    setPageIndex(0);
  }, [debouncedNameSearch, programme, yearFilter, gender, lastLoginFilter, lastModuleFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const safePageIndex = Math.min(pageIndex, totalPages - 1);
  const pageStart = safePageIndex * pageSize;
  const pagedRows = sortedRows.slice(pageStart, pageStart + pageSize);
  const hasPrevPage = safePageIndex > 0;
  const hasNextLoadedPage = safePageIndex < totalPages - 1;
  const hasNextPage = hasNextLoadedPage || hasMoreRows;

  useEffect(() => {
    const isBeyondLoadedRows = pageStart >= sortedRows.length;
    if (isBeyondLoadedRows && hasMoreRows && !loadingRows && onLoadMoreRows) {
      void onLoadMoreRows();
    }
  }, [hasMoreRows, loadingRows, onLoadMoreRows, pageStart, sortedRows.length]);

  const handleSort = (key: StudentsSortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir("asc");
  };

  const goToNextPage = () => {
    if (hasNextPage) {
      setPageIndex((prev) => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (hasPrevPage) {
      setPageIndex((prev) => prev - 1);
    }
  };

  return {
    sortKey,
    sortDir,
    handleSort,
    nameSearch,
    setNameSearch,
    programme,
    setProgramme,
    yearFilter,
    setYearFilter,
    gender,
    setGender,
    lastLoginFilter,
    setLastLoginFilter,
    lastModuleFilter,
    setLastModuleFilter,
    programmes,
    years,
    genders,
    modules,
    filteredRows,
    pagedRows,
    safePageIndex,
    hasPrevPage,
    hasNextPage,
    goToNextPage,
    goToPrevPage,
  };
}
