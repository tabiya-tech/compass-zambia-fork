import type { Meta, StoryObj } from "@storybook/react";
import DailyAdoptionTrendChart from "src/components/DailyAdoptionTrendChart/DailyAdoptionTrendChart";

const meta: Meta<typeof DailyAdoptionTrendChart> = {
  title: "Dashboard/Institutions/DailyAdoptionTrendChart",
  component: DailyAdoptionTrendChart,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof DailyAdoptionTrendChart>;

export const Shown: Story = {
  args: {
    labels: ["Mar 15", "Mar 16", "Mar 18", "Mar 20"],
    newRegistrations: [22, 18, 30, 25, 19, 28, 24],
    dailyActiveUsers: [120, 128, 134, 140, 136, 145, 150],
    loading: false,
  },
};
