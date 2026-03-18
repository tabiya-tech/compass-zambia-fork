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
