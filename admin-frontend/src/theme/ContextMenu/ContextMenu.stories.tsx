import { Meta, StoryObj } from "@storybook/react";
import React, { useEffect, useState } from "react";
import { action } from "@storybook/addon-actions";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import { Box } from "@mui/material";
import ContextMenu, { ContextMenuProps } from "./ContextMenu";
import type { MenuItemConfig } from "./menuItemConfig.types";

const meta: Meta<typeof ContextMenu> = {
  title: "Components/ContextMenu",
  component: ContextMenu,
  tags: ["autodocs"],
  argTypes: {
    open: {
      control: { type: "boolean" },
    },
    notifyOnClose: {
      table: { disable: true },
    },
  },
};

export default meta;

type Story = StoryObj<typeof ContextMenu>;

const defaultItems: MenuItemConfig[] = [
  {
    id: "item-1",
    text: "Item 1",
    icon: <CloudDownloadIcon />,
    action: action("Item 1 clicked"),
    disabled: false,
  },
  {
    id: "item-2",
    text: "Item 2",
    icon: <SendOutlinedIcon />,
    action: action("Item 2 clicked"),
    disabled: false,
  },
];

export const Shown: Story = {
  render: (args) => <SetupComponent {...args} />,
  args: {
    items: defaultItems,
    open: true,
  } as Partial<ContextMenuProps>,
};

function SetupComponent(props: Readonly<ContextMenuProps>) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const anchor = document.getElementById("anchor-on-me");
    setAnchorEl(anchor);
  }, []);

  return (
    <>
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <div style={{ border: "1px dashed", height: 20, width: 100 }} id="anchor-on-me" />
      </Box>
      <ContextMenu {...props} anchorEl={anchorEl} open={anchorEl !== null} notifyOnClose={action("notifyOnClose")} />
    </>
  );
}
