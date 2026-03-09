import type { Meta, StoryObj } from "@storybook/react";
import CareerReadinessQuiz from "src/careerReadiness/components/CareerReadinessQuiz/CareerReadinessQuiz";
import type { QuizQuestionResponse } from "src/careerReadiness/types";

const meta: Meta<typeof CareerReadinessQuiz> = {
  title: "CareerReadiness/CareerReadinessQuiz",
  component: CareerReadinessQuiz,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof CareerReadinessQuiz>;

const mockQuestions: QuizQuestionResponse[] = [
  {
    question: "What best describes your professional identity?",
    options: [
      "A. Your job title alone",
      "B. Your unique combination of values, skills, experiences, and aspirations",
      "C. The company you work for",
      "D. Your salary and benefits",
    ],
  },
  {
    question: "Which of the following is a technical skill?",
    options: ["A. Teamwork", "B. Leadership", "C. Data analysis", "D. Time management"],
  },
];

export const Default: Story = {
  args: {
    questions: mockQuestions,
    onComplete: (answers) => {
      console.log("Quiz answers:", answers);
    },
  },
};

export const SingleQuestion: Story = {
  args: {
    questions: mockQuestions.slice(0, 1),
    onComplete: (answers) => {
      console.log("Quiz answers:", answers);
    },
  },
};
