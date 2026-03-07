import { useEffect, useState } from "react";
import { fetchSkills } from "./utils/fetchSkills";
import { getEnabledModules } from "src/home/modulesService";
import { fetchPersonalData } from "./utils/fetchPersonalData";
import { Skill } from "src/experiences/experienceService/experiences.types";
import UserPreferencesStateService from "src/userPreferences/UserPreferencesStateService";
import authenticationStateService from "src/auth/services/AuthenticationState.service";

export interface ModuleProgress {
  id: string;
  labelKey: string;
  progress: number;
}

export interface UserProfileData {
  name: string | null;
  email: string | null;
  termsAcceptedDate: Date | null;
  language: string | null;
  location: string | null;
  school: string | null;
  program: string | null;
  year: string | null;
  skills: Skill[];
  modules: ModuleProgress[];
}

export interface UseUserProfileResult {
  profileData: UserProfileData;
  isLoading: boolean;
  isLoadingSecurity: boolean;
  isLoadingPreferences: boolean;
  isLoadingProfile: boolean;
  isLoadingSkills: boolean;
  errors: {
    security: Error | null;
    preferences: Error | null;
    profile: Error | null;
    skills: Error | null;
  };
}

/**
 * Hook to fetch and manage user profile data
 * Combines user authentication data with user preferences, personal data, and skills
 * Each component has its own independent state, loading, and error handling
 */
export const useUserProfile = (): UseUserProfileResult => {
  // Individual loading states for each component
  const [isLoadingSecurity, setIsLoadingSecurity] = useState(true);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingSkills, setIsLoadingSkills] = useState(true);

  // Individual data states for each component
  const [securityData, setSecurityData] = useState<{ email: string | null }>({ email: null });
  const [preferencesData, setPreferencesData] = useState<{ termsAcceptedDate: Date | null; language: string | null }>({
    termsAcceptedDate: null,
    language: null,
  });
  const [personalData, setPersonalData] = useState<{
    name: string | null;
    location: string | null;
    school: string | null;
    program: string | null;
    year: string | null;
  }>({
    name: null,
    location: null,
    school: null,
    program: null,
    year: null,
  });
  const [skills, setSkills] = useState<Skill[]>([]);
  const [modules, setModules] = useState<ModuleProgress[]>([]);

  // Individual error states for each component
  const [errors, setErrors] = useState<{
    security: Error | null;
    preferences: Error | null;
    profile: Error | null;
    skills: Error | null;
  }>({
    security: null,
    preferences: null,
    profile: null,
    skills: null,
  });

  // Effect 1: Fetch security data (email from authenticated user)
  useEffect(() => {
    const fetchSecurityData = async () => {
      try {
        setIsLoadingSecurity(true);
        setErrors((prev) => ({ ...prev, security: null }));

        const authenticatedUser = authenticationStateService.getInstance().getUser();
        if (!authenticatedUser) {
          throw new Error("User not found");
        }

        setSecurityData({ email: authenticatedUser.email });
      } catch (error) {
        console.error("Error fetching security data:", error);
        setErrors((prev) => ({ ...prev, security: error as Error }));
      } finally {
        setIsLoadingSecurity(false);
      }
    };

    fetchSecurityData();
  }, []);

  // Effect 2: Fetch user preferences (terms accepted date, language)
  useEffect(() => {
    const fetchPreferencesData = async () => {
      try {
        setIsLoadingPreferences(true);
        setErrors((prev) => ({ ...prev, preferences: null }));

        const userPreferences = UserPreferencesStateService.getInstance().getUserPreferences();
        if (!userPreferences) {
          throw new Error("User preferences not found");
        }

        setPreferencesData({
          termsAcceptedDate: userPreferences.accepted_tc || null,
          language: userPreferences.language || null,
        });
      } catch (error) {
        console.error("Error fetching preferences data:", error);
        setErrors((prev) => ({ ...prev, preferences: error as Error }));
      } finally {
        setIsLoadingPreferences(false);
      }
    };

    fetchPreferencesData();
  }, []);

  // Effect 3: Fetch personal profile data (name, location, school, program, year)
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoadingProfile(true);
        setErrors((prev) => ({ ...prev, profile: null }));

        const user = authenticationStateService.getInstance().getUser();
        const userId = user?.id;

        if (!userId) {
          throw new Error("User ID not found");
        }

        const data = await fetchPersonalData(userId);
        setPersonalData(data);
      } catch (error: any) {
        // Handle 404 gracefully - user may not have personal data yet
        if (error?.statusCode === 404) {
          console.log("Personal data not found (404) - user may not have set up profile yet");
          setErrors((prev) => ({ ...prev, profile: null }));
        } else {
          console.error("Error fetching profile data:", error);
          setErrors((prev) => ({ ...prev, profile: error as Error }));
        }
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfileData();
  }, []);

  // Effect 4: Fetch skills from experiences
  useEffect(() => {
    const fetchSkillsData = async () => {
      try {
        setIsLoadingSkills(true);
        setErrors((prev) => ({ ...prev, skills: null }));

        const skillsData = await fetchSkills();
        setSkills(skillsData);
      } catch (error) {
        console.error("Error fetching skills:", error);
        setErrors((prev) => ({ ...prev, skills: error as Error }));
      } finally {
        setIsLoadingSkills(false);
      }
    };

    fetchSkillsData();
  }, []);

  // Effect 5: Fetch modules (synchronous, no API call)
  useEffect(() => {
    try {
      const enabledModules = getEnabledModules();
      const modulesWithProgress: ModuleProgress[] = enabledModules.map((module) => ({
        id: module.id,
        labelKey: module.labelKey,
        progress: Math.floor(Math.random() * 70) + 30,
      }));
      setModules(modulesWithProgress);
    } catch (error) {
      console.error("Error fetching modules:", error);
    }
  }, []);

  // Combine all data into a single profile object
  const profileData: UserProfileData = {
    email: securityData.email,
    termsAcceptedDate: preferencesData.termsAcceptedDate,
    language: preferencesData.language,
    name: personalData.name,
    location: personalData.location,
    school: personalData.school,
    program: personalData.program,
    year: personalData.year,
    skills,
    modules,
  };

  const isLoading = isLoadingSecurity || isLoadingPreferences || isLoadingProfile || isLoadingSkills;

  return {
    profileData,
    isLoading,
    isLoadingSecurity,
    isLoadingPreferences,
    isLoadingProfile,
    isLoadingSkills,
    errors,
  };
};
