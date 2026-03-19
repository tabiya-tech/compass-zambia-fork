import type { ModuleData } from "src/types";

export const mockModules: ModuleData[] = [
  {
    id: "skills-discovery",
    titleKey: "dashboard.modules.titles.skillsDiscovery",
    totalStudents: 1348,
    summary: [
      { labelKey: "dashboard.modules.started", value: 1094, total: 1348, pct: 81, showBar: true },
      { labelKey: "dashboard.modules.completed", value: 793, total: 1094, pct: 72, showBar: true },
    ],
    breakdownType: "funnel",
    breakdownTitleKey: "dashboard.modules.engagementFunnel",
    breakdownCaption: "dashboard.modules.funnelCaption",
    breakdownItems: [
      { labelKey: "dashboard.modules.sharingExperiences", value: 84, total: 301 },
      { labelKey: "dashboard.modules.identifyingSkills", value: 151, total: 301 },
      { labelKey: "dashboard.modules.collectingPreferences", value: 66, total: 301 },
    ],
  },
  {
    id: "career-readiness",
    titleKey: "dashboard.modules.titles.careerReadiness",
    totalStudents: 1348,
    summary: [
      { labelKey: "dashboard.modules.started", value: 861, total: 1348, pct: 64, showBar: true },
      {
        labelKey: "dashboard.modules.completedAll5",
        value: 296,
        total: 861,
        pct: 34,
        showBar: true,
      },
      {
        labelKey: "dashboard.modules.avgSubModulesCompleted",
        value: 3.1,
        total: 5,
        pct: 0,
        showBar: false,
      },
    ],
    breakdownType: "subModules",
    breakdownTitleKey: "dashboard.modules.subModuleBreakdown",
    breakdownItems: [
      { labelKey: "dashboard.modules.professionalIdentity", value: 740, total: 809 },
      { labelKey: "dashboard.modules.cvDevelopment", value: 611, total: 715 },
      { labelKey: "dashboard.modules.coverLetterMotivation", value: 482, total: 585 },
      { labelKey: "dashboard.modules.interviewPreparation", value: 431, total: 517 },
      { labelKey: "dashboard.modules.workplaceReadiness", value: 362, total: 413 },
    ],
  },
  {
    id: "career-explorer",
    titleKey: "dashboard.modules.titles.careerExplorer",
    totalStudents: 1348,
    summary: [
      { labelKey: "dashboard.modules.started", value: 658, total: 1348, pct: 49, showBar: true },
      {
        labelKey: "dashboard.modules.returned2Plus",
        value: 290,
        total: 658,
        pct: 44,
        showBar: true,
      },
    ],
    breakdownType: "topSectors",
    breakdownTitleKey: "dashboard.modules.topSectorsExplored",
    breakdownItems: [
      { labelKey: "dashboard.modules.sectors.ict", percentage: 19, color: "success.dark" },
      { labelKey: "dashboard.modules.sectors.mining", percentage: 16, color: "primary.dark" },
      { labelKey: "dashboard.modules.sectors.energy", percentage: 13, color: "primary.light" },
      { labelKey: "dashboard.modules.sectors.construction", percentage: 12, color: "success.main" },
      { labelKey: "dashboard.modules.sectors.agriculture", percentage: 11, color: "secondary.main" },
      { labelKey: "dashboard.modules.sectors.hospitality", percentage: 9, color: "warning.dark" },
      { labelKey: "dashboard.modules.sectors.manufacturing", percentage: 7, color: "info.main" },
      { labelKey: "dashboard.modules.sectors.water", percentage: 5, color: "info.dark" },
      { labelKey: "dashboard.modules.sectors.transport", percentage: 5, color: "grey.400" },
      { labelKey: "dashboard.modules.sectors.other", percentage: 3, color: "grey.200" },
    ],
  },
];
