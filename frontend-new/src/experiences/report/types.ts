import { Experience } from "src/experiences/experienceService/experiences.types";

export type ReportProps = {
  name: string;
  email: string;
  location: string;
  school: string;
  program: string;
  experiences: Experience[];
  conversationConductedAt: string | null;
};

export interface IReportFormatProvider {
  download: (props: ReportProps) => void;
}
