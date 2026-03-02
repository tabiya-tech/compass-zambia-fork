import type { Meta, StoryObj } from "@storybook/react";
import Footer from "src/home/components/Footer/Footer";

const meta: Meta<typeof Footer> = {
  title: "Home/Footer",
  component: Footer,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Footer>;

export const Shown: Story = {};
