import type { Meta, StoryObj } from "@storybook/react";
import SkillsDiscoverySidebar from "./SkillsDiscoverySidebar";
import SidebarService from "./SidebarService";

const meta: Meta<typeof SkillsDiscoverySidebar> = {
  title: "Home/Sidebar/SkillsDiscovery",
  component: SkillsDiscoverySidebar,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ height: "600px", display: "flex", justifyContent: "flex-end" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof SkillsDiscoverySidebar>;

export const Empty: Story = {
  decorators: [
    (Story) => {
      SidebarService.getInstance().getSkillsData = async () => ({ skills: [] });
      return <Story />;
    },
  ],
};

export const FewSkills: Story = {
  name: "Few skills",
  decorators: [
    (Story) => {
      SidebarService.getInstance().getSkillsData = async () => ({
        skills: ["Communication", "Problem Solving", "Teamwork"],
      });
      return <Story />;
    },
  ],
};

export const ManySkills: Story = {
  name: "Many skills (collapsed)",
  decorators: [
    (Story) => {
      SidebarService.getInstance().getSkillsData = async () => ({
        skills: [
          "Communication",
          "Problem Solving",
          "Teamwork",
          "Time Management",
          "Critical Thinking",
          "Leadership",
          "Adaptability",
          "Customer Service",
          "Data Analysis",
          "Project Management",
        ],
      });
      return <Story />;
    },
  ],
};
