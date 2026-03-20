export interface DashboardStats {
  institutions_active: number;
  total_students: number;
  active_students_7_days: number;
}

export interface InstitutionApiItem {
  id: string;
  name: string;
  active: boolean;
  students: number | null;
  active_7_days: number | null;
  skills_discovery_started_pct: number | null;
  skills_discovery_completed_pct: number | null;
  career_readiness_started_pct: number | null;
  career_readiness_completed_pct: number | null;
  career_explorer_started_pct: number | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    limit: number;
    next_cursor: string | null;
    has_more: boolean;
    total: number | null;
  };
}

export interface AdoptionTrendPoint {
  date: string;
  new_registrations: number;
  daily_active_users: number;
}

export interface AdoptionTrendsResponse {
  data: AdoptionTrendPoint[];
  meta: {
    start_date: string;
    end_date: string;
    interval: string;
  };
}

export interface SkillGapEntry {
  skill_id: string;
  skill_label: string;
  students_with_gap_count: number;
  avg_job_unlock_count: number;
  avg_proximity_score: number;
}

export interface SkillGapStatsResponse {
  total_students_with_skill_gaps: number;
  top_skill_gaps: SkillGapEntry[];
}

export interface CareerReadinessModuleBreakdown {
  module_id: string;
  module_title: string;
  started_count: number;
  completed_count: number;
}

export interface CareerReadinessStatsResponse {
  total_registered_students: number;
  started: { count: number; percentage: number };
  completed_all_modules: { count: number; percentage_of_started: number };
  avg_modules_completed: number;
  total_modules: number;
  module_breakdown: CareerReadinessModuleBreakdown[];
}
