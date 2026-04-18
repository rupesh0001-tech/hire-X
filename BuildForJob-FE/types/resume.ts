import { ResumeState } from "@/lib/store/features/resume-slice";

export interface ResumeData {
  personal_info: ResumeState["personalInfoData"];
  professional_summary: string;
  experience: ResumeState["experienceData"];
  education: ResumeState["educationData"];
  project: ResumeState["projectData"];
  skills: string[];
  sectionVisibility: ResumeState["sectionVisibility"];
}

export interface TemplateProps {
  data: ResumeData;
  accentColor: string;
}
