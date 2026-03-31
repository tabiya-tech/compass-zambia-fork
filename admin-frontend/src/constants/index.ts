export const PLACEHOLDER_SYMBOL = "—";

export const isPlaceholderValue = (value: string | number | null | undefined): boolean => value === PLACEHOLDER_SYMBOL;

export const CAREER_MODULE_LABELS = {
  "professional-identity": "Professional Identity",
  "cv-development": "CV Development",
  "interview-preparation": "Interview Preparation",
  "workplace-readiness": "Workplace Readiness",
  "skills-discovery": "Skills Discovery",
  "career-explorer": "Career Explorer",
} as const;

export type CareerModuleId = keyof typeof CAREER_MODULE_LABELS;

export const getModuleLabel = (moduleId: string | null | undefined): string =>
  moduleId && moduleId in CAREER_MODULE_LABELS ? CAREER_MODULE_LABELS[moduleId as CareerModuleId] : PLACEHOLDER_SYMBOL;
