import type { Meta, StoryObj } from "@storybook/react";
import ProgressBar from "src/home/components/ProgressBar/ProgressBar";

const meta: Meta<typeof ProgressBar> = {
  title: "Home/ProgressBar",
  component: ProgressBar,
  tags: ["autodocs"],
  argTypes: {
    progress: {
      control: { type: "range", min: 0, max: 100, step: 1 },
      description: "The profile strength progress percentage (0–100)",
    },
  },
};

export default meta;

type Story = StoryObj<typeof ProgressBar>;

export const Empty: Story = {
  args: {
    progress: 0,
  },
};

export const LowProgress: Story = {
  args: {
    progress: 15,
  },
};

export const MidProgress: Story = {
  args: {
    progress: 50,
  },
};

export const HighProgress: Story = {
  args: {
    progress: 85,
  },
};

export const Complete: Story = {
  args: {
    progress: 100,
  },
};
