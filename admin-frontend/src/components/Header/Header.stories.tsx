import type { Meta, StoryObj } from "@storybook/react";
import Header from "src/components/Header/Header";

const meta: Meta<typeof Header> = {
  title: "Dashboard/Header",
  component: Header,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Header>;

export const Shown: Story = {};
