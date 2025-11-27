export type LocalizedString = {
  ru: string;
  en: string;
};

export interface ApiProject {
  id: string;
  title: LocalizedString | string;
  description: LocalizedString | string;
  techStack: string[];
  year: number;
  status: string;
  url?: string;
  images?: string[];
}

export type ApiSkillCategory = "frontend" | "backend" | "tooling" | "other";
export type ApiSkillLevel = "beginner" | "middle" | "advanced";

export interface ApiSkill {
  id: string;
  name: string;
  category: ApiSkillCategory;
  level: ApiSkillLevel;
}
