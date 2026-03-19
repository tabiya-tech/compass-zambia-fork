import type { Meta, StoryObj } from "@storybook/react";
import QuickReplyButtons from "./QuickReplyButtons";

const meta: Meta<typeof QuickReplyButtons> = {
  title: "Chat/ChatMessage/QuickReplyButtons",
  component: QuickReplyButtons,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof QuickReplyButtons>;

export const Default: Story = {
  args: {
    options: [{ label: "Yes" }, { label: "No" }, { label: "Tell me more" }],
    onSelect: (label: string) => console.log("Selected:", label),
  },
};

export const SingleOption: Story = {
  args: {
    options: [{ label: "Continue" }],
    onSelect: (label: string) => console.log("Selected:", label),
  },
};

export const ManyOptions: Story = {
  args: {
    options: [
      { label: "Technical skills" },
      { label: "Soft skills" },
      { label: "Leadership" },
      { label: "Communication" },
      { label: "Problem solving" },
    ],
    onSelect: (label: string) => console.log("Selected:", label),
  },
};
