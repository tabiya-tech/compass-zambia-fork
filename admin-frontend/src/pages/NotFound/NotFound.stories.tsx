import type { Meta, StoryObj } from "@storybook/react";
import NotFound from "src/pages/NotFound/NotFound";

const meta: Meta<typeof NotFound> = {
  title: "Pages/NotFound",
  component: NotFound,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof NotFound>;

export const Shown: Story = {};
