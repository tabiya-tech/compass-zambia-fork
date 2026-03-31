export function lastLoginDisplayMatchesFilter(lastLoginDisplay: string, filter: string): boolean {
  const v = lastLoginDisplay.trim();
  if (filter === "all") return true;

  const dayMatch = v.match(/^(\d+)\s*days?\s*ago$/i);
  const daysAgo = dayMatch ? Number(dayMatch[1]) : null;

  if (filter === "today") {
    return v === "Today";
  }

  if (filter === "week") {
    if (v === "Today" || v === "Yesterday") return true;
    if (daysAgo !== null && daysAgo >= 2 && daysAgo <= 7) return true;
    return false;
  }

  if (filter === "older") {
    if (v === "Never") return true;
    if (v === "Today" || v === "Yesterday") return false;
    if (daysAgo !== null) return daysAgo >= 8;
    return v.length > 0;
  }

  return true;
}
