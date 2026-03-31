import type { Meta, StoryObj } from "@storybook/react";
import HomeCtaGrid from "src/home/components/HomeCtaGrid/HomeCtaGrid";

const meta: Meta<typeof HomeCtaGrid> = {
  title: "Home/HomeCtaGrid",
  component: HomeCtaGrid,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 1100, padding: 24 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof HomeCtaGrid>;

export const Default: Story = {};
