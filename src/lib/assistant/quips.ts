import type { Act, Face } from "@/components/assistant/robot";
import {
  certifications,
  contactLinks,
  experience,
  heroFacts,
  profile,
  projects,
  siteStack,
  skills,
  stack,
} from "@/content";

export type Quip = { id: string; text: string; face: Face; act?: Act };

type Candidate = {
  id: string;
  /** Lines about the section the guide is standing in come up more often there. */
  own: boolean;
  make: () => Quip | null;
};

const SAID_KEY = "portfolio-guide-said";
const OWN_BIAS = 0.7;

const quip = (
  id: string,
  text: string,
  face: Face = "smile",
  act?: Act,
): Quip => ({ id, text, face, act });

const fixed = (own: boolean, q: Quip): Candidate => ({
  id: q.id,
  own,
  make: () => q,
});

const sentence = (text: string) => {
  const t = text.trim().replace(/[.;]+$/, "");
  return `${t.charAt(0).toUpperCase()}${t.slice(1)}.`;
};

const list = (items: string[]): string =>
  items.length <= 1
    ? items.join("")
    : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function monthValue(issued: string): number {
  const [month, year] = issued.split(" ");
  const m = MONTHS.indexOf(month);
  const y = Number(year);
  return Number.isFinite(y) && m >= 0 ? y * 12 + m : 0;
}

function clock(): { time: string; hour: number } | null {
  if (!heroFacts.timeZone) return null;
  try {
    const now = new Date();
    const time = new Intl.DateTimeFormat("en-US", {
      timeZone: heroFacts.timeZone,
      hour: "numeric",
      minute: "2-digit",
    }).format(now);
    const hour = Number(
      new Intl.DateTimeFormat("en-US", {
        timeZone: heroFacts.timeZone,
        hour: "numeric",
        hourCycle: "h23",
      }).format(now),
    );
    return { time, hour };
  } catch {
    return null;
  }
}

const city = () => heroFacts.location?.split(",")[0];

function clockQuip(): Quip | null {
  const now = clock();
  const where = city();
  if (!now || !where) return null;
  const { time, hour } = now;
  if (hour >= 22 || hour < 5) {
    return quip("any:clock", `It's ${time} in ${where}. Late, but I don't sleep.`, "think");
  }
  if (hour < 12) return quip("any:clock", `It's ${time} in ${where}. Good morning.`, "happy");
  if (hour < 18) return quip("any:clock", `It's ${time} in ${where}. Good afternoon.`, "smile");
  return quip("any:clock", `It's ${time} in ${where}. Good evening.`, "smile");
}

function buildAny(): Candidate[] {
  const lines: Candidate[] = [
    fixed(false, quip("any:pixels", "Fun fact: I'm 14 pixels wide and 14 pixels tall.", "happy", "dance")),
    fixed(false, quip("any:one-page", "I only know this one page, but I know it well.", "think")),
    fixed(false, quip("any:poke", "Poke me for a quick tour.", "wink")),
    fixed(false, quip("any:follow", "Scroll on. I'll follow you from section to section.", "smile")),
    fixed(false, quip("any:keyboard", "No mouse? Tab gets you to me, and Enter opens the menu.", "smile")),
    fixed(false, quip("any:theme", "Light, dark or system: the buttons are in the header.", "wink")),
    fixed(false, quip("any:top", "I can fly you back to the top any time.", "happy")),
    fixed(false, quip("any:linkedin", "If you like what you see, the menu has a LinkedIn link.", "wink")),
    { id: "any:clock", own: false, make: clockQuip },
  ];

  if (siteStack.length > 0) {
    lines.push(
      fixed(
        false,
        quip("any:site", `This site is built with ${list(siteStack)}.`, "smile"),
      ),
    );
  }
  return lines;
}

