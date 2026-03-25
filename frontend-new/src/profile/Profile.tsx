import React from "react";
import { Box, useTheme, useMediaQuery, Stack } from "@mui/material";
import { Theme } from "@mui/material/styles";
import { Skill } from "src/experiences/experienceService/experiences.types";
import { SecurityCard } from "./components/SecurityCard/SecurityCard";
import { PreferencesCard } from "./components/PreferencesCard/PreferencesCard";
import { ProfileCard } from "./components/ProfileCard/ProfileCard";
import { SkillsDiscoveredCard } from "./components/SkillsDiscoveredCard/SkillsDiscoveredCard";
import { CareerExplorerCard } from "./components/CareerExplorerCard/CareerExplorerCard";
import { ModuleProgressCard } from "./components/ModuleProgressCard/ModuleProgressCard";
import CareerReadinessProgressBanner from "src/careerReadiness/components/CareerReadinessProgressBanner/CareerReadinessProgressBanner";
import type { ModuleSummary } from "src/careerReadiness/types";
import type { UserSectorEngagementItem } from "src/careerExplorer/services/CareerExplorerService";

const uniqueId = "a7f8e4b2-9c3d-4a1e-8f6b-2d3e4a5b6c7d";

export const DATA_TEST_ID = {
  PROFILE_CONTENT: `profile-content-${uniqueId}`,
};

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
  modules: ModuleSummary[];
  skillsInterestsProgress: number;
  careerExplorerSectors: UserSectorEngagementItem[];
  isLoadingSecurity: boolean;
  isLoadingPreferences: boolean;
  isLoadingProfile: boolean;
  isLoadingSkills: boolean;
  isLoadingCareerExplorer: boolean;
}

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
  skillsInterestsProgress,
  careerExplorerSectors,
  isLoadingSecurity,
  isLoadingPreferences,
  isLoadingProfile,
  isLoadingSkills,
  isLoadingCareerExplorer,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));

  return (
    <Box
      sx={{
        paddingX: theme.fixedSpacing(isMobile ? theme.tabiyaSpacing.md : theme.tabiyaSpacing.lg),
        paddingY: theme.fixedSpacing(theme.tabiyaSpacing.lg),
        maxWidth: 900,
        margin: "0 auto",
      }}
      data-testid={DATA_TEST_ID.PROFILE_CONTENT}
    >
      <Stack spacing={theme.fixedSpacing(theme.tabiyaSpacing.md)}>
        {/* Identity */}
        <ProfileCard
          name={name}
          location={location}
          school={school}
          program={program}
          year={year}
          isLoading={isLoadingProfile}
        />

        {/* Progress — two columns on md+ */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: theme.fixedSpacing(theme.tabiyaSpacing.md),
          }}
        >
          <ModuleProgressCard
            modules={[
              { id: "skills_discovery", labelKey: "home.modules.skillsDiscovery", progress: skillsInterestsProgress },
            ]}
          />
          <CareerReadinessProgressBanner modules={modules} />
        </Box>

        {/* Career Explorer sectors */}
        <CareerExplorerCard sectors={careerExplorerSectors} isLoading={isLoadingCareerExplorer} />

        {/* Skills discovered */}
        <SkillsDiscoveredCard skills={skills} isLoading={isLoadingSkills} />

        {/* Account info */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: theme.fixedSpacing(theme.tabiyaSpacing.md),
          }}
        >
          <SecurityCard email={email} isLoading={isLoadingSecurity} />
          <PreferencesCard language={language} acceptedTcDate={termsAcceptedDate} isLoading={isLoadingPreferences} />
        </Box>
      </Stack>
    </Box>
  );
};
