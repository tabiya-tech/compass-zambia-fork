import React, { useState } from "react";
import { Box, useTheme } from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Sidebar from "src/theme/Sidebar/Sidebar";
import { useWorkSkills } from "src/experiences/hooks/useWorkSkills";
import { useExperiencesDrawer } from "src/experiences/ExperiencesDrawerProvider";
import SidebarService from "src/home/components/Sidebar/SidebarService";

const uniqueId = "e4f5a6b7-c8d9-0123-efab-456789012345";

export const DATA_TEST_ID = {
  HOME_SIDEBAR_SKILLS_FROM_WORK_CHIP: `home-sidebar-skills-from-work-chip-${uniqueId}`,
  HOME_SIDEBAR_SKILLS_FROM_WORK_EMPTY: `home-sidebar-skills-from-work-empty-${uniqueId}`,
  HOME_SIDEBAR_SKILLS_FROM_WORK_EXPAND_BUTTON: `home-sidebar-skills-from-work-expand-button-${uniqueId}`,
  HOME_SIDEBAR_PROGRAMME_SKILLS_CHIP: `home-sidebar-programme-skills-chip-${uniqueId}`,
  HOME_SIDEBAR_PROGRAMME_SKILLS_EMPTY: `home-sidebar-programme-skills-empty-${uniqueId}`,
  HOME_SIDEBAR_PROGRAMME_SKILLS_EXPAND_BUTTON: `home-sidebar-programme-skills-expand-button-${uniqueId}`,
  HOME_SIDEBAR_VIEW_CV_BUTTON: `home-sidebar-view-cv-button-${uniqueId}`,
};

const COLLAPSE_AFTER = 8;

// ─── Section title ────────────────────────────────────────────────────────────

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        ...theme.typography.caption,
        fontWeight: 700,
        color: theme.palette.text.secondary,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        lineHeight: 1.4,
        marginBottom: theme.fixedSpacing(theme.tabiyaSpacing.sm),
      }}
    >
      {children}
    </Box>
  );
};

// ─── Chip list ────────────────────────────────────────────────────────────────

interface ChipListProps {
  chips: string[];
  chipBgColor: string;
  chipTextColor: string;
  accentColor: string;
  emptyText: string;
  emptyTestId: string;
  chipTestId: string;
  expandButtonTestId: string;
}

