export type SiteLink = {
  label: string;
  email?: boolean;
  href?: string;
  value?: string;
  note?: string;
};

export type ExperienceEntry = {
  id: string;
  role: string;
  organization: string;
  timeframe: string;
  description: string;
  technologies: string[];
};

export type ProjectDetail = {
  problem?: string;
  built?: string;
  role?: string;
  implementation?: string;
};

export type Education = {
  institution: string;
  location: string;
  degree: string;
  specialization: string;
  date: string;
  honors: string[];
};

export type Project = {
  id: string;
  name: string;
  short?: string;
  summary: string;
  technologies: string[];
  links: SiteLink[];
  detail: ProjectDetail;
  preview?: { src: string; alt: string; width: number; height: number };
};

export type SkillGroup = {
  group: string;
  items: string[];
};

export type Certification = {
  id: string;
  name: string;
  issuer: string;
  issued: string;
  expires?: string;
  credentialUrl?: string;
  badge?: string;
};

export type ProfileFact = {
  label: string;
  value: string;
};

export type StackRow = {
  label: string;
  items: string[];
};
