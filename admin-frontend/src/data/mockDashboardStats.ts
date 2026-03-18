import type { DashboardStatItem } from "src/types";

export const mockDashboardStats: DashboardStatItem[] = [
  {
    id: "institutionsActive",
    titleKey: "dashboard.stats.institutionsActive",
    value: 8,
    subtitleKey: "dashboard.stats.institutionsActiveSubtitle",
  },
  {
    id: "totalStudentsRegistered",
    titleKey: "dashboard.stats.totalStudentsRegistered",
    value: 1348,
  },
  {
    id: "activeStudents7Days",
    titleKey: "dashboard.stats.activeStudents7Days",
    value: 921,
    subtitleKey: "dashboard.stats.activeStudents7DaysSubtitle",
  },
];
