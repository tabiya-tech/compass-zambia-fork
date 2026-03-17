import React, { startTransition } from "react";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import PageHeader from "src/home/components/PageHeader/PageHeader";
import { Profile } from "./Profile";
import { useUserProfile } from "./hooks/useUserProfile";
import { routerPaths } from "src/app/routerPaths";

const uniqueId = "b3c5d7e9-4f6a-8b2c-1d3e-5f7a9b1c3d5e";

export const DATA_TEST_ID = {
  PROFILE_CONTAINER: `profile-container-${uniqueId}`,
};

const ProfileContainer: React.FC = () => {
  const navigate = useNavigate();
  const { profileData, isLoadingSecurity, isLoadingPreferences, isLoadingProfile, isLoadingSkills } = useUserProfile();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: (theme) => theme.palette.background.default,
      }}
      data-testid={DATA_TEST_ID.PROFILE_CONTAINER}
    >
      <PageHeader
        title="home.profile.title"
        subtitle="home.profile.subtitle"
        backLinkLabel="home.backToDashboard"
        onBackClick={() => {
          startTransition(() => {
            navigate(routerPaths.ROOT);
          });
        }}
      />
      <Profile
        email={profileData.email}
        language={profileData.language}
        termsAcceptedDate={profileData.termsAcceptedDate}
        name={profileData.name}
        location={profileData.location}
        school={profileData.school}
        program={profileData.program}
        year={profileData.year}
        skills={profileData.skills}
        modules={profileData.modules}
        skillsInterestsProgress={profileData.skillsInterestsProgress}
        isLoadingSecurity={isLoadingSecurity}
        isLoadingPreferences={isLoadingPreferences}
        isLoadingProfile={isLoadingProfile}
        isLoadingSkills={isLoadingSkills}
      />
    </Box>
  );
};

export default ProfileContainer;
