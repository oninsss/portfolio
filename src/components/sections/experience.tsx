import type { ExperienceEntry } from "@/content";

export function ExperienceList({ items }: { items: ExperienceEntry[] }) {
  return (
    <ol className="divide-y divide-rule">
      {items.map((entry) => (
        <li
          key={entry.id}
          className="reveal group py-5 first:pt-0 last:pb-0"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <h3 className="text-lg font-medium tracking-tight text-ink transition-colors duration-150 group-hover:text-accent sm:text-xl">
              {entry.role}
            </h3>
            <p className="shrink-0 font-mono text-[0.6875rem] uppercase tracking-[0.06em] text-ink-muted">
              {entry.timeframe}
            </p>
          </div>

          <p className="mt-1 text-sm text-ink-muted">{entry.organization}</p>

          <p className="mt-3 max-w-[68ch] text-sm leading-relaxed text-ink">
            {entry.description}
          </p>

          <p className="mt-3 font-mono text-xs leading-relaxed text-ink-muted">
            {entry.technologies.join("  ·  ")}
          </p>
        </li>
      ))}
    </ol>
  );
}
