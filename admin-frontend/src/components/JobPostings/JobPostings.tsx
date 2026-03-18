import React, { useMemo, useState } from "react";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import {
  Box,
  Button,
  Chip,
  FormControl,
  Grid,
  InputAdornment,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import { useTranslation } from "react-i18next";
import JobPostingDetailsDialog from "src/components/JobPostings/JobPostingDetailsDialog";
import StatCard from "src/components/StatCard/StatCard";
import CustomLink from "src/theme/CustomLink/CustomLink";
import type { JobPostingFilters, JobPostingRow, JobPostingStats } from "src/types";
import { useSortableData } from "src/hooks/useSortableData";

const MAX_VISIBLE_SKILLS = 2;

const jobPostings: JobPostingRow[] = [];
const jobPostingStats: JobPostingStats = { jobsSourced: 0, sectorsCovered: 0, sourcePlatformsCount: 0 };

const JobPostings: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  const [filters, setFilters] = useState<JobPostingFilters>({
    search: "",
    sector: "",
    location: "",
    platform: "",
    zqfLevel: "",
  });
  const [selectedJob, setSelectedJob] = useState<JobPostingRow | null>(null);

  const sectors = useMemo(() => Array.from(new Set(jobPostings.map((item) => item.sector))), []);
  const locations = useMemo(() => Array.from(new Set(jobPostings.map((item) => item.location))), []);
  const platforms = useMemo(() => Array.from(new Set(jobPostings.map((item) => item.platform))), []);
  const zqfLevels = useMemo(() => Array.from(new Set(jobPostings.map((item) => item.zqfLevel))), []);

  const filteredRows = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return jobPostings.filter((row) => {
      const matchesSearch = row.jobTitle.toLowerCase().includes(search);
      const matchesSector = !filters.sector || row.sector === filters.sector;
      const matchesLocation = !filters.location || row.location === filters.location;
      const matchesPlatform = !filters.platform || row.platform === filters.platform;
      const matchesZqf = !filters.zqfLevel || row.zqfLevel === filters.zqfLevel;
      return matchesSearch && matchesSector && matchesLocation && matchesPlatform && matchesZqf;
    });
  }, [filters]);

  const {
    sorted: sortedRows,
    sortKey,
    sortDir,
    handleSort,
  } = useSortableData<JobPostingRow>(filteredRows, "jobTitle", "asc");

  const handleFilterChange = (field: keyof JobPostingFilters) => (event: SelectChangeEvent<string>) => {
    setFilters((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, search: event.target.value }));
  };

  const renderSkills = (skills: string[], row: JobPostingRow) => {
    const visibleSkills = skills.slice(0, MAX_VISIBLE_SKILLS);
    const extraCount = Math.max(0, skills.length - MAX_VISIBLE_SKILLS);

    return (
      <Box display="flex" flexDirection="column" gap={0.5}>
        <Box display="flex" flexWrap="wrap" gap={0.5}>
          {visibleSkills.map((skill) => (
            <Chip
              key={skill}
              label={skill}
              size="small"
              sx={{
                backgroundColor: theme.palette.grey[100],
                border: `1px solid ${theme.palette.divider}`,
                color: theme.palette.text.secondary,
                "& .MuiChip-label": {
                  fontSize: "0.75rem",
                  px: 1,
                },
              }}
            />
          ))}
        </Box>
        {extraCount > 0 && (
          <CustomLink
            aria-label={t("dashboard.jobPostings.aria.moreSkills", { count: extraCount })}
            onClick={() => setSelectedJob(row)}
            sx={{
              fontSize: "0.75rem",
              textDecoration: "none",
              "&&": { color: "primary.main", textDecoration: "none" },
              "&:hover": { textDecoration: "underline" },
            }}
          >
            {t("dashboard.jobPostings.moreSkills", { count: extraCount })}
          </CustomLink>
        )}
      </Box>
    );
  };

  const filterConfig: Array<{ field: keyof JobPostingFilters; label: string; options: string[] }> = [
    { field: "sector", label: t("dashboard.jobPostings.filters.allSectors"), options: sectors },
    { field: "location", label: t("dashboard.jobPostings.filters.allLocations"), options: locations },
    { field: "platform", label: t("dashboard.jobPostings.filters.allPlatforms"), options: platforms },
    { field: "zqfLevel", label: t("dashboard.jobPostings.filters.allZqfLevels"), options: zqfLevels },
  ];
  return (
    <Box sx={{ paddingBottom: theme.fixedSpacing(theme.tabiyaSpacing.lg) }}>
      <Grid container spacing={theme.fixedSpacing(theme.tabiyaSpacing.md)} sx={{ marginBottom: 2 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard
            title={t("dashboard.jobPostings.stats.jobsSourced")}
            value={jobPostingStats.jobsSourced}
            subtitle={t("dashboard.jobPostings.stats.lastUpdated")}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard title={t("dashboard.jobPostings.stats.sectorsCovered")} value={jobPostingStats.sectorsCovered} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard
            title={t("dashboard.jobPostings.stats.sourcePlatforms")}
            value={jobPostingStats.sourcePlatformsCount}
            subtitle={t("dashboard.jobPostings.stats.sourcePlatformsList")}
          />
        </Grid>
      </Grid>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.3fr repeat(4, minmax(140px, 1fr))" },
          gap: theme.fixedSpacing(theme.tabiyaSpacing.md),
          marginBottom: 1.5,
        }}
      >
        <TextField
          size="small"
          value={filters.search}
          onChange={handleSearchChange}
          placeholder={t("dashboard.jobPostings.searchPlaceholder")}
          aria-label={t("dashboard.jobPostings.aria.search")}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlinedIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        {filterConfig.map((filter) => (
          <FormControl key={filter.field} size="small" fullWidth>
            <Select
              value={filters[filter.field]}
              onChange={handleFilterChange(filter.field)}
              displayEmpty
              aria-label={filter.label}
            >
              <MenuItem value="">{filter.label}</MenuItem>
              {filter.options.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ))}
      </Box>

      <Typography variant="caption" color="text.secondary">
        {t("dashboard.jobPostings.jobsCount", { count: filteredRows.length, total: jobPostings.length })}
      </Typography>

      <TableContainer
        sx={{
          borderRadius: theme.rounding(theme.tabiyaRounding.sm),
          overflowX: "auto",
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: "0 1px 4px 0 rgba(0,0,0,0.06)",
        }}
      >
        <Table
          size="small"
          aria-label={t("dashboard.jobPostings.aria.table")}
          sx={{
            "& .MuiTableCell-root": {
              color: theme.palette.text.secondary,
            },
            "& .MuiTypography-root": {
              color: "inherit",
            },
          }}
        >
          {(() => {
            const headBg = theme.palette.mode === "dark" ? theme.palette.grey[900] : theme.palette.grey[50];
            const headerCellSx = {
              backgroundColor: headBg,
              borderBottom: `1px solid ${theme.palette.divider}`,
              py: 1,
              px: 1.5,
              whiteSpace: "nowrap" as const,
              verticalAlign: "bottom" as const,
            };
            const sortLabelSx = { "& .MuiTableSortLabel-icon": { fontSize: "0.75rem" } };
            const labelTypoSx = {
              fontWeight: 700,
              fontSize: "0.68rem",
              letterSpacing: "0.04em",
              textTransform: "uppercase" as const,
            };
            return (
              <TableHead>
                <TableRow>
                  {(["jobTitle", "sector", "location", "zqfLevel", "platform"] as Array<keyof JobPostingRow>).map(
                    (key) => (
                      <TableCell key={key} sx={headerCellSx}>
                        <TableSortLabel
                          active={sortKey === key}
                          direction={sortKey === key ? sortDir : "asc"}
                          onClick={() => handleSort(key)}
                          sx={sortLabelSx}
                        >
                          <Typography variant="caption" sx={labelTypoSx}>
                            {t(`dashboard.jobPostings.table.${key === "zqfLevel" ? "zqf" : key}`)}
                          </Typography>
                        </TableSortLabel>
                      </TableCell>
                    )
                  )}
                  <TableCell sx={headerCellSx}>
                    <Typography variant="caption" sx={labelTypoSx}>
                      {t("dashboard.jobPostings.table.skillsExtracted")}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={headerCellSx}>
                    <Box display="flex" flexDirection="column" alignItems="flex-end">
                      <TableSortLabel
                        active={sortKey === "candidatePool"}
                        direction={sortKey === "candidatePool" ? sortDir : "asc"}
                        onClick={() => handleSort("candidatePool")}
                        sx={{ ...sortLabelSx, justifyContent: "flex-end" }}
                      >
                        <Typography variant="caption" sx={labelTypoSx}>
                          {t("dashboard.jobPostings.table.candidatePool")}
                        </Typography>
                      </TableSortLabel>
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: "0.58rem",
                          color: "text.disabled",
                          textTransform: "uppercase",
                          letterSpacing: "0.02em",
                          mt: 0.25,
                        }}
                      >
                        {t("dashboard.jobPostings.table.candidatePoolSubheader")}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right" sx={headerCellSx}>
                    <Typography variant="caption" sx={labelTypoSx}>
                      {t("dashboard.jobPostings.table.link")}
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
            );
          })()}
          <TableBody>
            {sortedRows.map((row: JobPostingRow) => (
              <TableRow key={row.id} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {row.jobTitle}
                  </Typography>
                </TableCell>
                <TableCell>{row.sector}</TableCell>
                <TableCell>{row.location}</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>{row.zqfLevel}</TableCell>
                <TableCell>{row.platform}</TableCell>
                <TableCell>{renderSkills(row.skills, row)}</TableCell>
                <TableCell align="center" sx={{ fontWeight: 400 }}>
                  {row.candidatePool}
                </TableCell>
                <TableCell align="right">
                  <Button
                    component="a"
                    href={row.jobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    color="primary"
                    variant="text"
                    size="small"
                    sx={{ minWidth: 0, p: 0.5 }}
                    aria-label={t("dashboard.jobPostings.aria.openJob", { title: row.jobTitle })}
                  >
                    <OpenInNewOutlinedIcon fontSize="small" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <JobPostingDetailsDialog job={selectedJob} isOpen={Boolean(selectedJob)} onClose={() => setSelectedJob(null)} />
    </Box>
  );
};

export default JobPostings;
