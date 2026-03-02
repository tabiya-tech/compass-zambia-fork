import type { Meta, StoryObj } from "@storybook/react";
import PageHeader from "src/home/components/PageHeader/PageHeader";
import authenticationStateService from "src/auth/services/AuthenticationState.service";

const meta: Meta<typeof PageHeader> = {
  title: "Home/PageHeader",
  component: PageHeader,
  tags: ["autodocs"],
  decorators: [
    (Story) => {
      // Mock authenticated user
      authenticationStateService.getInstance().getUser = () => ({
        id: "user-123",
        name: "Jane",
        email: "jane@example.com",
      });

      return <Story />;
    },
  ],
};

export default meta;

type Story = StoryObj<typeof PageHeader>;

export const Default: Story = {};
