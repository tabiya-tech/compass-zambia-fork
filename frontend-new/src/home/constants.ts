export const BADGE_STATUS = {
  CONTINUE: "continue",
  COMPLETED: "completed",
  SOON: "soon",
} as const;

export type BadgeStatus = (typeof BADGE_STATUS)[keyof typeof BADGE_STATUS] | null;
