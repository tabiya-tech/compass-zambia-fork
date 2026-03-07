import type { Experience, Skill } from "src/experiences/experienceService/experiences.types";

/**
 * Aggregates skills from multiple experiences and deduplicates by UUID
 * @param experiences - Array of experiences from all sessions
 * @returns Array of unique skills
 */
export const aggregateSkills = (experiences: Experience[]): Skill[] => {
  const skillsMap = new Map<string, Skill>();

  experiences.forEach((experience) => {
    // Add top_skills
    experience.top_skills.forEach((skill) => {
      if (!skillsMap.has(skill.UUID)) {
        skillsMap.set(skill.UUID, skill);
      }
    });

    // Add remaining_skills
    experience.remaining_skills.forEach((skill) => {
      if (!skillsMap.has(skill.UUID)) {
        skillsMap.set(skill.UUID, skill);
      }
    });
  });

  return Array.from(skillsMap.values());
};
