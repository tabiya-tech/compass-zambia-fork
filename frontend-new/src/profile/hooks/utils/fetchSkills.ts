import UserPreferencesStateService from "../../../userPreferences/UserPreferencesStateService";
import { UserPreference } from "../../../userPreferences/UserPreferencesService/userPreferences.types";
import { aggregateSkills } from "./aggregateSkills";
import ExperienceService from "../../../experiences/experienceService/experienceService";

export async function fetchSkills() {
  const userPreferences: UserPreference | null = UserPreferencesStateService.getInstance().getUserPreferences();
  const sessions = userPreferences?.sessions || [];

  if (sessions.length === 0) {
    return [];
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

  // Aggregate and deduplicate skills
  return aggregateSkills(allExperiences);
}
