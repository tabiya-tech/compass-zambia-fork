import React from "react";
import {
  alpha,
  Box,
  FormControl,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useTranslation } from "react-i18next";
import { getModuleLabel, PLACEHOLDER_SYMBOL, isPlaceholderValue } from "src/constants";
import { useInstructorStudentsTableState, type StudentsSortKey } from "src/hooks/useInstructorStudentsTableState";
import type { InstructorStudentRow } from "src/types";

export interface InstructorStudentsTableProps {
  rows: InstructorStudentRow[];
  loading?: boolean;
  hasMoreRows?: boolean;
  onLoadMoreRows?: () => Promise<void>;
}

const fracComplete = (s: string): boolean => {
  const m = s.trim().match(/^(\d+)\s*\/\s*(\d+)$/);
  return !!m && m[1] === m[2] && +m[2] > 0;
};

const COL_COUNT = 9;

const plainHeaders = ["studentName", "programme", "year", "gender"] as const;
interface SortableHeaderConfig {
  labelKey: string;
  key: string;
}

const sortableHeaders: SortableHeaderConfig[] = [
  { labelKey: "modulesExplored", key: "modulesExplored" },
  { labelKey: "careerReady", key: "careerReady" },
  { labelKey: "skillsInterestsExplored", key: "skillsInterestsExplored" },
] as const;
const trailingHeaders = ["lastLogin", "lastActiveModule"] as const;
const LOADING_SKELETON_ROWS = 8;
const METRIC_COLUMN_KEYS = new Set<StudentsSortKey>(["modulesExplored", "careerReady", "skillsInterestsExplored"]);

