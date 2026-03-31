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
  educationSkills: Skill[];
  isLoading: boolean;
}

const SkillChips: React.FC<{ skills: Skill[]; startIndex?: number }> = ({ skills, startIndex = 0 }) => {
  const theme = useTheme();
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: theme.fixedSpacing(theme.tabiyaSpacing.xs) }}>
      {skills.map((skill, index) => (
        <Chip
          key={skill.UUID}
          label={skill.preferredLabel}
          size="small"
          data-testid={DATA_TEST_ID.SKILL_ITEM(startIndex + index)}
          sx={{ borderRadius: theme.rounding(theme.tabiyaRounding.sm) }}
        />
      ))}
    </Box>
  );
};

const SkillSection: React.FC<{
  title: string;
  skills: Skill[];
  emptyText: string;
  isLoading: boolean;
  startIndex?: number;
  titleTestId?: string;
  emptyTestId?: string;
}> = ({ title, skills, emptyText, isLoading, startIndex = 0, titleTestId, emptyTestId }) => {
  const theme = useTheme();
  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: theme.fixedSpacing(theme.tabiyaSpacing.sm),
        }}
      >
        <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" data-testid={titleTestId}>
          {title}
        </Typography>
        {!isLoading && skills.length > 0 && (
          <Typography variant="body2" color="text.secondary">
            {skills.length}
          </Typography>
        )}
      </Box>
      {isLoading ? (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: theme.fixedSpacing(theme.tabiyaSpacing.xs) }}>
          {[100, 80, 120, 90, 110].map((w, i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              width={w}
              height={28}
              sx={{ borderRadius: theme.rounding(theme.tabiyaRounding.sm) }}
            />
          ))}
        </Box>
      ) : skills.length === 0 ? (
        <Typography variant="body2" color="text.disabled" data-testid={emptyTestId}>
          {emptyText}
        </Typography>
      ) : (
        <SkillChips skills={skills} startIndex={startIndex} />
      )}
    </Box>
  );
};

export const SkillsDiscoveredCard: React.FC<SkillsDiscoveredCardProps> = ({ skills, educationSkills, isLoading }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const totalSkills = skills.length + educationSkills.length;

  return (
    <Card
      sx={{ border: `1px solid ${theme.palette.divider}`, boxShadow: "none" }}
      data-testid={DATA_TEST_ID.SKILLS_CARD}
    >
      <CardContent
        sx={{
          padding: theme.fixedSpacing(theme.tabiyaSpacing.lg),
          "&:last-child": { paddingBottom: theme.fixedSpacing(theme.tabiyaSpacing.lg) },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginBottom: theme.fixedSpacing(theme.tabiyaSpacing.md),
          }}
        >
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            color="text.primary"
            data-testid={DATA_TEST_ID.SKILLS_TITLE}
          >
            {t("home.profile.skillsDiscovered")}
          </Typography>
          {!isLoading && totalSkills > 0 && (
            <Typography variant="body2" color="text.secondary">
              {totalSkills}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: theme.fixedSpacing(theme.tabiyaSpacing.md) }}>
          <SkillSection
            title={t("home.profile.workSkills")}
            skills={skills}
            emptyText={t("home.profile.noSkillsYet")}
            isLoading={isLoading}
            startIndex={0}
            titleTestId={DATA_TEST_ID.SKILLS_TITLE}
            emptyTestId={DATA_TEST_ID.SKILLS_EMPTY}
          />
          <SkillSection
            title={t("home.profile.educationSkills")}
            skills={educationSkills}
            emptyText={t("home.profile.noEducationSkillsYet")}
            isLoading={isLoading}
            startIndex={skills.length}
          />
        </Box>
      </CardContent>
    </Card>
  );
};
