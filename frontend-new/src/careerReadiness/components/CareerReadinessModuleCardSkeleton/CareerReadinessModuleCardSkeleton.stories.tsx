import type { Meta, StoryObj } from "@storybook/react";
import CareerReadinessModuleCardSkeleton from "src/careerReadiness/components/CareerReadinessModuleCardSkeleton/CareerReadinessModuleCardSkeleton";

const meta: Meta<typeof CareerReadinessModuleCardSkeleton> = {
  title: "CareerReadiness/CareerReadinessModuleCardSkeleton",
  component: CareerReadinessModuleCardSkeleton,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ width: 400, minHeight: 200 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof CareerReadinessModuleCardSkeleton>;

export const Default: Story = {};
