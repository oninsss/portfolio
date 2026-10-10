import type { Education, ProfileFact } from "./types";

export const profile = {
  name: "onins",
  fullName: "Antoniño Bonagua",
  role: "Full Stack Developer",
  background: "BSIT · Web & Mobile Applications",
  leadLines: [
    "I build web applications end to end: the interface, the API, the database, and the cloud it runs on.",
    "From SQL Server stored procedures to React interfaces, I work across the whole stack.",
    "I helped build a GPT-4o pre-assessment chatbot for a clinic management system.",
    "I design databases and write SQL Server stored procedures for large, interconnected datasets.",
    "I led the AWS EC2 setup and production deployment of a clinic management system.",
  ],
  facts: [
    { label: "Background", value: "BSIT · Web & Mobile Applications" },
    { label: "Focus", value: "Interfaces · APIs · databases · deployment" },
    {
      label: "Recent work",
      value: "Backend APIs · SQL Server · AWS deployment · AI chatbot",
    },
  ] satisfies ProfileFact[],
  statement: "I build across the stack.",
  linkedin: "https://www.linkedin.com/in/antoni%C3%B1o-bonagua-1a3948345",
  github: "https://github.com/oninsss",
  githubUsername: "oninsss",
};

export const heroFacts: {
  location?: string;
  timeZone?: string;
  availability?: string;
} = {
  location: "Quezon City, Philippines",
  timeZone: "Asia/Manila",
  availability: "Open to work",
};

export const education: Education[] = [
  {
    institution: "FEU Institute of Technology",
    location: "Manila, Philippines",
    degree: "Bachelor of Science in Information Technology",
    specialization: "Web and Mobile Application",
    date: "September 2026",
    honors: [
      "Top Performing Student, A.Y. 2022–2023 and 2025–2026",
      "Dean's Lister, A.Y. 2023–2025",
    ],
  },
];

export const resumeFile = {
  href: "/Bonagua_Antonino_Resume-Public.pdf",
  filename: "Bonagua_Antonino_Resume.pdf",
} as { href: string; filename?: string } | undefined;

export const siteStack = ["Next.js", "React", "TypeScript", "Tailwind CSS"];

export const portrait:
  | {
      src: string;
      alt: string;
      zoom?: number;
      focus?: string;
    }
  | undefined = {
  src: "/temp-profile.jpg",
  alt: "Portrait of onins",
  zoom: 1.7,
  focus: "46% 47%",
};
