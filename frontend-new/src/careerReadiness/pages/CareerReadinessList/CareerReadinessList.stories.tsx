import type { Meta, StoryObj } from "@storybook/react";
import CareerReadinessList from "src/careerReadiness/pages/CareerReadinessList/CareerReadinessList";
import CareerReadinessService from "src/careerReadiness/services/CareerReadinessService";
import type { ModuleSummary } from "src/careerReadiness/types";

const meta: Meta<typeof CareerReadinessList> = {
  title: "CareerReadiness/CareerReadinessList",
  component: CareerReadinessList,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof CareerReadinessList>;

const mockModules: ModuleSummary[] = [
  {
    id: "professional-identity",
    title: "Professional Identity & Skills Mapping",
    description:
      "Understand what professional identity means, learn the three types of skills, and how to articulate them to employers.",
    icon: "identity",
    status: "NOT_STARTED",
    sort_order: 1,
    input_placeholder: "Ask about professional identity and skills…",
  },
  {
    id: "cv-development",
    title: "CV Development",
    description: "Build a strong CV that highlights your skills and experience effectively.",
    icon: "cv",
    status: "IN_PROGRESS",
    sort_order: 2,
    input_placeholder: "Ask about CV writing…",
  },
  {
    id: "cover-letter",
    title: "Cover Letter",
    description: "Write compelling cover letters tailored to each job application.",
    icon: "letter",
    status: "COMPLETED",
    sort_order: 3,
    input_placeholder: "Ask about cover letters…",
  },
];

export const Default: Story = {
  decorators: [
    (Story) => {
      const service = CareerReadinessService.getInstance();
      (service as any).listModules = async () => ({ modules: mockModules });
      return <Story />;
    },
  ],
};

export const Loading: Story = {
  decorators: [
    (Story) => {
      const service = CareerReadinessService.getInstance();
      (service as any).listModules = () => new Promise(() => {});
      return <Story />;
    },
  ],
};

export const Empty: Story = {
  decorators: [
    (Story) => {
      const service = CareerReadinessService.getInstance();
      (service as any).listModules = async () => ({ modules: [] });
      return <Story />;
    },
  ],
};

export const LoadError: Story = {
  decorators: [
    (Story) => {
      const service = CareerReadinessService.getInstance();
      (service as any).listModules = async () => {
        throw new Error("Unable to load modules. Please try again.");
      };
      return <Story />;
    },
  ],
};
