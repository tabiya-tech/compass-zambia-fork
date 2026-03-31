import { routerPaths } from "src/app/routerPaths";

export interface Module {
  id: string;
  labelKey: string;
  descriptionKey: string;
  route: string;
  disabled?: boolean;
  /**
   * The id of the next top-level module to suggest when this module completes.
   * Leave undefined if there is no automatic handoff.
   */
  nextModuleId?: string;
}

/**
 * The default set of modules that are always available on the Home page.
 */
const DEFAULT_MODULES: Module[] = [
  {
    id: "skills_discovery",
    labelKey: "home.modules.skillsDiscovery",
    descriptionKey: "home.modules.skillsDiscoveryDesc",
    route: routerPaths.SKILLS_INTERESTS,
    nextModuleId: "career_explorer",
  },
  {
    id: "career_explorer",
    labelKey: "home.modules.careerExplorer",
    descriptionKey: "home.modules.careerExplorerDesc",
    route: routerPaths.CAREER_EXPLORER,
  },
  {
    id: "job_readiness",
    labelKey: "home.modules.jobReadiness",
    descriptionKey: "home.modules.jobReadinessDesc",
    route: routerPaths.CAREER_READINESS,
    nextModuleId: "knowledge_hub",
  },
  {
    id: "knowledge_hub",
    labelKey: "home.modules.knowledgeHub",
    descriptionKey: "home.modules.knowledgeHubDesc",
    route: routerPaths.KNOWLEDGE_HUB,
  },
  {
    id: "job_matching",
    labelKey: "home.modules.jobMatching",
    descriptionKey: "home.modules.jobMatchingDesc",
    route: routerPaths.JOB_MATCHING,
  },
];

/**
 * Gets the list of enabled modules.
 * Returns the hardcoded default set of 5 modules.
 */
export const getEnabledModules = (): Module[] => {
  return DEFAULT_MODULES;
};
