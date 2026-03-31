import type { Meta, StoryObj } from "@storybook/react";
import HomeHero from "src/home/components/HomeHero/HomeHero";

const meta: Meta<typeof HomeHero> = {
  title: "Home/HomeHero",
  component: HomeHero,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 960, padding: 24, background: "#fff" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof HomeHero>;

export const Default: Story = {};