function buildHome(): Candidate[] {
  const lines: Candidate[] = [
    fixed(true, quip("home:background", `Background: ${profile.background}.`, "smile")),
    fixed(true, quip("home:role", `${profile.name} is a ${profile.role}. I just keep the tour moving.`, "happy")),
    fixed(true, quip("home:start", "Not sure where to start? The projects are a good place.", "wow")),
  ];
  if (stack.length > 0) {
    lines.push(
      fixed(
        true,
        quip(
          "home:layers",
          `Across ${list(stack.map((row) => row.label.toLowerCase()))}: that's the range.`,
          "smile",
        ),
      ),
    );
  }
  // The rotating lines under the name are on the page, so they are fair to repeat.
  profile.leadLines.forEach((text, index) => {
    lines.push(fixed(true, quip(`home:lead-${index}`, text, "happy")));
  });
  if (heroFacts.availability) {
    lines.push(
      fixed(
        true,
        quip(
          "home:availability",
          `Status: ${heroFacts.availability}. The contact section is the quickest way in.`,
          "wink",
          "wave",
        ),
      ),
    );
  }
  if (heroFacts.location) {
    lines.push(
      fixed(true, quip("home:location", `Based in ${heroFacts.location}.`, "smile")),
    );
  }
  return lines;
}

function buildExperience(): Candidate[] {
  const lines: Candidate[] = [];
  for (const job of experience) {
    lines.push(
      fixed(true, quip(`exp:${job.id}:where`, `${job.organization}: ${job.role}, ${job.timeframe}.`, "smile")),
    );
    if (job.technologies.length > 0) {
      lines.push(
        fixed(
          true,
          quip(`exp:${job.id}:tech`, `At ${job.organization}: ${list(job.technologies)}.`, "happy"),
        ),
      );
    }
  }
  lines.push(
    fixed(true, quip("exp:cards", "Pick a role in the tech stack matrix and I'll show you only what it used.", "wink")),
  );
  return lines;
}

function buildProjects(): Candidate[] {
  const lines: Candidate[] = [
    fixed(true, quip("proj:expand", "“View details” opens the problem, the contribution, the role and the implementation.", "think")),
  ];
  for (const project of projects) {
    const { detail } = project;
    if (detail.role) {
      lines.push(
        fixed(true, quip(`proj:${project.id}:role`, `On ${project.name}: ${detail.role}`, "happy")),
      );
    }
    if (detail.implementation) {
      const parts = detail.implementation
        .replace(/^[^:]+:\s*/, "")
        .split(";")
        .map((part) => part.trim())
        .filter(Boolean);
      parts.forEach((part, index) => {
        lines.push(
          fixed(true, quip(`proj:${project.id}:impl-${index}`, `${project.name}: ${sentence(part)}`, "smile")),
        );
      });
    }
    lines.push(
      fixed(
        true,
        quip(
          `proj:${project.id}:count`,
          `${project.name} uses ${project.technologies.length} technologies. Select it in the matrix to see them.`,
          "wow",
        ),
      ),
    );
  }
  return lines;
}

function buildCertifications(): Candidate[] {
  const lines: Candidate[] = [];
  const issuers = new Map<string, number>();
  for (const c of certifications) {
    const issuer = c.issuer.split(" - ")[0];
    issuers.set(issuer, (issuers.get(issuer) ?? 0) + 1);
  }
  for (const [issuer, count] of issuers) {
    lines.push(
      fixed(
        true,
        quip(
          `cert:issuer:${issuer}`,
          count === 1 ? `One is from ${issuer}.` : `${count} of them are from ${issuer}.`,
          "smile",
        ),
      ),
    );
  }

  const dated = certifications.filter((c) => monthValue(c.issued) > 0);
  if (dated.length > 0) {
    const first = dated.reduce((a, b) => (monthValue(b.issued) < monthValue(a.issued) ? b : a));
    lines.push(
      fixed(true, quip("cert:first", `The earliest badge here is from ${first.issued}.`, "think")),
    );
  }

  const withExpiry = certifications.find((c) => c.expires);
  if (withExpiry) {
    lines.push(
      fixed(true, quip("cert:expiry", `${withExpiry.name.split(" (")[0]} is valid until ${withExpiry.expires}.`, "happy")),
    );
  }

  const ccna = certifications.filter((c) => c.name.startsWith("CCNA")).length;
  if (ccna > 1) {
    lines.push(fixed(true, quip("cert:ccna", `${ccna} CCNA badges on the list.`, "wow")));
  }

  if (certifications.some((c) => c.credentialUrl)) {
    lines.push(
      fixed(true, quip("cert:verify", "Each Verify credential button opens that badge's public credential page.", "wink")),
    );
  }
  return lines;
}

