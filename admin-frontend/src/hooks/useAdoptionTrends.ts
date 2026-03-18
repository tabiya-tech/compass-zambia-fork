import { useEffect, useState } from "react";
import AnalyticsService from "src/analytics/AnalyticsService";

export interface AdoptionTrendsResult {
  labels: string[];
  newRegistrations: number[];
  dailyActiveUsers: number[];
  loading: boolean;
  error: Error | null;
}

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00Z");
  return date.toLocaleDateString("en-GB", { month: "short", day: "numeric", timeZone: "UTC" });
}

function toISODate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function useAdoptionTrends(days = 7): AdoptionTrendsResult {
  const [labels, setLabels] = useState<string[]>([]);
  const [newRegistrations, setNewRegistrations] = useState<number[]>([]);
  const [dailyActiveUsers, setDailyActiveUsers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - (days - 1));

    AnalyticsService.getInstance()
      .getAdoptionTrends(toISODate(startDate), toISODate(endDate), "day")
      .then((data) => {
        if (isMounted) {
          setLabels(data.data.map((p) => formatDateLabel(p.date)));
          setNewRegistrations(data.data.map((p) => p.new_registrations));
          setDailyActiveUsers(data.data.map((p) => p.daily_active_users));
          setError(null);
        }
      })
      .catch((err) => {
        if (isMounted) setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [days]);

  return { labels, newRegistrations, dailyActiveUsers, loading, error };
}
