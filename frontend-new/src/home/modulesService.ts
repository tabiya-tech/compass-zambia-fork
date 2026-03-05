import { routerPaths } from "src/app/routerPaths";

export interface Module {
  id: string;
  labelKey: string;
  descriptionKey: string;
  route: string;
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
  },
  {
    id: "career_discovery",
    labelKey: "home.modules.careerDiscovery",
    descriptionKey: "home.modules.careerDiscoveryDesc",
    route: routerPaths.SKILLS_INTERESTS,
  },
  {
    id: "job_readiness",
    labelKey: "home.modules.jobReadiness",
    descriptionKey: "home.modules.jobReadinessDesc",
    route: routerPaths.SKILLS_INTERESTS,
  },
  {
    id: "career_explorer",
    labelKey: "home.modules.careerExplorer",
    descriptionKey: "home.modules.careerExplorerDesc",
    route: routerPaths.CAREER_EXPLORER,
  },
  {
    id: "knowledge_hub",
    labelKey: "home.modules.knowledgeHub",
    descriptionKey: "home.modules.knowledgeHubDesc",
    route: routerPaths.KNOWLEDGE_HUB,
  },
];

/**
 * Gets the list of enabled modules.
 * Returns the hardcoded default set of 5 modules.
 */
export const getEnabledModules = (): Module[] => {
  return DEFAULT_MODULES;
};
