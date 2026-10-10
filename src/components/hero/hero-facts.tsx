import { heroFacts, profile } from "@/content";
import type { CSSProperties } from "react";
import { CHIP } from "@/components/shared/chip";
import { IconCap, IconPin } from "@/components/shared/icons";
import { LocalTime } from "./local-time";

export function HeroFacts() {
  const { location, timeZone, availability } = heroFacts;

  return (
    <ul className="mt-3 flex flex-wrap gap-2">
      <li className="rise" style={{ "--i": 0 } as CSSProperties}>
        <span className={CHIP}>
          <IconCap size={14} className="text-ink-muted" />
          {profile.background}
        </span>
      </li>

      {location ? (
        <li className="rise" style={{ "--i": 1 } as CSSProperties}>
          <span className={CHIP}>
            <IconPin size={14} className="text-ink-muted" />
            {location}
          </span>
        </li>
      ) : null}

      {location && timeZone ? (
        <li className="rise" style={{ "--i": 2 } as CSSProperties}>
          <LocalTime place={location} timeZone={timeZone} />
        </li>
      ) : null}

      {availability ? (
        <li className="rise" style={{ "--i": 3 } as CSSProperties}>
          <span className="inline-flex items-center gap-2 border border-accent/40 bg-[color-mix(in_oklab,var(--accent)_8%,transparent)] px-2.5 py-1.5 text-xs leading-snug text-accent transition-[border-color,translate] duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-px hover:border-accent">
            <span
              aria-hidden="true"
              className="status-dot relative inline-block h-1.5 w-1.5 shrink-0 bg-accent"
            />
            {availability}
          </span>
        </li>
      ) : null}
    </ul>
  );
}
