import type { Meta, StoryObj } from "@storybook/react";
import { Fieldset } from "./Fieldset";
import { getRandomLorem } from "src/_test_utilities/specialCharacters";

const meta: Meta<typeof Fieldset> = {
  title: "Profile/Fieldset",
  component: Fieldset,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Fieldset>;

export const Default: Story = {
  args: {
    label: getRandomLorem(10),
    value: getRandomLorem(20),
  },
};

export const WithLongValue: Story = {
  args: {
    label: getRandomLorem(10),
    value: getRandomLorem(100),
  },
};

export const WithVeryLongValue: Story = {
  args: {
    label: getRandomLorem(10),
    value: getRandomLorem(1000),
  },
};

export const WithEmptyValue: Story = {
  args: {
    label: getRandomLorem(10),
    value: "",
  },
};

export const WithShortValue: Story = {
  args: {
    label: getRandomLorem(10),
    value: getRandomLorem(10),
  },
};

export const Loading: Story = {
  args: {
    label: getRandomLorem(10),
    isLoading: true,
  },
};

export const LongLabelWithLongValue: Story = {
  args: {
    label: getRandomLorem(300),
    value: getRandomLorem(300),
  },
};
