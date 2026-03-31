import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Box } from "@mui/material";
import Sidebar from "src/theme/Sidebar/Sidebar";

const meta: Meta<typeof Sidebar> = {
  title: "Theme/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ height: "400px", display: "flex", justifyContent: "flex-end" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Sidebar>;

export const WithContent: Story = {
  args: {
    title: "Section Title",
    children: <Box sx={{ fontSize: "13px", color: "#555" }}>Any content goes here — chips, cards, lists, etc.</Box>,
  },
};

export const WithMultipleSections: Story = {
  args: {
    title: "My Sidebar",
    children: (
      <>
        <Box sx={{ fontSize: "13px", color: "#555" }}>First section content</Box>
        <Box sx={{ fontSize: "13px", color: "#555" }}>Second section content</Box>
      </>
    ),
  },
};
