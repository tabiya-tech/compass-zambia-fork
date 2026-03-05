import type { Meta, StoryObj } from "@storybook/react";
import CareerReadinessAgentMessage from "src/careerReadiness/components/CareerReadinessAgentMessage/CareerReadinessAgentMessage";

const meta: Meta<typeof CareerReadinessAgentMessage> = {
  title: "CareerReadiness/CareerReadinessAgentMessage",
  component: CareerReadinessAgentMessage,
  tags: ["autodocs"],
  argTypes: {
    message: { control: "text" },
    sent_at: { control: "text" },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 560, padding: 16 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof CareerReadinessAgentMessage>;

const now = new Date().toISOString();

export const Default: Story = {
  args: {
    message_id: "msg-1",
    message:
      "This module helps you understand what professional identity means and how to articulate your skills to employers.",
    sent_at: now,
  },
};

export const ShortMessage: Story = {
  args: {
    message_id: "msg-2",
    message: "Yes, that's a good place to start.",
    sent_at: now,
  },
};

export const LongMessage: Story = {
  args: {
    message_id: "msg-3",
    message: `Your professional identity is how you present yourself in a work context. It includes your skills, values, and how you communicate your value to employers.

There are three main types of skills to consider:
- **Technical skills** – job-specific abilities
- **Transferable skills** – useful across roles  
- **Personal attributes** – how you work and communicate

Think about examples from your experience for each category.`,
    sent_at: now,
  },
};
