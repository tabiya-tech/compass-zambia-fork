import type { Meta, StoryObj } from "@storybook/react";
import ModuleCard from "src/components/ModuleCard/ModuleCard";
import type { ModuleData } from "src/types";

const meta: Meta<typeof ModuleCard> = {
  title: "Dashboard/ModuleCard",
  component: ModuleCard,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof ModuleCard>;

const storyModuleCardFixture: ModuleData = {
  id: "skills-discovery",
  titleKey: "dashboard.modules.titles.skillsDiscovery",
  totalStudents: 342,
  summary: [
    {
      labelKey: "dashboard.modules.started",
      value: 301,
      total: 342,
      pct: 88,
      showBar: true,
    },
    {
      labelKey: "dashboard.modules.completed",
      value: 214,
      total: 301,
      pct: 71,
      showBar: true,
    },
  ],
  breakdownType: "funnel",
  breakdownTitleKey: "dashboard.modules.engagementFunnel",
  breakdownCaption: "301 students in progress",
  breakdownItems: [
    { labelKey: "dashboard.modules.sharingExperiences", value: 301, total: 342 },
    { labelKey: "dashboard.modules.identifyingSkills", value: 252, total: 301 },
    { labelKey: "dashboard.modules.collectingPreferences", value: 214, total: 252 },
  ],
};

export const Shown: Story = {
  args: {
    module: storyModuleCardFixture,
  },
};
