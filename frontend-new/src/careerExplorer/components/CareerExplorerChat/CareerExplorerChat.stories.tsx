import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Box } from "@mui/material";
import CareerExplorerChat from "src/careerExplorer/components/CareerExplorerChat/CareerExplorerChat";
import type { CareerExplorerMessage } from "src/careerExplorer/types";

const getTimestamp = (minutesAgo: number) => new Date(Date.now() - minutesAgo * 60 * 1000).toISOString();

const mockMessages: CareerExplorerMessage[] = [
  {
    message_id: "m1",
    message:
      "Welcome to the Career Explorer! Based on Zambia's development priorities, there are five key sectors where TEVET graduates are in high demand. Which sector interests you most?",
    sent_at: getTimestamp(5),
    sender: "AGENT",
  },
  {
    message_id: "m2",
    message: "I'm interested in Agriculture.",
    sent_at: getTimestamp(4),
    sender: "USER",
  },
  {
    message_id: "m3",
    message:
      "Great choice. In Agriculture, commercial farming and agriprocessing offer strong opportunities for TEVET graduates in Zambia.",
    sent_at: getTimestamp(3),
    sender: "AGENT",
  },
];

const meta: Meta<typeof CareerExplorerChat> = {
  title: "CareerExplorer/CareerExplorerChat",
  component: CareerExplorerChat,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
        <Story />
      </Box>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof CareerExplorerChat>;

export const WithConversation: Story = {
  args: {
    initialMessages: mockMessages,
    placeholderKey: "careerExplorer.placeholder",
  },
};

export const WelcomeOnly: Story = {
  args: {
    initialMessages: [
      {
        message_id: "w1",
        message:
          "Welcome to the Career Explorer! Based on Zambia's development priorities, there are five key sectors where TEVET graduates are in high demand. Which sector interests you most?",
        sent_at: getTimestamp(0),
        sender: "AGENT",
      },
    ],
    placeholderKey: "careerExplorer.placeholder",
  },
};
