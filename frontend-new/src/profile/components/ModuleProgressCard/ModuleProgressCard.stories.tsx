import type { Meta, StoryObj } from "@storybook/react";
import { ModuleProgressCard, ModuleData } from "./ModuleProgressCard";

const meta: Meta<typeof ModuleProgressCard> = {
  title: "Profile/Components/ModuleProgressCard",
  component: ModuleProgressCard,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof ModuleProgressCard>;

const mockModules: ModuleData[] = [
  {
    id: "skills_discovery",
    labelKey: "home.modules.skillsDiscovery",
    progress: 100,
  },
  {
    id: "career_discovery",
    labelKey: "home.modules.careerDiscovery",
    progress: 75,
  },
  {
    id: "job_readiness",
    labelKey: "home.modules.jobReadiness",
    progress: 50,
  },
  {
    id: "career_explorer",
    labelKey: "home.modules.careerExplorer",
    progress: 25,
  },
  {
    id: "knowledge_hub",
    labelKey: "home.modules.knowledgeHub",
    progress: 0,
  },
];

export const Default: Story = {
  args: {
    modules: mockModules,
  },
};

export const SingleModule: Story = {
  args: {
    modules: [mockModules[0]],
  },
};

export const AllCompleted: Story = {
  args: {
    modules: [
      {
        id: "skills_discovery",
        labelKey: "home.modules.skillsDiscovery",
        progress: 100,
      },
      {
        id: "career_discovery",
        labelKey: "home.modules.careerDiscovery",
        progress: 100,
      },
      {
        id: "job_readiness",
        labelKey: "home.modules.jobReadiness",
        progress: 100,
      },
    ],
  },
};

export const AllInProgress: Story = {
  args: {
    modules: [
      {
        id: "skills_discovery",
        labelKey: "home.modules.skillsDiscovery",
        progress: 45,
      },
      {
        id: "career_discovery",
        labelKey: "home.modules.careerDiscovery",
        progress: 60,
      },
      {
        id: "job_readiness",
        labelKey: "home.modules.jobReadiness",
        progress: 30,
      },
      {
        id: "career_explorer",
        labelKey: "home.modules.careerExplorer",
        progress: 15,
      },
    ],
  },
};

export const JustStarted: Story = {
  args: {
    modules: [
      {
        id: "skills_discovery",
        labelKey: "home.modules.skillsDiscovery",
        progress: 5,
      },
      {
        id: "career_discovery",
        labelKey: "home.modules.careerDiscovery",
        progress: 0,
      },
      {
        id: "job_readiness",
        labelKey: "home.modules.jobReadiness",
        progress: 0,
      },
    ],
  },
};

export const ManyModules: Story = {
  args: {
    modules: [
      {
        id: "skills_discovery",
        labelKey: "home.modules.skillsDiscovery",
        progress: 100,
      },
      {
        id: "career_discovery",
        labelKey: "home.modules.careerDiscovery",
        progress: 90,
      },
      {
        id: "job_readiness",
        labelKey: "home.modules.jobReadiness",
        progress: 80,
      },
      {
        id: "career_explorer",
        labelKey: "home.modules.careerExplorer",
        progress: 70,
      },
      {
        id: "knowledge_hub",
        labelKey: "home.modules.knowledgeHub",
        progress: 60,
      },
    ],
  },
};

export const LongModuleNames: Story = {
  args: {
    modules: [
      {
        id: "skills_discovery",
        labelKey: "home.modules.skillsDiscovery",
        progress: 85,
      },
      {
        id: "career_discovery",
        labelKey: "home.modules.careerDiscovery",
        progress: 65,
      },
      {
        id: "job_readiness",
        labelKey: "home.modules.jobReadiness",
        progress: 40,
      },
    ],
  },
};

export const NoModules: Story = {
  args: {
    modules: [],
  },
};
