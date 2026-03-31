import type { Meta, StoryObj } from "@storybook/react";
import CareerReadinessSidebar from "./CareerReadinessSidebar";
import SidebarService from "./SidebarService";

const meta: Meta<typeof CareerReadinessSidebar> = {
  title: "Home/Sidebar/CareerReadiness",
  component: CareerReadinessSidebar,
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

type Story = StoryObj<typeof CareerReadinessSidebar>;

export const NoProgress: Story = {
  name: "No progress",
  decorators: [
    (Story) => {
      SidebarService.getInstance().getObjectivesData = async () => ({
        objectives: [
          { label: "Describe yourself with 3 key strengths", status: "pending" },
          { label: "Back each strength with a real example", status: "pending" },
          { label: "Write a 2-sentence professional intro", status: "pending" },
        ],
      });
      return <Story />;
    },
  ],
};

export const InProgress: Story = {
  name: "In progress",
  decorators: [
    (Story) => {
      SidebarService.getInstance().getObjectivesData = async () => ({
        objectives: [
          { label: "Describe yourself with 3 key strengths", status: "done" },
          { label: "Back each strength with a real example", status: "active" },
          { label: "Write a 2-sentence professional intro", status: "pending" },
        ],
      });
      return <Story />;
    },
  ],
};

export const Complete: Story = {
  decorators: [
    (Story) => {
      SidebarService.getInstance().getObjectivesData = async () => ({
        objectives: [
          { label: "Describe yourself with 3 key strengths", status: "done" },
          { label: "Back each strength with a real example", status: "done" },
          { label: "Write a 2-sentence professional intro", status: "done" },
        ],
      });
      return <Story />;
    },
  ],
};
