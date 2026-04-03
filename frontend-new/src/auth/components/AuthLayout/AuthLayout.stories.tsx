import type { Meta, StoryObj } from "@storybook/react";

import AuthLayout from "./AuthLayout";

const meta: Meta<typeof AuthLayout> = {
  title: "Auth/AuthLayout",
  component: AuthLayout,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof AuthLayout>;

export const Shown: Story = {
  args: {},
};
