import type { Meta, StoryObj } from "@storybook/react";
import ShareReportButton from "./ShareReportButton";
import { generateRandomExperiences } from "src/experiences/experienceService/_test_utilities/mockExperiencesResponses";

const meta: Meta<typeof ShareReportButton> = {
  title: "Experiences/ShareReportButton",
  component: ShareReportButton,
  tags: ["autodocs"],
  decorators: [
    (Story) => {
      // Mock navigator.share to make the component render in Storybook
      if (typeof navigator !== "undefined" && !navigator.share) {
        // @ts-ignore - Mocking navigator.share for Storybook
        navigator.share = async () => {
          console.log("Mock share invoked");
          return Promise.resolve();
        };
      }
      return <Story />;
    },
  ],
};

export default meta;
type Story = StoryObj<typeof ShareReportButton>;

const mockExperiences = generateRandomExperiences(3);

export const Shown: Story = {
  args: {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 234 567 890",
    address: "123 Main Street, New York, NY 10001",
    experiences: mockExperiences,
    conversationConductedAt: new Date().toISOString(),
  },
};

export const Disabled: Story = {
  args: {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 234 567 890",
    address: "123 Main Street, New York, NY 10001",
    experiences: mockExperiences,
    conversationConductedAt: new Date().toISOString(),
    disabled: true,
  },
};
