import type { SkillGroup, StackRow } from "./types";

export const stack: StackRow[] = [
  { label: "Interfaces", items: ["React", "Next.js"] },
  { label: "APIs", items: ["Node.js", "Express", "FastAPI"] },
  { label: "Data", items: ["PostgreSQL", "MSSQL / SQL Server"] },
  { label: "AI", items: ["OpenAI"] },
  { label: "Cloud", items: ["AWS"] },
];

export const skills: SkillGroup[] = [
  {
    group: "Languages",
    items: [
      "TypeScript",
      "JavaScript",
      "Python",
      "C#",
      "SQL",
      "HTML",
      "CSS",
    ],
  },
  { group: "Frontend", items: ["React", "Next.js", "Tailwind"] },
  { group: "Backend", items: ["Node.js", "Express", "FastAPI"] },
  { group: "Data", items: ["PostgreSQL", "MSSQL / SQL Server"] },
  { group: "Cloud & APIs", items: ["AWS", "OpenAI", "WebSockets", "PayMongo"] },
  { group: "Tools", items: ["Postman", "Swagger"] },
];
