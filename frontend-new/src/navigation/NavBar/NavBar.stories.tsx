import type { Meta, StoryObj } from "@storybook/react";
import NavBar from "src/navigation/NavBar/NavBar";
import authenticationStateService from "src/auth/services/AuthenticationState.service";

const meta: Meta<typeof NavBar> = {
  title: "Navigation/NavBar",
  component: NavBar,
  tags: ["autodocs"],
  decorators: [
    (Story) => {
      authenticationStateService.getInstance().getUser = () => ({
        id: "user-123",
        name: "Bupe Phiri",
        email: "bupe.phiri@example.com",
      });
      return <Story />;
    },
  ],
};

export default meta;

type Story = StoryObj<typeof NavBar>;

export const BrandAction: Story = {
  args: { headerColor: "brandAction" },
};

export const Primary: Story = {
  args: { headerColor: "primary" },
};

export const Secondary: Story = {
  args: { headerColor: "secondary" },
};
