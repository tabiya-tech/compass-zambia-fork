import type { Meta, StoryObj } from "@storybook/react";
import InstructorStudentsTable from "src/components/InstructorStudentsTable/InstructorStudentsTable";
import type { InstructorStudentRow } from "src/types";

const meta: Meta<typeof InstructorStudentsTable> = {
  title: "Instructor Dashboard/InstructorStudentsTable",
  component: InstructorStudentsTable,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof InstructorStudentsTable>;

const storyInstructorStudentsFixture: InstructorStudentRow[] = [
  {
    id: "student-1",
    studentName: "Chanda Mulenga",
    programme: "Computer Studies",
    year: "Year 2",
    gender: "Female",
    modulesExplored: 4,
    careerReady: "3/6",
    skillsInterestsExplored: 67,
    lastLogin: "Today",
    lastActiveModuleId: "career-explorer",
  },
  {
    id: "student-2",
    studentName: "Brian Phiri",
    programme: "Electrical Engineering",
    year: "Year 1",
    gender: "Male",
    modulesExplored: 5,
    careerReady: "5/6",
    skillsInterestsExplored: 100,
    lastLogin: "2 days ago",
    lastActiveModuleId: "skills-discovery",
  },
  {
    id: "student-3",
    studentName: "Natasha Banda",
    programme: "Business Administration",
    year: "Year 3",
    gender: "Female",
    modulesExplored: 2,
    careerReady: "0/6",
    skillsInterestsExplored: 12,
    lastLogin: "1 week ago",
    lastActiveModuleId: "workplace-readiness",
  },
];

export const Shown: Story = {
  args: {
    rows: storyInstructorStudentsFixture,
  },
};

export const Empty: Story = {
  args: {
    rows: [],
  },
};
