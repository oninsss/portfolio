import type { Face } from "@/components/assistant/robot";
import {
  certifications,
  contactLinks,
  experience,
  heroFacts,
  profile,
  projects,
  skills,
} from "@/content";

export type Line = { text: string; face: Face };

const line = (text: string, face: Face = "smile"): Line => ({ text, face });

export const SECTION_IDS = [
  "experience",
  "projects",
  "certifications",
  "tech-stack",
  "contact",
  "footer",
] as const;

const NUMBER_WORDS = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
];

const word = (n: number) => NUMBER_WORDS[n] ?? String(n);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function list(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

export const OPENINGS: Record<string, Line> = {
  introduction: line("A developer who likes understanding how things work.", "happy"),
  experience: line("I've worked across APIs, data, and full-stack systems."),
  projects: line("Here's where the real work is.", "wow"),
  certifications: line("This is where the credentials live.", "happy"),
  "tech-stack": line("And this is the toolbox."),
  contact: line("Good choice. Let's build something.", "wink"),
  footer: line("That's everything. Want to say hi?", "happy"),
};

const ASK_AFTER_TOUR = line("Anything else you'd like to see?");
const ASK_AFTER_HOP = line("Need a hand with anything?");

function common(lists: string[][]): string[] {
  if (lists.length === 0) return [];
  return lists[0].filter((tech) => lists.every((l) => l.includes(tech)));
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function monthValue(issued: string): number {
  const [month, year] = issued.split(" ");
  const m = MONTHS.indexOf(month);
  const y = Number(year);
  return Number.isFinite(y) && m >= 0 ? y * 12 + m : 0;
}

function details(id: string): Line[] {
  switch (id) {
    case "introduction": {
      const focus = profile.facts.find((f) => f.label === "Focus")?.value;
      return [
        line(`Background: ${profile.background}.`),
        ...(focus ? [line(`My focus: ${focus.split(" · ").join(", ")}.`)] : []),
      ];
    }

    case "experience": {
      const n = experience.length;
      const roles = [...new Set(experience.map((e) => e.role))];
      const shared = common(experience.map((e) => e.technologies));
      const each = n === 2 ? "both" : "all";
      return [
        roles.length === 1 && n > 1
          ? line(`${cap(word(n))} roles so far, ${each} as a ${roles[0]}.`)
          : line(`${cap(word(n))} ${n === 1 ? "role" : "roles"} so far.`),
        ...(shared.length > 0 && n > 1
          ? [line(`${list(shared)} runs through ${each} of them.`)]
          : []),
      ];
    }

    case "projects": {
      const first = projects[0];
      return [
        line(
          `${cap(word(projects.length))} ${projects.length === 1 ? "project" : "projects"}: ${list(projects.map((p) => p.name))}.`,
        ),
        ...(first
          ? [line(`${first.name} runs on ${list(first.technologies.slice(0, 3))}.`)]
          : []),
        line("Open “View details” on any of them for the technical side."),
      ];
    }

    case "certifications": {
      const byIssuer = new Map<string, number>();
      for (const c of certifications) {
        const issuer = c.issuer.split(" - ")[0];
        byIssuer.set(issuer, (byIssuer.get(issuer) ?? 0) + 1);
      }
      const top = [...byIssuer.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2);
      const latest = certifications.reduce<string | undefined>(
        (best, c) => (!best || monthValue(c.issued) > monthValue(best) ? c.issued : best),
        undefined,
      );
      return [
        line(
          `${cap(word(certifications.length))} certifications: ${list(top.map(([issuer, n]) => `${word(n)} from ${issuer}`))}.`,
        ),
        ...(latest ? [line(`The most recent were issued in ${latest}.`)] : []),
      ];
    }

    case "tech-stack": {
      const total = skills.reduce((sum, g) => sum + g.items.length, 0);
      return [
        line(`${cap(word(skills.length))} groups: ${list(skills.map((g) => g.group))}.`),
        line(`${total} technologies in all.`),
        line("Pick a project or role to see only the technologies it used."),
      ];
    }

    case "contact": {
      const live = contactLinks
        .filter((l) => l.href || l.email)
        .map((l) => l.label);
      const pending = contactLinks
        .filter((l) => !l.href && !l.email)
        .map((l) => l.label);
      return [
        line(`You can reach me through ${list(contactLinks.map((l) => l.label))}.`),
        line("Or write from right here: the form is just above the links.", "wink"),
        ...(heroFacts.location && heroFacts.timeZone
          ? [
              line(
                `I'm in ${heroFacts.location}, where it's ${new Intl.DateTimeFormat("en-US", { timeZone: heroFacts.timeZone, hour: "numeric", minute: "2-digit" }).format(new Date())} right now.`,
              ),
            ]
          : []),
        ...(pending.length > 0 && live.length > 0
          ? [
              line(
                `${list(pending)} ${pending.length > 1 ? "aren't" : "isn't"} filled in yet. ${list(live)} ${live.length > 1 ? "work" : "works"} right now.`,
                "think",
              ),
            ]
          : []),
      ];
    }

    default:
      return [];
  }
}

export function linesFor(id: string, mode: "tour" | "hop"): Line[] {
  const opening = OPENINGS[id];
  if (!opening) return [];
  if (id === "footer") return [opening];
  const more = details(id);
  return mode === "tour"
    ? [opening, ...more, ASK_AFTER_TOUR]
    : [opening, ...more.slice(0, 1), ASK_AFTER_HOP];
}

export const REVISIT: Line[] = [ASK_AFTER_HOP];
