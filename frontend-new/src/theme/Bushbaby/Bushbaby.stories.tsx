import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Bushbaby } from "./Bushbaby";

const meta: Meta<typeof Bushbaby> = {
  title: "Components/Bushbaby",
  component: Bushbaby,
  tags: ["autodocs"],
  argTypes: {
    width: { control: "text" },
    strokeColor: { control: "color" },
    bodyColor: { control: "color" },
    faceColor: { control: "color" },
  },
};

export default meta;
type Story = StoryObj<typeof Bushbaby>;

export const Default: Story = {
  args: {
    children: (
      <div style={{ padding: 24, background: "#f5f5f5", borderRadius: 8, minHeight: 120 }}>Content with mascot</div>
    ),
  },
};

export const CustomWidth: Story = {
  args: {
    width: "96px",
    children: (
      <div style={{ padding: 24, background: "#f5f5f5", borderRadius: 8, minHeight: 120 }}>Larger bushbaby</div>
    ),
  },
};

export const CustomColors: Story = {
  args: {
    width: "64px",
    strokeColor: "#2d5016",
    bodyColor: "#8b7355",
    faceColor: "#d4b896",
    children: (
      <div style={{ padding: 24, background: "#f5f5f5", borderRadius: 8, minHeight: 120 }}>
        Bushbaby with natural colors
      </div>
    ),
  },
};
