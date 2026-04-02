import type { Meta, StoryObj } from "@storybook/react";

import React from "react";
import { Box, Typography } from "@mui/material";
import AuthLayout from "./AuthLayout";

const meta: Meta<typeof AuthLayout> = {
  title: "Auth/AuthLayout",
  component: AuthLayout,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof AuthLayout>;

export const Shown: Story = {
  args: {
    children: (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography variant="h3" color="white">
          Sign In
        </Typography>
        <Typography variant="body2" color="white">
          Form content goes here.
        </Typography>
      </Box>
    ),
  },
};
