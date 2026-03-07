import type { Meta, StoryObj } from "@storybook/react";
import { SkillsDiscoveredCard } from "./SkillsDiscoveredCard";
import { Skill } from "src/experiences/experienceService/experiences.types";

const meta: Meta<typeof SkillsDiscoveredCard> = {
  title: "Profile/Components/SkillsDiscoveredCard",
  component: SkillsDiscoveredCard,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof SkillsDiscoveredCard>;

const mockSkills: Skill[] = [
  {
    UUID: "skill-1",
    preferredLabel: "JavaScript",
    altLabels: [],
    description: "Programming language",
    orderIndex: 0,
  },
  {
    UUID: "skill-2",
    preferredLabel: "React",
    altLabels: [],
    description: "Frontend framework",
    orderIndex: 1,
  },
  {
    UUID: "skill-3",
    preferredLabel: "Communication",
    altLabels: [],
    description: "Soft skill",
    orderIndex: 2,
  },
  {
    UUID: "skill-4",
    preferredLabel: "Problem Solving",
    altLabels: [],
    description: "Analytical skill",
    orderIndex: 3,
  },
];

export const Default: Story = {
  args: {
    skills: mockSkills,
    isLoading: false,
  },
};

export const Loading: Story = {
  args: {
    skills: [],
    isLoading: true,
  },
};

export const NoSkills: Story = {
  args: {
    skills: [],
    isLoading: false,
  },
};

export const SingleSkill: Story = {
  args: {
    skills: [mockSkills[0]],
    isLoading: false,
  },
};

export const ManySkills: Story = {
  args: {
    skills: [
      ...mockSkills,
      {
        UUID: "skill-5",
        preferredLabel: "TypeScript",
        altLabels: [],
        description: "Programming language",
        orderIndex: 4,
      },
      {
        UUID: "skill-6",
        preferredLabel: "Node.js",
        altLabels: [],
        description: "Backend runtime",
        orderIndex: 5,
      },
      {
        UUID: "skill-7",
        preferredLabel: "Leadership",
        altLabels: [],
        description: "Management skill",
        orderIndex: 6,
      },
      {
        UUID: "skill-8",
        preferredLabel: "Team Collaboration",
        altLabels: [],
        description: "Teamwork skill",
        orderIndex: 7,
      },
      {
        UUID: "skill-9",
        preferredLabel: "Data Analysis",
        altLabels: [],
        description: "Analytical skill",
        orderIndex: 8,
      },
      {
        UUID: "skill-10",
        preferredLabel: "Project Management",
        altLabels: [],
        description: "Management skill",
        orderIndex: 9,
      },
    ],
    isLoading: false,
  },
};

export const LongSkillNames: Story = {
  args: {
    skills: [
      {
        UUID: "skill-long-1",
        preferredLabel: "Advanced Machine Learning and Artificial Intelligence",
        altLabels: [],
        description: "Technical skill",
        orderIndex: 0,
      },
      {
        UUID: "skill-long-2",
        preferredLabel: "Cross-Functional Team Leadership and Management",
        altLabels: [],
        description: "Management skill",
        orderIndex: 1,
      },
      {
        UUID: "skill-long-3",
        preferredLabel: "Strategic Business Development and Planning",
        altLabels: [],
        description: "Business skill",
        orderIndex: 2,
      },
    ],
    isLoading: false,
  },
};
