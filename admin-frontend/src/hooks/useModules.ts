import type { ModuleData } from "src/types";
import { useCareerReadinessStats } from "src/hooks/useCareerReadinessStats";
import type { CareerReadinessFilters } from "src/hooks/useCareerReadinessStats";
import { useSkillsDiscoveryStats } from "src/hooks/useSkillsDiscoveryStats";

export interface UseModulesResult {
  modules: ModuleData[];
  loading: boolean;
  error: Error | null;
}

export function useModules(filters?: CareerReadinessFilters): UseModulesResult {
  const { data: crData, loading: crLoading, error: crError } = useCareerReadinessStats(filters);
  const { data: sdData, loading: sdLoading, error: sdError } = useSkillsDiscoveryStats(filters);

  const loading = crLoading || sdLoading;
  const error = crError || sdError;

  const modules: ModuleData[] = [];

  // Skills Discovery card
  if (sdData) {
    const totalStudents = sdData.total_registered_students;
    const started = sdData.started.count;
    const completed = sdData.completed.count;
    const inProgress = sdData.in_progress_count;

    modules.push({
      id: "skills-discovery",
      titleKey: "dashboard.modules.titles.skillsDiscovery",
      totalStudents,
      summary: [
        {
          labelKey: "dashboard.modules.started",
          value: started,
          total: totalStudents,
          pct: totalStudents > 0 ? Math.round((started / totalStudents) * 100) : 0,
          showBar: true,
        },
        {
          labelKey: "dashboard.modules.completed",
          value: completed,
          total: started,
          pct: started > 0 ? Math.round((completed / started) * 100) : 0,
          showBar: true,
        },
      ],
      breakdownType: "funnel",
      breakdownTitleKey: "dashboard.modules.engagementFunnel",
      breakdownCaption: `${inProgress} students in progress`,
      breakdownItems: sdData.funnel.map((stage) => ({
        labelKey: stage.label,
        value: stage.count,
        total: stage.total,
      })),
    });
  }

  // Career Readiness card
  if (crData) {
    const totalStudents = crData.total_registered_students;
    const started = crData.started.count;
    const completedAll = crData.completed_all_modules.count;
    const avgCompleted = crData.avg_modules_completed;
    const totalModules = crData.total_modules;

    modules.push({
      id: "career-readiness",
      titleKey: "dashboard.modules.titles.careerReadiness",
      totalStudents,
      summary: [
        {
          labelKey: "dashboard.modules.started",
          value: started,
          total: totalStudents,
          pct: totalStudents > 0 ? Math.round((started / totalStudents) * 100) : 0,
          showBar: true,
        },
        {
          labelKey: "dashboard.modules.completedAll5",
          value: completedAll,
          total: started,
          pct: started > 0 ? Math.round((completedAll / started) * 100) : 0,
          showBar: true,
        },
        {
          labelKey: "dashboard.modules.avgSubModulesCompleted",
          value: avgCompleted,
          total: totalModules,
          pct: 0,
          showBar: false,
        },
      ],
      breakdownType: "subModules",
      breakdownTitleKey: "dashboard.modules.subModuleBreakdown",
      breakdownItems: crData.module_breakdown.map((m) => ({
        labelKey: m.module_title,
        value: m.completed_count,
        total: m.started_count,
      })),
    });
  }

  return { modules, loading, error };
}
