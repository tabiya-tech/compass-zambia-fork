import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Box } from "@mui/material";
import CareerExplorerPage from "src/careerExplorer/pages/CareerExplorerPage/CareerExplorerPage";
import CareerExplorerService from "src/careerExplorer/services/CareerExplorerService";
import authenticationStateService from "src/auth/services/AuthenticationState.service";

const getTimestamp = (minutesAgo: number) => new Date(Date.now() - minutesAgo * 60 * 1000).toISOString();

const meta: Meta<typeof CareerExplorerPage> = {
  title: "CareerExplorer/CareerExplorerPage",
  component: CareerExplorerPage,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
        <Story />
      </Box>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof CareerExplorerPage>;

const mockResponse = {
  messages: [
    {
      message_id: "m1",
      message:
        "Welcome to the Career Explorer! Based on Zambia's development priorities, there are five key sectors where TEVET graduates are in high demand. Which sector interests you most?",
      sent_at: getTimestamp(0),
      sender: "AGENT" as const,
    },
  ],
  finished: false,
};

export const Default: Story = {
  decorators: [
    (Story) => {
      authenticationStateService.getInstance().getUser = () => ({
        id: "user-123",
        name: "foo",
        email: "foo@bar.baz",
      });
      const service = CareerExplorerService.getInstance() as ReturnType<typeof CareerExplorerService.getInstance> & {
        getOrCreateConversation: typeof CareerExplorerService.prototype.getOrCreateConversation;
        sendMessage: typeof CareerExplorerService.prototype.sendMessage;
      };
      (service as any).getOrCreateConversation = async () => mockResponse;
      (service as any).sendMessage = async (userInput: string) => ({
        ...mockResponse,
        messages: [
          ...mockResponse.messages,
          {
            message_id: "u1",
            message: userInput,
            sent_at: getTimestamp(0),
            sender: "USER" as const,
          },
          {
            message_id: "a1",
            message: "Thanks for your interest. Let me share more about that sector.",
            sent_at: getTimestamp(0),
            sender: "AGENT" as const,
          },
        ],
      });
      return <Story />;
    },
  ],
};
