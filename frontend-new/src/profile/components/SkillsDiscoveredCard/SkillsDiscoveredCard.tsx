import React from "react";
import { Box, Card, CardContent, Typography, Skeleton, Chip, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Skill } from "src/experiences/experienceService/experiences.types";

const uniqueId = "skills-discovered-card-c8f4a5b6-9d1e-2f3a-4b5c-6d7e8f9a1b2c";

export const DATA_TEST_ID = {
  SKILLS_CARD: `skills-card-${uniqueId}`,
  SKILLS_TITLE: `skills-title-${uniqueId}`,
  SKILLS_EMPTY: `skills-empty-${uniqueId}`,
  SKILL_ITEM: (index: number) => `skill-item-${index}-${uniqueId}`,
};

export interface SkillsDiscoveredCardProps {
  skills: Skill[];
  isLoading: boolean;
}

/**
 * SkillsDiscoveredCard displays all unique skills discovered across conversation sessions.
 * Shows skeleton loaders while data is loading and empty state when no skills found.
 *
 * @param skills - Array of unique skills aggregated from all experiences
 * @param isLoading - Whether data is currently being loaded
 */
export const SkillsDiscoveredCard: React.FC<SkillsDiscoveredCardProps> = ({ skills, isLoading }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Card
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: "none",
      }}
      data-testid={DATA_TEST_ID.SKILLS_CARD}
    >
      <CardContent
        sx={{
          padding: theme.spacing(theme.tabiyaSpacing.lg),
        }}
      >
        <Typography
          variant="h6"
          sx={{
            marginBottom: theme.spacing(theme.tabiyaSpacing.md),
            fontWeight: "bold",
          }}
          data-testid={DATA_TEST_ID.SKILLS_TITLE}
        >
          {t("home.profile.skillsDiscovered")}
        </Typography>

        {isLoading ? (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: theme.spacing(theme.tabiyaSpacing.sm) }}>
            <Skeleton variant="rectangular" width={100} height={32} sx={{ borderRadius: 16 }} />
            <Skeleton variant="rectangular" width={120} height={32} sx={{ borderRadius: 16 }} />
            <Skeleton variant="rectangular" width={90} height={32} sx={{ borderRadius: 16 }} />
            <Skeleton variant="rectangular" width={110} height={32} sx={{ borderRadius: 16 }} />
          </Box>
        ) : skills.length === 0 ? (
          <Typography variant="body2" color="text.secondary" data-testid={DATA_TEST_ID.SKILLS_EMPTY}>
            {t("home.profile.noSkillsYet")}
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: theme.spacing(theme.tabiyaSpacing.sm) }}>
            {skills.map((skill, index) => (
              <Chip
                key={skill.UUID}
                label={skill.preferredLabel}
                data-testid={DATA_TEST_ID.SKILL_ITEM(index)}
                sx={{
                  borderRadius: theme.rounding(theme.tabiyaRounding.md),
                }}
              />
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
