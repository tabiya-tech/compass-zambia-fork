import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
  useTheme,
  Box,
  Skeleton,
  alpha,
  IconButton,
  Tooltip,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useTranslation } from "react-i18next";
import type { InstitutionRow } from "src/types";
import { useSortableData } from "src/hooks/useSortableData";

export interface InstitutionsTableProps {
  rows: InstitutionRow[];
  loading?: boolean;
  page?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
  onNextPage?: () => void;
  onPrevPage?: () => void;
}

const SKELETON_ROWS = 8;

// Accent colors for each metric group header bar
const GROUP_COLORS = {
  skillsDiscovery: "#4C9BE8",
  careerReadiness: "#7B61C4",
};

const InstitutionsTable: React.FC<InstitutionsTableProps> = ({
  rows,
  loading = false,
  page,
  hasNextPage,
  hasPrevPage,
  onNextPage,
  onPrevPage,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const {
    sorted: sortedRows,
    sortKey,
    sortDir,
    handleSort,
  } = useSortableData<InstitutionRow>(rows, "institution", "asc");

  const renderPct = (val?: number | null) => (val === null || val === undefined ? "—" : `${val}%`);
  const renderNum = (val?: number | null) => (val === null || val === undefined ? "—" : val.toLocaleString());

  const headBg = theme.palette.mode === "dark" ? theme.palette.grey[900] : theme.palette.grey[50];
  const borderColor = theme.palette.divider;

  const groupHeaderCellSx = (color: string) => ({
    backgroundColor: headBg,
    borderBottom: `2px solid ${color}`,
    textAlign: "center" as const,
    py: 0.75,
    px: 1,
    whiteSpace: "nowrap" as const,
  });

  const subHeaderCellSx = {
    backgroundColor: headBg,
    borderBottom: `1px solid ${borderColor}`,
    textAlign: "center" as const,
    py: 0.75,
    px: 1,
    whiteSpace: "nowrap" as const,
    minWidth: 80,
  };

  const mainHeaderCellSx = {
    backgroundColor: headBg,
    borderBottom: `1px solid ${borderColor}`,
    py: 1,
    px: 1.5,
    verticalAlign: "bottom" as const,
    whiteSpace: "nowrap" as const,
  };

  const totalCols = 7;

  return (
    <>
      <TableContainer
        sx={{
          borderRadius: theme.rounding ? theme.rounding(theme.tabiyaRounding.sm) : 1,
          overflowX: "auto",
          border: `1px solid ${borderColor}`,
          boxShadow: "0 1px 4px 0 rgba(0,0,0,0.06)",
        }}
      >
        <Table size="small" aria-label="institutions table" sx={{ minWidth: 960 }}>
          <TableHead>
            {/* Row 1: main columns (rowSpan=2) + group headers */}
            <TableRow>
              <TableCell rowSpan={2} sx={{ ...mainHeaderCellSx, minWidth: 180 }}>
                <TableSortLabel
                  active={sortKey === "institution"}
                  direction={sortKey === "institution" ? sortDir : "asc"}
                  onClick={() => handleSort("institution")}
                  sx={{ "& .MuiTableSortLabel-icon": { fontSize: "0.75rem" } }}
                >
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 700, fontSize: "0.68rem", letterSpacing: "0.04em", textTransform: "uppercase" }}
                  >
                    {t("dashboard.institutionsTable.headers.institution")}
                  </Typography>
                </TableSortLabel>
              </TableCell>
              <TableCell rowSpan={2} sx={{ ...mainHeaderCellSx, minWidth: 76, textAlign: "right" }}>
                <TableSortLabel
                  active={sortKey === "students"}
                  direction={sortKey === "students" ? sortDir : "asc"}
                  onClick={() => handleSort("students")}
                  sx={{ justifyContent: "flex-end", "& .MuiTableSortLabel-icon": { fontSize: "0.75rem" } }}
                >
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 700, fontSize: "0.68rem", letterSpacing: "0.04em", textTransform: "uppercase" }}
                  >
                    {t("dashboard.institutionsTable.headers.students")}
                  </Typography>
                </TableSortLabel>
              </TableCell>
              <TableCell rowSpan={2} sx={{ ...mainHeaderCellSx, minWidth: 90, textAlign: "right" }}>
                <TableSortLabel
                  active={sortKey === "active7Days"}
                  direction={sortKey === "active7Days" ? sortDir : "asc"}
                  onClick={() => handleSort("active7Days")}
                  sx={{ justifyContent: "flex-end", "& .MuiTableSortLabel-icon": { fontSize: "0.75rem" } }}
                >
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 700, fontSize: "0.68rem", letterSpacing: "0.04em", textTransform: "uppercase" }}
                  >
                    {t("dashboard.institutionsTable.headers.active7Days")}
                  </Typography>
                </TableSortLabel>
              </TableCell>

              {/* Skills Discovery group */}
              <TableCell colSpan={2} sx={groupHeaderCellSx(GROUP_COLORS.skillsDiscovery)}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.65rem",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: GROUP_COLORS.skillsDiscovery,
                  }}
                >
                  {t("dashboard.institutionsTable.headers.skillsDiscovery")}
                </Typography>
              </TableCell>

              {/* Career Readiness group */}
              <TableCell colSpan={2} sx={groupHeaderCellSx(GROUP_COLORS.careerReadiness)}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.65rem",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: GROUP_COLORS.careerReadiness,
                  }}
                >
                  {t("dashboard.institutionsTable.headers.careerReadiness")}
                </Typography>
              </TableCell>
            </TableRow>

            {/* Row 2: sub-headers for metric groups */}
            <TableRow>
              {(
                [
                  {
                    key: "skillsDiscoveryStartedPct",
                    label: t("dashboard.institutionsTable.subHeaders.started"),
                    caption: t("dashboard.institutionsTable.subHeaders.ofReg"),
                  },
                  {
                    key: "skillsDiscoveryCompletedPct",
                    label: t("dashboard.institutionsTable.subHeaders.completed"),
                    caption: t("dashboard.institutionsTable.subHeaders.ofStarted"),
                  },
                  {
                    key: "careerReadinessStartedPct",
                    label: t("dashboard.institutionsTable.subHeaders.started"),
                    caption: t("dashboard.institutionsTable.subHeaders.ofReg"),
                  },
                  {
                    key: "careerReadinessCompletedPct",
                    label: t("dashboard.institutionsTable.subHeaders.completed"),
                    caption: t("dashboard.institutionsTable.subHeaders.ofStarted"),
                  },
                ] as Array<{ key: keyof InstitutionRow; label: string; caption: string }>
              ).map(({ key, label, caption }) => (
                <TableCell key={key} sx={subHeaderCellSx}>
                  <TableSortLabel
                    active={sortKey === key}
                    direction={sortKey === key ? sortDir : "asc"}
                    onClick={() => handleSort(key)}
                    sx={{
                      flexDirection: "column",
                      alignItems: "center",
                      "& .MuiTableSortLabel-icon": { fontSize: "0.65rem", mt: 0.25, ml: 0, mr: 0 },
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 600,
                        fontSize: "0.65rem",
                        letterSpacing: "0.03em",
                        textTransform: "uppercase",
                        lineHeight: 1.3,
                      }}
                    >
                      {label}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: "0.58rem",
                        color: "text.disabled",
                        textTransform: "uppercase",
                        letterSpacing: "0.02em",
                        lineHeight: 1.3,
                      }}
                    >
                      {caption}
                    </Typography>
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: totalCols }).map((__, j) => (
                    <TableCell key={j} sx={{ py: 1, px: 1.5 }}>
                      <Skeleton variant="text" sx={{ fontSize: "0.875rem" }} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={totalCols} align="center" sx={{ py: 6, borderBottom: 0 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t("dashboard.institutionsTable.empty")}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              sortedRows.map((r, idx) => {
                const studentsAvailable = r.students !== null && r.students !== undefined;
                const isEven = idx % 2 === 0;

                return (
                  <TableRow
                    key={r.id}
                    hover
                    sx={{
                      backgroundColor: isEven ? "transparent" : alpha(theme.palette.action.hover, 0.03),
                      "&:hover": {
                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                      },
                      "&:last-child td": { borderBottom: 0 },
                    }}
                  >
                    {/* Institution */}
                    <TableCell sx={{ py: 1, px: 1.5, borderRight: `1px solid ${borderColor}` }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                        {r.institution}
                      </Typography>
                    </TableCell>

                    {/* Students */}
                    <TableCell align="right" sx={{ py: 1, px: 1.5, fontVariantNumeric: "tabular-nums" }}>
                      <Typography variant="body2">{renderNum(r.students)}</Typography>
                    </TableCell>

                    {/* Active 7d */}
                    <TableCell
                      align="right"
                      sx={{
                        py: 1,
                        px: 1.5,
                        fontVariantNumeric: "tabular-nums",
                        borderRight: `1px solid ${borderColor}`,
                      }}
                    >
                      <Typography variant="body2">{renderNum(r.active7Days)}</Typography>
                    </TableCell>

                    {/* Skills Discovery */}
                    <TableCell align="center" sx={{ py: 1, px: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {renderPct(studentsAvailable ? r.skillsDiscoveryStartedPct : null)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1, px: 1, borderRight: `1px solid ${borderColor}` }}>
                      <Typography variant="body2" color="text.secondary">
                        {renderPct(studentsAvailable ? r.skillsDiscoveryCompletedPct : null)}
                      </Typography>
                    </TableCell>

                    {/* Career Readiness */}
                    <TableCell align="center" sx={{ py: 1, px: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {renderPct(studentsAvailable ? r.careerReadinessStartedPct : null)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1, px: 1, borderRight: `1px solid ${borderColor}` }}>
                      <Typography variant="body2" color="text.secondary">
                        {renderPct(studentsAvailable ? r.careerReadinessCompletedPct : null)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {(hasPrevPage || hasNextPage) && (
        <Box display="flex" alignItems="center" justifyContent="flex-end" gap={1} mt={1}>
          <Tooltip title={t("dashboard.institutionsTable.prevPage")}>
            <span>
              <IconButton size="small" onClick={onPrevPage} disabled={!hasPrevPage || loading}>
                <ChevronLeftIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          {page !== undefined && (
            <Typography variant="caption" color="text.secondary">
              {t("dashboard.institutionsTable.page", { page })}
            </Typography>
          )}
          <Tooltip title={t("dashboard.institutionsTable.nextPage")}>
            <span>
              <IconButton size="small" onClick={onNextPage} disabled={!hasNextPage || loading}>
                <ChevronRightIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      )}
    </>
  );
};

export default InstitutionsTable;