function buildStack(): Candidate[] {
  const lines: Candidate[] = skills.map((group) =>
    fixed(true, quip(`stack:${group.group}`, `${group.group}: ${list(group.items)}.`, "smile")),
  );
  lines.push(
    fixed(true, quip("stack:filter", "Select a project or role column and I'll hide everything it didn't use.", "wink")),
  );
  return lines;
}

function buildContact(): Candidate[] {
  const lines: Candidate[] = [];
  for (const link of contactLinks) {
    if (link.note) {
      lines.push(
        fixed(true, quip(`contact:${link.label}`, `${link.label}: ${link.note}.`, "wink", link.label === "LinkedIn" ? "wave" : undefined)),
      );
    }
  }
  lines.push(
    fixed(true, quip("contact:linkedin-menu", "Tap me and the menu has a LinkedIn link too.", "happy")),
  );
  if (heroFacts.availability) {
    lines.push(
      fixed(true, quip("contact:availability", `${heroFacts.availability}. Say hi.`, "happy", "wave")),
    );
  }
  return lines;
}

function buildFooter(): Candidate[] {
  return [
    fixed(true, quip("footer:top", "Back to top is right here. I'll take you.", "happy")),
    fixed(true, quip("footer:built", `Built with ${list(siteStack)}.`, "smile")),
  ];
}

const builders: Record<string, () => Candidate[]> = {
  home: buildHome,
  experience: buildExperience,
  projects: buildProjects,
  certifications: buildCertifications,
  "tech-stack": buildStack,
  contact: buildContact,
  footer: buildFooter,
};

const cache = new Map<string, Candidate[]>();

function poolFor(context: string): Candidate[] {
  let own = cache.get(context);
  if (!own) {
    own = builders[context]?.() ?? [];
    cache.set(context, own);
  }
  let any = cache.get("any");
  if (!any) {
    any = buildAny();
    cache.set("any", any);
  }
  return [...own, ...any];
}

// Held in memory so the no-repeat guarantee also works where sessionStorage is
// unavailable; it is seeded from, and written through to, sessionStorage so a
// reload does not start the list over.
let said: Set<string> | null = null;

function saidSet(): Set<string> {
  if (said) return said;
  said = new Set();
  try {
    const raw = window.sessionStorage.getItem(SAID_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) {
      for (const id of parsed) if (typeof id === "string") said.add(id);
    }
  } catch {
  }
  return said;
}

function persistSaid() {
  try {
    window.sessionStorage.setItem(SAID_KEY, JSON.stringify([...saidSet()]));
  } catch {
  }
}

let lastId: string | null = null;

/**
 * Picks the next idle remark for the section the guide is standing in. A line
 * is not repeated until every line available there has been said, and what has
 * been said is remembered for the session, so a reload does not start it over.
 */
export function nextQuip(context: string): Quip | null {
  const pool = poolFor(context);
  if (pool.length === 0) return null;

  const said = saidSet();
  let fresh = pool.filter((c) => !said.has(c.id));

  if (fresh.length === 0) {
    for (const c of pool) said.delete(c.id);
    fresh = pool.filter((c) => c.id !== lastId);
    if (fresh.length === 0) fresh = pool;
  }

  const own = fresh.filter((c) => c.own);
  let candidates = own.length > 0 && Math.random() < OWN_BIAS ? own : fresh;

  while (candidates.length > 0) {
    const index = Math.floor(Math.random() * candidates.length);
    const candidate = candidates[index];
    const made = candidate.make();
    said.add(candidate.id);
    if (made) {
      lastId = candidate.id;
      persistSaid();
      return made;
    }
    candidates = candidates.filter((_, i) => i !== index);
  }

  persistSaid();
  return null;
}

export const THEME_QUIPS = {
  dark: [
    quip("react:dark-1", "Dark mode. Easy on the eyes.", "happy"),
    quip("react:dark-2", "Lights off. I like it.", "wink"),
  ],
  light: [
    quip("react:light-1", "Light mode. Bright and clear.", "happy"),
    quip("react:light-2", "Lights on.", "wink"),
  ],
  system: [
    quip("react:system-1", "Following your system now.", "smile"),
    quip("react:system-2", "Back to system. Your device decides.", "think"),
  ],
};

export const RESUME_QUIP = quip("react:resume", "Résumé on its way. Thanks for taking a look.", "happy", "dance");
