import { experience, projects, siteStack } from "@/content";

export type Source = {
  id: string;
  label: string;
  name: string;
  mark: string;
};

export const SITE_ID = "this-site";

// Two letters that stand in for a source's name where there is no room to write it.
function markOf(label: string): string {
  const words = label
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean);
  const mark =
    words.length > 1
      ? words
          .slice(0, 2)
          .map((word) => word[0])
          .join("")
      : (words[0] ?? "").slice(0, 2);
  return mark.toUpperCase() || label.trim().slice(0, 2).toUpperCase() || "?";
}

const withMark = (source: Omit<Source, "mark">): Source => ({
  ...source,
  mark: markOf(source.label),
});

export const sources: Source[] = [
  ...projects.map((project) =>
    withMark({
      id: project.id,
      label: project.short ?? project.name,
      name: project.name,
    }),
  ),
  ...experience.map((entry) =>
    withMark({
      id: entry.id,
      label: entry.organization,
      name: `${entry.organization} (${entry.role})`,
    }),
  ),
  withMark({ id: SITE_ID, label: "This site", name: "This portfolio" }),
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
