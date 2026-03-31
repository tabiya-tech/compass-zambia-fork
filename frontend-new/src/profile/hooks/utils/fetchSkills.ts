import UserPreferencesStateService from "../../../userPreferences/UserPreferencesStateService";
import { UserPreference } from "../../../userPreferences/UserPreferencesService/userPreferences.types";
import { aggregateSkills } from "./aggregateSkills";
import ExperienceService from "../../../experiences/experienceService/experienceService";
import { WorkType } from "../../../experiences/experienceService/experiences.types";
import type { Skill } from "../../../experiences/experienceService/experiences.types";

export interface FetchSkillsResult {
  workSkills: Skill[];
  educationSkills: Skill[];
}

export async function fetchSkills(): Promise<FetchSkillsResult> {
  const userPreferences: UserPreference | null = UserPreferencesStateService.getInstance().getUserPreferences();
  const sessions = userPreferences?.sessions || [];

  if (sessions.length === 0) {
    return { workSkills: [], educationSkills: [] };
  }

  // Fetch experiences for all sessions in parallel
  const experiencesArrays = await Promise.all(
    sessions.map(async (sessionId) => {
      try {
        return await ExperienceService.getInstance().getExperiences(sessionId);
      } catch (error) {
        console.error(`Failed to fetch experiences for session ${sessionId}:`, error);
        return [];
      }
    })
  );

  // Flatten all experiences into a single array
  const allExperiences = experiencesArrays.flat();

  const educationExperiences = allExperiences.filter(
    (exp) => exp.work_type === WorkType.FORMAL_SECTOR_UNPAID_TRAINEE_WORK
  );
  const otherExperiences = allExperiences.filter((exp) => exp.work_type !== WorkType.FORMAL_SECTOR_UNPAID_TRAINEE_WORK);

  return {
    workSkills: aggregateSkills(otherExperiences),
    educationSkills: aggregateSkills(educationExperiences),
  };
}
