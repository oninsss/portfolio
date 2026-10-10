import type { Project } from "./types";

export const projects: Project[] = [
  {
    id: "ai-konsulta",
    name: "AI-Konsulta",
    short: "AI-Konsulta",
    summary:
      "Clinic management system for One-Rad Medical Clinic QC with an AI pre-assessment chatbot, EHR, scheduling, billing and records.",
    technologies: [
      "Next.js",
      "React",
      "Express",
      "PostgreSQL",
      "WebSockets",
      "PayMongo",
      "OpenAI / GPT-4o",
      "AWS EC2",
    ],
    links: [],
    detail: {
      problem:
        "A clinic system for One-Rad Medical Clinic QC covering registration, scheduling, billing and records, with a patient pre-assessment step before consultation.",
      built:
        "My part of a team project: core backend functionality, the database schema and operations, and leading the AWS EC2 setup and production deployment. I assisted with the frontend pages, the API integration, and the GPT-4o chatbot feature.",
      role: "Full Stack Developer & Cloud Deployment Lead.",
      implementation:
        "Project stack: an Express API and PostgreSQL backend with a Next.js (React) front end; WebSockets for real-time updates; OpenAI / GPT-4o for the pre-assessment conversation; PayMongo for payments; deployed on AWS EC2.",
    },
  },
];
