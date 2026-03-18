export interface DashboardStatItem {
  id?: string;
  titleKey: string;
  value: string | number;
  subtitleKey?: string;
}

export interface InstitutionRow {
  id: string;
  institution: string;
  province: string;
  students: number | null;
  active7Days: number | null;
  skillsDiscoveryStartedPct: number | null;
  skillsDiscoveryCompletedPct: number | null;
  careerReadinessStartedPct: number | null;
  careerReadinessCompletedPct: number | null;
  careerExplorerStartedPct: number | null;
}
