import React, { useCallback, useEffect, useRef, useState } from "react";
import { Box, useTheme } from "@mui/material";
import Sidebar from "src/theme/Sidebar/Sidebar";
import SidebarService from "src/home/components/Sidebar/SidebarService";
import type { SkillsData } from "src/home/components/Sidebar/SidebarService";

const uniqueId = "b1c2d3e4-f5a6-7890-bcde-f12345678901";

export const DATA_TEST_ID = {
  SKILLS_DISCOVERY_SIDEBAR_CHIP: `skills-discovery-sidebar-chip-${uniqueId}`,
  SKILLS_DISCOVERY_SIDEBAR_EMPTY: `skills-discovery-sidebar-empty-${uniqueId}`,
  SKILLS_DISCOVERY_SIDEBAR_EXPAND_BUTTON: `skills-discovery-sidebar-expand-button-${uniqueId}`,
};

const POLL_INTERVAL_MS = 30_000;
const COLLAPSE_AFTER = 8;

const SkillsDiscoverySidebar: React.FC = () => {
  const theme = useTheme();
  const [data, setData] = useState<SkillsData | null>(null);
  const [expanded, setExpanded] = useState(false);
  const cancelledRef = useRef(false);

  const accentColor = theme.palette.primary.main;
  const chipBgColor = theme.palette.brandAccent.light;
  const chipTextColor = theme.palette.primary.main;

  const load = useCallback(async () => {
    const result = await SidebarService.getInstance().getSkillsData();
    if (!cancelledRef.current) setData(result);
  }, []);

  useEffect(() => {
    cancelledRef.current = false;
    void load();
    const timer = setInterval(() => void load(), POLL_INTERVAL_MS);
    return () => {
      cancelledRef.current = true;
      clearInterval(timer);
    };
  }, [load]);

  const chips = data?.skills ?? [];
  const hasMore = chips.length > COLLAPSE_AFTER;
  const visibleChips = hasMore && !expanded ? chips.slice(0, COLLAPSE_AFTER) : chips;

  const handleExpandToggle = () => setExpanded((prev) => !prev);

  return (
    <Sidebar title="Skills Identified" width={300}>
      {chips.length === 0 ? (
        <Box
          data-testid={DATA_TEST_ID.SKILLS_DISCOVERY_SIDEBAR_EMPTY}
          sx={{
            ...theme.typography.caption,
            lineHeight: 1.5,
            color: theme.palette.text.secondary,
          }}
        >
          Skills will appear here as you chat with Njila.
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: theme.fixedSpacing(theme.tabiyaSpacing.xs * 1.5) }}>
            {visibleChips.map((label, i) => (
              <Box
                key={i}
                data-testid={DATA_TEST_ID.SKILLS_DISCOVERY_SIDEBAR_CHIP}
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
              data-testid={DATA_TEST_ID.SKILLS_DISCOVERY_SIDEBAR_EXPAND_BUTTON}
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
      )}
    </Sidebar>
  );
};

export default SkillsDiscoverySidebar;
