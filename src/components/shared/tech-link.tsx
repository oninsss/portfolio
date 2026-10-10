"use client";

import type { ReactNode } from "react";
import { FOCUS_TECH_EVENT, type FocusTechDetail } from "@/lib/focus-tech";

export function TechLink({
  tech,
  techs,
  source,
  title,
  className,
  children,
}: {
  tech?: string;
  techs?: string[];
  source?: string;
  title?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <a
      href="#tech-stack"
      title={title ?? (tech ? `See where ${tech} has been used` : undefined)}
      onClick={(event) => {
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        )
          return;
        window.dispatchEvent(
          new CustomEvent<FocusTechDetail>(FOCUS_TECH_EVENT, {
            detail: { tech, techs, source },
          }),
        );
      }}
      className={[
        "underline decoration-transparent underline-offset-4 transition-[color,text-decoration-color] duration-200 hover:text-accent hover:decoration-accent focus-visible:text-accent focus-visible:decoration-accent",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children ?? tech}
    </a>
  );
}
