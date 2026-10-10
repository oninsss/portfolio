import { experience, projects, siteStack } from "@/content";

export type Source = {
  id: string;
  label: string;
  name: string;
};

export const SITE_ID = "this-site";

export const sources: Source[] = [
  ...projects.map((project) => ({
    id: project.id,
    label: project.short ?? project.name,
    name: project.name,
  })),
  ...experience.map((entry) => ({
    id: entry.id,
    label: entry.organization,
    name: `${entry.organization} (${entry.role})`,
  })),
  { id: SITE_ID, label: "This site", name: "This portfolio" },
];

const VISIBLE_PROJECTS = 3;

const siteSource = sources[sources.length - 1];
const projectSources = sources.slice(0, projects.length);
const roleSources = sources.slice(projects.length, -1);

export const evidenceSourceCount = sources.length - 1;
export const visibleProjects = [
  ...projectSources.slice(0, VISIBLE_PROJECTS),
  ...roleSources,
];
export const moreProjects = projectSources.slice(VISIBLE_PROJECTS);
export { siteSource };

const listed: string[][] = [
  ...projects.map((project) => project.technologies),
  ...experience.map((entry) => entry.technologies),
  siteStack,
];

const alternatives = (tech: string) =>
  tech.split(" / ").map((part) => part.trim().toLowerCase());

function uses(used: string[], tech: string): boolean {
  const wanted = alternatives(tech);
  return used.some((entry) =>
    alternatives(entry).some((have) =>
      wanted.some((want) => have === want || have.startsWith(`${want} `)),
    ),
  );
}

export function evidenceFor(tech: string): boolean[] {
  return listed.map((used) => uses(used, tech));
}
