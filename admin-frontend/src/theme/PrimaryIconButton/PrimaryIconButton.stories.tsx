import type { Meta, StoryObj } from "@storybook/react";
import { Box } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import PrimaryIconButton from "src/theme/PrimaryIconButton/PrimaryIconButton";

const meta: Meta<typeof PrimaryIconButton> = {
  title: "Components/PrimaryIconButton",
  component: PrimaryIconButton,
  tags: ["autodocs"],
  argTypes: {
    onClick: { action: "clicked" },
  },
};

export default meta;

type Story = StoryObj<typeof PrimaryIconButton>;

export const Shown: Story = {
  args: {
    title: "Copy",
    children: (
      <Box sx={{ p: 0 }}>
        <ContentCopyIcon />
      </Box>
    ),
  },
};
