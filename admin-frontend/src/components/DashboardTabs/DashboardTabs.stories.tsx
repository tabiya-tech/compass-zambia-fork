import type { Meta, StoryObj } from "@storybook/react";
import DashboardTabs, { DashboardTabValue } from "src/components/DashboardTabs/DashboardTabs";

const meta: Meta<typeof DashboardTabs> = {
  title: "Dashboard/Tabs",
  component: DashboardTabs,
  tags: ["autodocs"],
  args: {
    value: "institutions" as DashboardTabValue,
  },
};

export default meta;

type Story = StoryObj<typeof DashboardTabs>;

export const Shown: Story = {};
