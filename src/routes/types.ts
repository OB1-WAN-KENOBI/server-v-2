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
  isCore?: boolean;
}

export interface ApiStatus {
  status: "Available" | "Busy" | "Not taking projects";
  message?: {
    ru?: string;
    en?: string;
  };
}

export interface ApiProfile {
  name: string;
  role: LocalizedString;
  description: LocalizedString;
  photoUrl?: string;
  aboutTexts: {
    ru: string[];
    en: string[];
  };
  socials?: {
    github?: string;
    linkedin?: string;
    telegram?: string;
  };
}
