import type { Meta, StoryObj } from "@storybook/react";
import { PersistentStorageService } from "src/app/PersistentStorageService/PersistentStorageService";
import ChatHeader from "src/chat/ChatHeader/ChatHeader";
import authenticationStateService from "src/auth/services/AuthenticationState.service";

const meta: Meta<typeof ChatHeader> = {
  title: "Chat/ChatHeader",
  component: ChatHeader,
  tags: ["autodocs"],
  args: {
    conversationCompleted: false,
    progressPercentage: 0,
    timeUntilNotification: null,
    startNewConversation: { action: "startNewConversation" },
  },
  decorators: [
    (Story) => {
      authenticationStateService.getInstance().getUser = () => ({
        id: "123",
        name: "Foo Bar",
        email: "foo@bar.baz",
      });
      // Mock the methods to always show the feedback notification
      PersistentStorageService.hasSeenFeedbackNotification = () => false;
      PersistentStorageService.setSeenFeedbackNotification = () => {};
      return <Story />;
    },
  ],
};

export default meta;

type Story = StoryObj<typeof ChatHeader>;

export const Default: Story = {};

export const FeedbackReminderReady: Story = {
  args: {
    conversationCompleted: false,
    progressPercentage: 10,
    timeUntilNotification: 0,
  },
};
