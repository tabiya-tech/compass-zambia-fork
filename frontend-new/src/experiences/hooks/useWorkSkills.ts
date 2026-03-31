import { useMemo } from "react";
import { useExperiencesDrawer } from "src/experiences/ExperiencesDrawerProvider";
import { DiveInPhase } from "src/experiences/experienceService/experiences.types";

/**
 * Returns a deduplicated list of skill labels from all processed experiences.
 * Used to populate the "Skills From Work" sidebar section.
 */
export const useWorkSkills = (): string[] => {
  const { experiences } = useExperiencesDrawer();

  return useMemo(() => {
    const seen = new Set<string>();
    const skills: string[] = [];

    for (const exp of experiences) {
      if (exp.exploration_phase !== DiveInPhase.PROCESSED) continue;
      for (const skill of exp.top_skills ?? []) {
        if (!seen.has(skill.preferredLabel)) {
          seen.add(skill.preferredLabel);
          skills.push(skill.preferredLabel);
        }
      }
    }

    return skills;
  }, [experiences]);
};
