import type { Meta, StoryObj } from "@storybook/react";
import CareerReadinessQuizChatMessage from "src/careerReadiness/components/CareerReadinessQuizChatMessage/CareerReadinessQuizChatMessage";
import type { QuizQuestionResponse } from "src/careerReadiness/types";

const meta: Meta<typeof CareerReadinessQuizChatMessage> = {
  title: "CareerReadiness/CareerReadinessQuizChatMessage",
  component: CareerReadinessQuizChatMessage,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof CareerReadinessQuizChatMessage>;

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
];

export const WithIntroMessage: Story = {
  args: {
    message_id: "quiz-msg-1",
    introMessage: "Great work! You've covered the key topics. It's time for a short quiz to check your understanding.",
    questions: mockQuestions,
    onSubmit: async (answers) => {
      console.log("Quiz submitted:", answers);
    },
  },
};

export const WithoutIntroMessage: Story = {
  args: {
    message_id: "quiz-msg-2",
    questions: mockQuestions,
    onSubmit: async (answers) => {
      console.log("Quiz submitted:", answers);
    },
  },
};

export const WithFailedResultAndRetry: Story = {
  args: {
    message_id: "quiz-msg-3",
    introMessage: "Great work! You've covered the key topics. It's time for a short quiz.",
    questions: mockQuestions,
    onSubmit: async (answers) => {
      console.log("Quiz submitted (retry):", answers);
    },
    moduleId: "professional-identity",
    conversationId: "conv-1",
    submissionResult: {
      score: 0,
      total: 1,
      passed: false,
      submittedAt: Date.now(),
    },
    lastAnswers: { 1: "A" },
  },
};
