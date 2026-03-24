import type { Meta, StoryObj } from "@storybook/react";
import SkillsAnalytics from "src/components/SkillsAnalytics/SkillsAnalytics";
import { getBackendUrl } from "src/envService";

// URL constants for mocked endpoints
const ANALYTICS_SKILL_GAP_URL = getBackendUrl() + "/analytics/skill-gap-stats?limit=5";
const ANALYTICS_SKILLS_SUPPLY_URL = getBackendUrl() + "/analytics/skills-supply-stats?limit=5";

const meta: Meta<typeof SkillsAnalytics> = {
  title: "Dashboard/SkillsAnalytics",
  component: SkillsAnalytics,
  tags: ["autodocs"],
  parameters: {
    mockData: [
      {
        url: ANALYTICS_SKILL_GAP_URL,
        method: "GET",
        status: 200,
        response: {
          total_students_with_skill_gaps: 180,
          top_skill_gaps: [
            {
              skill_id: "1",
              skill_label: "Problem Solving",
              students_with_gap_count: 110,
              avg_job_unlock_count: 3,
              avg_proximity_score: 0.6,
            },
            {
              skill_id: "2",
              skill_label: "Communication",
              students_with_gap_count: 95,
              avg_job_unlock_count: 2,
              avg_proximity_score: 0.55,
            },
            {
              skill_id: "3",
              skill_label: "Teamwork",
              students_with_gap_count: 78,
              avg_job_unlock_count: 2,
              avg_proximity_score: 0.52,
            },
            {
              skill_id: "4",
              skill_label: "Data Analysis",
              students_with_gap_count: 70,
              avg_job_unlock_count: 2,
              avg_proximity_score: 0.5,
            },
          ],
        },
      },
      {
        url: ANALYTICS_SKILLS_SUPPLY_URL,
        method: "GET",
        status: 200,
        response: {
          total_students_with_skills: 220,
          top_skills: [
            { skill_id: "s1", skill_label: "Communication", student_count: 132, avg_score: 0.75 },
            { skill_id: "s2", skill_label: "Teamwork", student_count: 118, avg_score: 0.72 },
            { skill_id: "s3", skill_label: "Time Management", student_count: 102, avg_score: 0.69 },
            { skill_id: "s4", skill_label: "Critical Thinking", student_count: 94, avg_score: 0.67 },
          ],
        },
      },
    ],
  },
};

export default meta;

type Story = StoryObj<typeof SkillsAnalytics>;

export const Shown: Story = {};
