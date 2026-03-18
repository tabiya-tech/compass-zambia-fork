import React from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
  Box,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import type { InstitutionRow } from "src/types";

export interface InstitutionsTableProps {
  rows: InstitutionRow[];
}

const InstitutionsTable: React.FC<InstitutionsTableProps> = ({ rows }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const renderPct = (val?: number | null) => (val === null || val === undefined ? "—" : `${val}%`);
  const renderNum = (val?: number | null) => (val === null || val === undefined ? "—" : val.toString());

  const sortableMainHeaders = ["institution", "province", "students", "active7Days"] as const;

  const groupedHeaders = [
    { key: "skillsDiscovery", colSpan: 2 },
    { key: "careerReadiness", colSpan: 2 },
    { key: "careerExplorer", colSpan: 1 },
  ] as const;
  const metricSubHeaders = [
    { labelKey: "started", captionKey: "ofReg" },
    { labelKey: "completed", captionKey: "ofStarted" },
    { labelKey: "started", captionKey: "ofReg" },
    { labelKey: "completed", captionKey: "ofStarted" },
    { labelKey: "started", captionKey: "ofReg" },
  ] as const;

  const renderSortableLabel = (label: string) => (
    <Box display="flex" alignItems="center">
      {label.toUpperCase()}{" "}
      <Box component="span" sx={{ fontSize: "0.7em", ml: 0.5 }}>
        ▲▼
      </Box>
    </Box>
  );

  return (
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: theme.tabiyaRounding.sm,
        overflowX: "auto",
        boxShadow: "none",
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Table
        size="small"
        aria-label="institutions table"
        sx={{
          "& .MuiTableCell-root": {
            color: theme.palette.text.secondary,
          },
          "& .MuiTypography-root": {
            color: "inherit",
          },
        }}
      >
        <TableHead
          sx={{
            "& .MuiTableCell-root": {
              backgroundColor: "transparent",
              fontWeight: 600,
              fontSize: "0.75rem",
              borderBottom: `2px solid ${theme.palette.divider}`,
              whiteSpace: "nowrap",
            },
          }}
        >
          <TableRow>
            {sortableMainHeaders.map((headerKey) => (
              <TableCell key={headerKey} rowSpan={2} sx={{ verticalAlign: "bottom" }}>
                {renderSortableLabel(t(`dashboard.institutionsTable.headers.${headerKey}`))}
              </TableCell>
            ))}
            {groupedHeaders.map((group) => (
              <TableCell key={group.key} align="center" colSpan={group.colSpan} sx={{ paddingBottom: 1 }}>
                {t(`dashboard.institutionsTable.headers.${group.key}`).toUpperCase()}
              </TableCell>
            ))}
          </TableRow>
          <TableRow>
            {metricSubHeaders.map((item, idx) => (
              <TableCell key={`${item.labelKey}-${item.captionKey}-${idx}`} align="center" sx={{ pt: 1 }}>
                <Box display="flex" alignItems="center" justifyContent="center">
                  {t(`dashboard.institutionsTable.subHeaders.${item.labelKey}`).toUpperCase()}{" "}
                  <Box component="span" sx={{ fontSize: "0.7em", ml: 0.5 }}>
                    ▲▼
                  </Box>
                </Box>
                <Typography variant="caption" display="block" sx={{ fontSize: "0.65rem", mt: 0.5 }}>
                  {t(`dashboard.institutionsTable.subHeaders.${item.captionKey}`).toUpperCase()}
                </Typography>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r) => {
            const studentsAvailable = r.students !== null && r.students !== undefined;
            const activeAvailable = r.active7Days !== null && r.active7Days !== undefined;
            const highlightLeftBorder = studentsAvailable || activeAvailable;

            return (
              <TableRow key={r.id} hover>
                <TableCell
                  sx={{
                    borderLeft: `3px solid ${
                      highlightLeftBorder ? theme.palette.secondary.main : theme.palette.divider
                    }`,
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {r.institution}
                  </Typography>
                </TableCell>
                <TableCell>{r.province}</TableCell>
                <TableCell>{renderNum(r.students)}</TableCell>
                <TableCell>{renderNum(r.active7Days)}</TableCell>
                <TableCell align="center">
                  {renderPct(studentsAvailable ? r.skillsDiscoveryStartedPct : null)}
                </TableCell>
                <TableCell align="center">
                  {renderPct(studentsAvailable ? r.skillsDiscoveryCompletedPct : null)}
                </TableCell>
                <TableCell align="center">
                  {renderPct(studentsAvailable ? r.careerReadinessStartedPct : null)}
                </TableCell>
                <TableCell align="center">
                  {renderPct(studentsAvailable ? r.careerReadinessCompletedPct : null)}
                </TableCell>
                <TableCell align="center">{renderPct(studentsAvailable ? r.careerExplorerStartedPct : null)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default InstitutionsTable;
