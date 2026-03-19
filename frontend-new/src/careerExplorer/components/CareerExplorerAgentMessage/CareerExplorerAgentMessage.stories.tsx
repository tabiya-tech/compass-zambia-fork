import type { Meta, StoryObj } from "@storybook/react";
import CareerExplorerAgentMessage from "src/careerExplorer/components/CareerExplorerAgentMessage/CareerExplorerAgentMessage";

const meta: Meta<typeof CareerExplorerAgentMessage> = {
  title: "CareerExplorer/CareerExplorerAgentMessage",
  component: CareerExplorerAgentMessage,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof CareerExplorerAgentMessage>;

export const Default: Story = {
  args: {
    message_id: "msg-1",
    message:
      "Welcome to the Career Explorer! Based on Zambia's development priorities, there are five key sectors where TEVET graduates are in high demand.",
    sent_at: new Date().toISOString(),
  },
};

export const WithQuickReplyButtons: Story = {
  args: {
    message_id: "msg-2",
    message: "Which sector would you like to explore first?",
    sent_at: new Date().toISOString(),
    quick_reply_options: [
      { label: "Agriculture" },
      { label: "Mining" },
      { label: "Construction" },
      { label: "Manufacturing" },
    ],
    onQuickReplyClick: (label: string) => console.log("Quick reply:", label),
  },
};
