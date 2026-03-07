import type { Meta, StoryObj } from "@storybook/react";
import { SecurityCard } from "./SecurityCard";

const meta: Meta<typeof SecurityCard> = {
  title: "Profile/Components/SecurityCard",
  component: SecurityCard,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof SecurityCard>;

export const Default: Story = {
  args: {
    email: "john.doe@example.com",
    isLoading: false,
  },
};

export const Loading: Story = {
  args: {
    email: "john.doe@example.com",
    isLoading: true,
  },
};

export const NoEmail: Story = {
  args: {
    email: null,
    isLoading: false,
  },
};

export const LongEmail: Story = {
  args: {
    email: "alexander.christopher.montgomery.wellington@verylongdomainname.co.zm",
    isLoading: false,
  },
};

export const ShortEmail: Story = {
  args: {
    email: "a@b.co",
    isLoading: false,
  },
};
