import type { Meta, StoryObj } from "@storybook/react";
import { PreferencesCard } from "./PreferencesCard";

const meta: Meta<typeof PreferencesCard> = {
  title: "Profile/Components/PreferencesCard",
  component: PreferencesCard,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof PreferencesCard>;

export const Default: Story = {
  args: {
    language: "English",
    acceptedTcDate: new Date("2024-01-15T10:30:00"),
    isLoading: false,
  },
};

export const Loading: Story = {
  args: {
    language: "English",
    acceptedTcDate: new Date("2024-01-15T10:30:00"),
    isLoading: true,
  },
};

export const NoData: Story = {
  args: {
    language: null,
    acceptedTcDate: null,
    isLoading: false,
  },
};

export const LanguageOnly: Story = {
  args: {
    language: "Bemba",
    acceptedTcDate: null,
    isLoading: false,
  },
};

export const TermsAcceptedOnly: Story = {
  args: {
    language: null,
    acceptedTcDate: new Date("2024-02-20T14:45:00"),
    isLoading: false,
  },
};