const ChipList: React.FC<ChipListProps> = ({
  chips,
  chipBgColor,
  chipTextColor,
  accentColor,
  emptyText,
  emptyTestId,
  chipTestId,
  expandButtonTestId,
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const hasMore = chips.length > COLLAPSE_AFTER;
  const visibleChips = hasMore && !expanded ? chips.slice(0, COLLAPSE_AFTER) : chips;

  const handleExpandToggle = () => setExpanded((prev) => !prev);

  if (chips.length === 0) {
    return (
      <Box
        data-testid={emptyTestId}
        sx={{
          ...theme.typography.caption,
          lineHeight: 1.5,
          color: theme.palette.text.secondary,
        }}
      >
        {emptyText}
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: theme.fixedSpacing(theme.tabiyaSpacing.xs * 1.5) }}>
        {visibleChips.map((label, i) => (
          <Box
            key={i}
            data-testid={chipTestId}
            sx={{
              display: "inline-flex",
              alignItems: "center",
              padding: `${theme.fixedSpacing(theme.tabiyaSpacing.xs * 1.25)} ${theme.fixedSpacing(theme.tabiyaSpacing.sm * 1.5)}`,
              borderRadius: theme.rounding(theme.tabiyaRounding.lg),
              ...theme.typography.body2,
              fontWeight: 400,
              lineHeight: 1.4,
              backgroundColor: chipBgColor,
              color: chipTextColor,
            }}
          >
            {label}
          </Box>
        ))}
      </Box>
      {hasMore && (
        <Box
          component="button"
          data-testid={expandButtonTestId}
          onClick={handleExpandToggle}
          sx={{
            background: "none",
            border: "none",
            padding: 0,
            marginTop: theme.fixedSpacing(theme.tabiyaSpacing.sm),
            cursor: "pointer",
            color: accentColor,
            ...theme.typography.caption,
            fontWeight: 500,
            textAlign: "left",
            width: "fit-content",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          {expanded ? "Show Less" : `See All ${chips.length} →`}
        </Box>
      )}
    </Box>
  );
};

// ─── View My CV card ──────────────────────────────────────────────────────────

interface ViewCVCardProps {
  onClick: () => void;
}

const ViewCVCard: React.FC<ViewCVCardProps> = ({ onClick }) => {
  const theme = useTheme();

  return (
    <Box
      component="button"
      data-testid={DATA_TEST_ID.HOME_SIDEBAR_VIEW_CV_BUTTON}
      onClick={onClick}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: theme.fixedSpacing(theme.tabiyaSpacing.sm * 1.5),
        width: 300,
        padding: theme.fixedSpacing(theme.tabiyaSpacing.sm * 1.5),
        borderRadius: theme.rounding(theme.tabiyaRounding.sm * 1.25),
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        cursor: "pointer",
        textAlign: "left",
        "&:hover": { backgroundColor: theme.palette.action.hover },
      }}
    >
      <Box
        sx={{
          width: theme.fixedSpacing(theme.tabiyaSpacing.xl * 1.25),
          height: theme.fixedSpacing(theme.tabiyaSpacing.xl * 1.25),
          borderRadius: theme.rounding(theme.tabiyaRounding.sm),
          backgroundColor: theme.palette.secondary.main,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14 2v6h6M16 13H8M16 17H8M10 9H8"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box
          sx={{
            ...theme.typography.body2,
            fontWeight: 700,
            color: theme.palette.secondary.main,
            lineHeight: 1.3,
          }}
        >
          View My CV
        </Box>
        <Box
          sx={{
            ...theme.typography.caption,
            color: theme.palette.text.secondary,
            lineHeight: 1.4,
            marginTop: theme.fixedSpacing(theme.tabiyaSpacing.xxs),
          }}
        >
          Download and share your personalized CV
        </Box>
      </Box>
      <ChevronRightIcon sx={{ color: theme.palette.text.secondary, fontSize: "18px", flexShrink: 0 }} />
    </Box>
  );
};

// ─── HomeSidebar ──────────────────────────────────────────────────────────────

const HomeSidebar: React.FC = () => {
  const theme = useTheme();
  const { openExperiencesDrawer } = useExperiencesDrawer();
  const workSkills = useWorkSkills();
  const programmeSkills = SidebarService.getInstance().getProgrammeSkillsSync();

  const accentColor = theme.palette.primary.main;
  const tealBg = theme.palette.brandAccent.light;
  const amberBg = theme.palette.common.cream;

  const handleViewCV = () => void openExperiencesDrawer();

  return (
    <Sidebar title="My Skills" width="100%">
      <Box>
        <SectionTitle>Skills From Work</SectionTitle>
        <ChipList
          chips={workSkills}
          chipBgColor={tealBg}
          chipTextColor={accentColor}
          accentColor={accentColor}
          emptyText="Skills will appear here as you chat with Njila."
          emptyTestId={DATA_TEST_ID.HOME_SIDEBAR_SKILLS_FROM_WORK_EMPTY}
          chipTestId={DATA_TEST_ID.HOME_SIDEBAR_SKILLS_FROM_WORK_CHIP}
          expandButtonTestId={DATA_TEST_ID.HOME_SIDEBAR_SKILLS_FROM_WORK_EXPAND_BUTTON}
        />
      </Box>
      <Box>
        <SectionTitle>Programme Skills</SectionTitle>
        <ChipList
          chips={programmeSkills}
          chipBgColor={amberBg}
          chipTextColor={theme.palette.common.black}
          accentColor={accentColor}
          emptyText="Programme skills will appear as you complete modules."
          emptyTestId={DATA_TEST_ID.HOME_SIDEBAR_PROGRAMME_SKILLS_EMPTY}
          chipTestId={DATA_TEST_ID.HOME_SIDEBAR_PROGRAMME_SKILLS_CHIP}
          expandButtonTestId={DATA_TEST_ID.HOME_SIDEBAR_PROGRAMME_SKILLS_EXPAND_BUTTON}
        />
      </Box>
      <Box>
        <SectionTitle>My Experience</SectionTitle>
        <ViewCVCard onClick={handleViewCV} />
      </Box>
    </Sidebar>
  );
};

export default HomeSidebar;
