import React from "react";
import { Box, useTheme, useMediaQuery, Stack } from "@mui/material";
import { Theme } from "@mui/material/styles";
import { Skill } from "src/experiences/experienceService/experiences.types";
import { SecurityCard } from "./components/SecurityCard/SecurityCard";
import { PreferencesCard } from "./components/PreferencesCard/PreferencesCard";
import { ProfileCard } from "./components/ProfileCard/ProfileCard";
import { ModuleProgressCard } from "./components/ModuleProgressCard/ModuleProgressCard";
import { SkillsDiscoveredCard } from "./components/SkillsDiscoveredCard/SkillsDiscoveredCard";

const uniqueId = "a7f8e4b2-9c3d-4a1e-8f6b-2d3e4a5b6c7d";

export const DATA_TEST_ID = {
  PROFILE_CONTENT: `profile-content-${uniqueId}`,
};

export interface ModuleProgress {
  id: string;
  labelKey: string;
  progress: number;
}

export interface ProfileProps {
  email: string | null;
  language: string | null;
  termsAcceptedDate: Date | null;
  name: string | null;
  location: string | null;
  school: string | null;
  program: string | null;
  year: string | null;
  skills: Skill[];
  modules: ModuleProgress[];
  isLoadingSecurity: boolean;
  isLoadingPreferences: boolean;
  isLoadingProfile: boolean;
  isLoadingSkills: boolean;
}

/**
 * Profile presentation component - Pure UI component for displaying user profile
 * This component only handles rendering and does not manage any state or side effects.
 *
 * @param email - User's email
 * @param language - User's preferred language
 * @param termsAcceptedDate - Date when user accepted terms and conditions
 * @param name - User's name
 * @param location - User's location
 * @param school - User's school
 * @param program - User's program
 * @param year - User's year
 * @param skills - Array of skills discovered by the user
 * @param modules - Array of module progress data
 * @param isLoadingSecurity - Loading state for security data
 * @param isLoadingPreferences - Loading state for preferences data
 * @param isLoadingProfile - Loading state for profile data
 * @param isLoadingSkills - Loading state for skills data
 */
export const Profile: React.FC<ProfileProps> = ({
  email,
  language,
  termsAcceptedDate,
  name,
  location,
  school,
  program,
  year,
  skills,
  modules,
  isLoadingSecurity,
  isLoadingPreferences,
  isLoadingProfile,
  isLoadingSkills,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));

  return (
    <Box
      sx={{
        paddingX: theme.spacing(isMobile ? theme.tabiyaSpacing.md : theme.tabiyaSpacing.lg),
        paddingY: theme.spacing(theme.tabiyaSpacing.xl),
        maxWidth: "800px",
        margin: "0 auto",
      }}
      data-testid={DATA_TEST_ID.PROFILE_CONTENT}
    >
      <Stack spacing={theme.spacing(theme.tabiyaSpacing.md)}>
        <ProfileCard
          name={name}
          location={location}
          school={school}
          program={program}
          year={year}
          isLoading={isLoadingProfile}
        />

        <ModuleProgressCard modules={modules} />

        <SkillsDiscoveredCard skills={skills} isLoading={isLoadingSkills} />

        <Stack direction={{ md: "row", sm: "column" }} gap={theme.spacing(theme.tabiyaSpacing.md)}>
          <SecurityCard email={email} isLoading={isLoadingSecurity} />
          <PreferencesCard language={language} acceptedTcDate={termsAcceptedDate} isLoading={isLoadingPreferences} />
        </Stack>
      </Stack>
    </Box>
  );
};
