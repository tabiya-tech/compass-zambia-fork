import type { Meta, StoryObj } from "@storybook/react";
import Login from "src/pages/Login/Login";

const meta: Meta<typeof Login> = {
  title: "Pages/Login",
  component: Login,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Login>;

export const Shown: Story = {};
