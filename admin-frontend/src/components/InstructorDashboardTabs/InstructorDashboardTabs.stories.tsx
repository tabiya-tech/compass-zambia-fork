import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import InstructorDashboardTabs, {
  InstructorDashboardTabValue,
} from "src/components/InstructorDashboardTabs/InstructorDashboardTabs";

const InteractiveTabsStory: React.FC = () => {
  const [value, setValue] = useState<InstructorDashboardTabValue>("students");
  return <InstructorDashboardTabs value={value} onChange={setValue} />;
};

const meta: Meta<typeof InstructorDashboardTabs> = {
  title: "Instructor Dashboard/InstructorDashboardTabs",
  component: InstructorDashboardTabs,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof InstructorDashboardTabs>;

export const Shown: Story = {
  render: () => <InteractiveTabsStory />,
};