const filterSelect = (value: string, onChange: (v: string) => void, options: { value: string; label: string }[]) => (
  <FormControl size="small" fullWidth>
    <Select
      value={value}
      onChange={(e: SelectChangeEvent) => onChange(e.target.value)}
      displayEmpty
      sx={{ fontSize: "0.75rem" }}
    >
      {options.map((o) => (
        <MenuItem key={o.value} value={o.value}>
          {o.label}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

const InstructorStudentsTable: React.FC<InstructorStudentsTableProps> = ({
  rows: allRows,
  loading = false,
  hasMoreRows = false,
  onLoadMoreRows,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const {
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
  } = useInstructorStudentsTableState(allRows, {
    hasMoreRows,
    loadingRows: loading,
    onLoadMoreRows,
  });

  const checkIconProps = { sx: { color: "secondary.main", fontSize: 22 } as const };
  const headBg = theme.palette.mode === "dark" ? theme.palette.grey[900] : theme.palette.grey[50];
  const borderColor = theme.palette.divider;

  return (
    <>
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: theme.tabiyaRounding.sm,
          overflowX: "auto",
          border: `1px solid ${borderColor}`,
          boxShadow: "0 1px 4px 0 rgba(0,0,0,0.06)",
        }}
      >
        <Table
          size="small"
          aria-label={t("instructorDashboard.studentsTable.ariaLabel")}
          sx={{
            "& .MuiTableCell-root": { color: theme.palette.text.secondary },
            "& .MuiTypography-root": { color: "inherit" },
          }}
        >
          <TableHead
            sx={{
              "& .MuiTableCell-root": {
                backgroundColor: headBg,
                fontWeight: 700,
                fontSize: "0.68rem",
                borderBottom: `1px solid ${borderColor}`,
                whiteSpace: "nowrap",
              },
            }}
          >
            {/* Header row */}
            <TableRow>
              {plainHeaders.map((h) => (
                <TableCell key={h} sx={{ verticalAlign: "bottom" }}>
                  {t(`instructorDashboard.studentsTable.headers.${h}`).toUpperCase()}
                </TableCell>
              ))}
              {sortableHeaders.map((h) => (
                <TableCell
                  key={h.key}
                  align="center"
                  sx={{
                    verticalAlign: "bottom",
                    minWidth: METRIC_COLUMN_KEYS.has(h.key as StudentsSortKey) ? 130 : undefined,
                    width: METRIC_COLUMN_KEYS.has(h.key as StudentsSortKey) ? 130 : undefined,
                  }}
                >
                  <TableSortLabel
                    active={sortKey === h.key}
                    direction={sortKey === h.key ? sortDir : "asc"}
                    onClick={() => handleSort(h.key as StudentsSortKey)}
                    sx={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 0.25,
                      color: theme.palette.text.secondary,
                      "& .MuiTableSortLabel-iconDirectionAsc, & .MuiTableSortLabel-iconDirectionDesc": {
                        order: 2,
                      },
                      "& .MuiTableSortLabel-icon": {
                        fontSize: "0.75rem",
                        margin: 0,
                      },
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.68rem",
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                        textAlign: "center",
                        whiteSpace: "normal",
                        lineHeight: 1.2,
                      }}
                    >
                      {t(`instructorDashboard.studentsTable.headers.${h.labelKey}`)}
                    </Typography>
                  </TableSortLabel>
                </TableCell>
              ))}
              {trailingHeaders.map((h) => (
                <TableCell key={h} sx={{ verticalAlign: "bottom" }}>
                  {t(`instructorDashboard.studentsTable.headers.${h}`).toUpperCase()}
                </TableCell>
              ))}
            </TableRow>

            {/* Filter row */}
            <TableRow sx={{ "& .MuiTableCell-root": { borderBottom: `1px solid ${theme.palette.divider}`, py: 1 } }}>
              <TableCell>
                <TextField
                  size="small"
                  fullWidth
                  placeholder={t("instructorDashboard.studentsTable.filters.searchPlaceholder")}
                  value={nameSearch}
                  onChange={(e) => setNameSearch(e.target.value)}
                  slotProps={{
                    htmlInput: {
                      "aria-label": t("instructorDashboard.studentsTable.filters.searchAriaLabel"),
                    },
                  }}
                  sx={{ "& .MuiOutlinedInput-input": { fontSize: "0.75rem" } }}
                />
              </TableCell>
              <TableCell>
                {filterSelect(
                  programme,
                  setProgramme,
                  programmes.map((p) => ({
                    value: p,
                    label: p === "all" ? t("instructorDashboard.studentsTable.filters.all") : p,
                  }))
                )}
              </TableCell>
              <TableCell>
                {filterSelect(
                  yearFilter,
                  setYearFilter,
                  years.map((y) => ({
                    value: y,
                    label: y === "all" ? t("instructorDashboard.studentsTable.filters.all") : y,
                  }))
                )}
              </TableCell>
              <TableCell>
                {filterSelect(
                  gender,
                  setGender,
                  genders.map((g) => ({
                    value: g,
                    label: g === "all" ? t("instructorDashboard.studentsTable.filters.all") : g,
                  }))
                )}
              </TableCell>
              {/* Empty cells for non-filterable columns */}
              <TableCell sx={{ width: 130 }} />
              <TableCell sx={{ width: 130 }} />
              <TableCell sx={{ width: 130 }} />
              <TableCell>
                {filterSelect(lastLoginFilter, setLastLoginFilter, [
                  { value: "all", label: t("instructorDashboard.studentsTable.filters.all") },
                  { value: "today", label: t("instructorDashboard.studentsTable.filters.today") },
                  { value: "week", label: t("instructorDashboard.studentsTable.filters.thisWeek") },
                  { value: "older", label: t("instructorDashboard.studentsTable.filters.older") },
                ])}
              </TableCell>
              <TableCell>
                {filterSelect(
                  lastModuleFilter,
                  setLastModuleFilter,
                  modules.map((m) => ({
                    value: m,
                    label: m === "all" ? t("instructorDashboard.studentsTable.filters.all") : getModuleLabel(m),
                  }))
                )}
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading &&
              Array.from({ length: LOADING_SKELETON_ROWS }).map((_, idx) => (
                <TableRow key={`loading-row-${idx}`}>
                  {Array.from({ length: COL_COUNT }).map((__, cellIdx) => (
                    <TableCell key={`loading-cell-${idx}-${cellIdx}`}>
                      <Skeleton variant="text" width="75%" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!loading && filteredRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={COL_COUNT} align="center" sx={{ py: 3 }}>
                  {t("instructorDashboard.studentsTable.empty")}
                </TableCell>
              </TableRow>
            )}
            {pagedRows.map((row, idx) => (
              <TableRow
                key={row.id}
                hover
                sx={{
                  backgroundColor: idx % 2 === 0 ? "transparent" : alpha(theme.palette.action.hover, 0.03),
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  },
                }}
              >
                <TableCell>
                  <Typography
                    variant="body2"
                    noWrap
                    title={row.studentName}
                    sx={{ fontWeight: 700, color: "info.main" }}
                  >
                    {row.studentName}
                  </Typography>
                </TableCell>
                <TableCell sx={{ textAlign: isPlaceholderValue(row.programme) ? "center" : undefined }}>
                  <Typography variant="body2" noWrap title={row.programme}>
                    {row.programme}
                  </Typography>
                </TableCell>
                <TableCell sx={{ textAlign: isPlaceholderValue(row.year) ? "center" : undefined }}>
                  {row.year}
                </TableCell>
                <TableCell sx={{ textAlign: isPlaceholderValue(row.gender) ? "center" : undefined }}>
                  {row.gender}
                </TableCell>
                <TableCell align="center" sx={{ width: 130 }}>
                  {row.modulesExplored}
                </TableCell>
                <TableCell align="center" sx={{ width: 130 }}>
                  {fracComplete(row.careerReady) ? <CheckCircleIcon {...checkIconProps} /> : row.careerReady}
                </TableCell>
                <TableCell align="center" sx={{ width: 130 }}>
                  {row.skillsInterestsExplored}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap title={row.lastLogin}>
                    {row.lastLogin}
                  </Typography>
                </TableCell>
                <TableCell
                  sx={{
                    textAlign: getModuleLabel(row.lastActiveModuleId) === PLACEHOLDER_SYMBOL ? "center" : undefined,
                  }}
                >
                  <Typography variant="body2" noWrap title={getModuleLabel(row.lastActiveModuleId)}>
                    {getModuleLabel(row.lastActiveModuleId)}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {(hasPrevPage || hasNextPage) && (
        <Box display="flex" alignItems="center" justifyContent="flex-end" gap={1} mt={1}>
          <Tooltip title={t("dashboard.institutionsTable.prevPage")}>
            <span>
              <IconButton size="small" onClick={goToPrevPage} disabled={!hasPrevPage || loading}>
                <ChevronLeftIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Typography variant="caption" color="text.secondary">
            {t("dashboard.institutionsTable.page", { page: safePageIndex + 1 })}
          </Typography>
          <Tooltip title={t("dashboard.institutionsTable.nextPage")}>
            <span>
              <IconButton size="small" onClick={goToNextPage} disabled={!hasNextPage || loading}>
                <ChevronRightIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      )}
    </>
  );
};

export default InstructorStudentsTable;
