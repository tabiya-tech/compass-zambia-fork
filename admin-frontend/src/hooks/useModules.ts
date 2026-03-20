import type { ModuleData } from "src/types";
import { useCareerReadinessStats } from "src/hooks/useCareerReadinessStats";
import type { CareerReadinessFilters } from "src/hooks/useCareerReadinessStats";

export interface UseModulesResult {
  modules: ModuleData[];
  loading: boolean;
  error: Error | null;
}

export function useModules(filters?: CareerReadinessFilters): UseModulesResult {
  const { data, loading, error } = useCareerReadinessStats(filters);

  if (!data) {
    return { modules: [], loading, error };
  }

  const totalStudents = data.total_registered_students;
  const started = data.started.count;
  const completedAll = data.completed_all_modules.count;
  const avgCompleted = data.avg_modules_completed;
  const totalModules = data.total_modules;

  const careerReadiness: ModuleData = {
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
    breakdownItems: data.module_breakdown.map((m) => ({
      labelKey: m.module_title, // module titles come from the backend registry, used directly
      value: m.completed_count,
      total: m.started_count,
    })),
  };

  return { modules: [careerReadiness], loading, error };
}
