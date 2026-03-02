import type { Meta, StoryObj } from "@storybook/react";
import Home from "src/home/Home";
import authenticationStateService from "src/auth/services/AuthenticationState.service";
import UserPreferencesStateService from "src/userPreferences/UserPreferencesStateService";

const meta: Meta<typeof Home> = {
  title: "Home/HomePage",
  component: Home,
  tags: ["autodocs"],
  decorators: [
    (Story) => {
      // Mock authenticated user
      authenticationStateService.getInstance().getUser = () => ({
        id: "user-123",
        name: "Jane",
        email: "jane@example.com",
      });

      // Mock user preferences with sessions
      const prefsService = UserPreferencesStateService.getInstance();
      prefsService.clearUserPreferences();

      return <Story />;
    },
  ],
};

export default meta;

type Story = StoryObj<typeof Home>;

export const Default: Story = {};
