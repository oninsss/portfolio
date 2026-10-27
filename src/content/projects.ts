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
    links: [{ label: "Live demo", href: "https://aikonsulta.onins.dev" }],
    preview: {
      src: "/projects/aikonsulta.webp",
      alt: "The AI-Konsulta home page: the headline “Simplifying Your Clinic Visit Experience”, Get Started and Download the App buttons, a friendly robot mascot, and a chat assistant offering help in the corner.",
      width: 1860,
      height: 943,
    },
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
  {
    id: "modu",
    name: "Modu",
    short: "Modu",
    summary: "Your work. Your flow. Your way.",
    technologies: [
      "Next.js",
      "React",
      "TypeScript",
      "Supabase",
      "PostgreSQL",
      "Tailwind CSS",
      "Vercel",
    ],
    links: [{ label: "Visit site", href: "https://dashboard.onins.dev" }],
    preview: {
      kind: "video",
      src: "/projects/modu.mp4",
      poster: "/projects/modu-poster.webp",
      alt: "The Modu landing page, showing the app's tasks, projects, calendar and habits in one personal dashboard.",
      width: 1920,
      height: 1080,
    },
    detail: {
      problem:
        "Productivity tools often require users to adapt to predefined workflows. Modu takes a different approach: bringing tasks, projects, calendar, and habits into one workspace designed around flexibility and personal organization.",
      built:
        "Designed and built Modu independently, from specification through production deployment. Developed the frontend, backend, authentication, and core application architecture, integrating the essential tools for personal productivity into a unified workspace.",
      role: "Solo Full-Stack Developer — responsible for product specification, end-to-end implementation, backend and database integration, authentication, and production deployment.",
      implementation:
        "Built with Next.js, React, and TypeScript, backed by Supabase for PostgreSQL database management and authentication. Implemented a server-side API layer to support application functionality and deployed the application on Vercel.",
    },
  },
];
