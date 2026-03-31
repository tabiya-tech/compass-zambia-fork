import React from "react";
import { Box, Tab, Tabs, useTheme } from "@mui/material";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import { useTranslation } from "react-i18next";

export type InstructorDashboardTabValue = "students" | "modules" | "skillsAnalytics";

export interface InstructorDashboardTabsProps {
  value: InstructorDashboardTabValue;
  onChange: (value: InstructorDashboardTabValue) => void;
}

const InstructorDashboardTabs: React.FC<InstructorDashboardTabsProps> = ({ value, onChange }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Box sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
      <Tabs
        value={value}
        onChange={(_, tabValue) => onChange(tabValue as InstructorDashboardTabValue)}
        aria-label={t("instructorDashboard.tabs.ariaLabel")}
        textColor="inherit"
        sx={{
          "& .MuiTab-root": {
            textTransform: "none",
            minHeight: 44,
            fontWeight: 700,
            fontSize: "1rem",
          },
          "& .MuiTab-root.Mui-selected": {
            color: theme.palette.primary.main,
          },
        }}
      >
        <Tab
          value="students"
          label={t("instructorDashboard.tabs.students")}
          icon={<SchoolOutlinedIcon />}
          iconPosition="start"
        />
        <Tab
          value="modules"
          label={t("instructorDashboard.tabs.modules")}
          icon={<GridViewOutlinedIcon />}
          iconPosition="start"
        />
        <Tab
          value="skillsAnalytics"
          label={t("instructorDashboard.tabs.skillsAnalytics")}
          icon={<InsightsOutlinedIcon />}
          iconPosition="start"
        />
      </Tabs>
    </Box>
  );
};

export default InstructorDashboardTabs;
