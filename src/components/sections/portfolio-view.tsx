import Image from "next/image";
import type { CSSProperties } from "react";
import { CertificationCards } from "./certification-cards";
import { ContactIcons } from "@/components/contact/contact-icons";
import { ContactInvitation } from "@/components/contact/contact";
import { ExperienceList } from "./experience";
import { Projects } from "./projects";
import { ResumeButton } from "@/components/hero/resume-button";
import { RotatingLead } from "@/components/hero/rotating-lead";
import { Section } from "./section";
import { StackStrip } from "./stack-strip";
import { TechStack } from "./tech-stack";
import {
  certifications,
  experience,
  portrait,
  profile,
  projects,
} from "@/content";

export function HeroPhoto() {
  if (!portrait) return null;

  return (
    <div className="group w-[5.5rem] lg:h-full lg:w-full">
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-rule lg:aspect-auto lg:h-full lg:min-h-[14rem] lg:rounded-2xl">
        <Image
          src={portrait.src}
          alt={portrait.alt}
          fill
          loading="eager"
          fetchPriority="high"
          sizes="(min-width: 1024px) 240px, 88px"
          style={
            {
              "--zoom": portrait.zoom ?? 1,
              transformOrigin: portrait.focus ?? "50% 50%",
            } as CSSProperties
          }
          className="object-cover [scale:var(--zoom)] transition-[scale] duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:[scale:calc(var(--zoom)*1.04)] motion-reduce:transition-none"
        />
      </div>
    </div>
  );
}

export function PortfolioLead() {
  return <RotatingLead lines={profile.leadLines} />;
}

export function PortfolioDetails() {
  return (
    <div className="border-t border-rule pt-6">
      <StackStrip />

      <div
        className="rise mt-9 flex flex-wrap items-center gap-x-4 gap-y-3"
        style={{ "--i": 8 } as CSSProperties}
      >
        <ContactIcons />
        <ResumeButton />
      </div>
    </div>
  );
}

export function PortfolioView() {
  return (
    <div className="space-y-12 sm:space-y-16">
      <Section
        id="experience"
        label="Experience"
        note="Internships and relevant work."
      >
        <ExperienceList items={experience} />
      </Section>

      <Section
        id="projects"
        label="Projects"
        note="Selected work. Expand for technical detail."
      >
        <Projects items={projects} />
      </Section>

      <Section
        id="certifications"
        label="Certifications"
        note="Professional certifications and credentials."
      >
        <CertificationCards items={certifications} />
      </Section>

      <Section
        id="tech-stack"
        label="Tech Stack"
        note="The layers I work in, and where each has been used."
      >
        <TechStack />
      </Section>

      <Section id="contact" label="Contact" note="Three ways to reach me.">
        <ContactInvitation />
      </Section>
    </div>
  );
}
