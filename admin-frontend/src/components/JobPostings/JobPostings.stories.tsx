import type { Meta, StoryObj } from "@storybook/react";
import JobPostings from "src/components/JobPostings/JobPostings";
import type { JobPostingRow, JobPostingStats } from "src/types";

const meta: Meta<typeof JobPostings> = {
  title: "Dashboard/JobPostings",
  component: JobPostings,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof JobPostings>;

const rows: JobPostingRow[] = [
  {
    id: "job-1",
    jobTitle: "Junior Software Developer",
    sector: "ICT",
    location: "Lusaka",
    zqfLevel: "Level 6",
    platform: "BrighterMonday",
    skills: ["JavaScript", "React", "Git", "Communication"],
    candidatePool: 34,
    jobUrl: "https://example.com/jobs/junior-software-developer",
  },
  {
    id: "job-2",
    jobTitle: "Electrical Technician",
    sector: "Energy",
    location: "Ndola",
    zqfLevel: "Level 5",
    platform: "GoZ Jobs",
    skills: ["Electrical Wiring", "Safety", "Troubleshooting"],
    candidatePool: 21,
    jobUrl: "https://example.com/jobs/electrical-technician",
  },
];

const stats: JobPostingStats = {
  jobsSourced: rows.length,
  sectorsCovered: 2,
  sourcePlatformsCount: 2,
};

export const Shown: Story = {
  args: {
    rows,
    stats,
  },
};
