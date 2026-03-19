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
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import { useTranslation } from "react-i18next";
import JobPostingDetailsDialog from "src/components/JobPostings/JobPostingDetailsDialog";
import StatCard from "src/components/StatCard/StatCard";
import { mockJobPostings, mockJobPostingStats } from "src/data/mockJobPostings";
import CustomLink from "src/theme/CustomLink/CustomLink";
import type { JobPostingFilters, JobPostingRow } from "src/types";

const MAX_VISIBLE_SKILLS = 2;

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

  const sectors = useMemo(() => Array.from(new Set(mockJobPostings.map((item) => item.sector))), []);
  const locations = useMemo(() => Array.from(new Set(mockJobPostings.map((item) => item.location))), []);
  const platforms = useMemo(() => Array.from(new Set(mockJobPostings.map((item) => item.platform))), []);
  const zqfLevels = useMemo(() => Array.from(new Set(mockJobPostings.map((item) => item.zqfLevel))), []);

  const filteredRows = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return mockJobPostings.filter((row) => {
      const matchesSearch = row.jobTitle.toLowerCase().includes(search);
      const matchesSector = !filters.sector || row.sector === filters.sector;
      const matchesLocation = !filters.location || row.location === filters.location;
      const matchesPlatform = !filters.platform || row.platform === filters.platform;
      const matchesZqf = !filters.zqfLevel || row.zqfLevel === filters.zqfLevel;
      return matchesSearch && matchesSector && matchesLocation && matchesPlatform && matchesZqf;
    });
  }, [filters]);

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
  const sortableHeaders = ["jobTitle", "sector", "location", "zqf", "platform"] as const;

  const renderSortableHeader = (labelKey: string) => (
    <Box display="flex" alignItems="center">
      {t(labelKey).toUpperCase()}
      <Box component="span" sx={{ fontSize: "0.7em", ml: 0.5 }}>
        ▲▼
      </Box>
    </Box>
  );

  return (
    <Box sx={{ paddingBottom: theme.fixedSpacing(theme.tabiyaSpacing.lg) }}>
      <Grid container spacing={theme.fixedSpacing(theme.tabiyaSpacing.md)} sx={{ marginBottom: 2 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard
            title={t("dashboard.jobPostings.stats.jobsSourced")}
            value={mockJobPostingStats.jobsSourced}
            subtitle={t("dashboard.jobPostings.stats.lastUpdated")}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard
            title={t("dashboard.jobPostings.stats.sectorsCovered")}
            value={mockJobPostingStats.sectorsCovered}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard
            title={t("dashboard.jobPostings.stats.sourcePlatforms")}
            value={mockJobPostingStats.sourcePlatformsCount}
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
        {t("dashboard.jobPostings.jobsCount", { count: filteredRows.length, total: mockJobPostings.length })}
      </Typography>

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
              {sortableHeaders.map((headerKey) => (
                <TableCell key={headerKey} sx={headerKey === "zqf" ? { whiteSpace: "nowrap", width: 90 } : undefined}>
                  {renderSortableHeader(`dashboard.jobPostings.table.${headerKey}`)}
                </TableCell>
              ))}
              <TableCell>{t("dashboard.jobPostings.table.skillsExtracted").toUpperCase()}</TableCell>
              <TableCell align="right">
                <Box display="flex" flexDirection="column" alignItems="flex-end">
                  {renderSortableHeader("dashboard.jobPostings.table.candidatePool")}
                  <Typography variant="caption" sx={{ fontSize: "0.65rem", mt: 0.5 }}>
                    {t("dashboard.jobPostings.table.candidatePoolSubheader").toUpperCase()}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell align="right">{t("dashboard.jobPostings.table.link").toUpperCase()}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows.map((row: JobPostingRow) => (
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
