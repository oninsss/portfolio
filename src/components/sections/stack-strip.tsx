import type { CSSProperties } from "react";
import { profile, stack } from "@/content";
import { evidenceFor, evidenceSourceCount } from "@/lib/evidence";
import { TechLink } from "@/components/shared/tech-link";

function projectsUsing(items: string[]): number {
  return Array.from({ length: evidenceSourceCount }).filter((_, index) =>
    items.some((item) => evidenceFor(item)[index]),
  ).length;
}

export function StackStrip() {
  return (
    <section aria-labelledby="stack-claim">
      <h2
        id="stack-claim"
        className="rise text-xl font-medium tracking-tight text-ink sm:text-2xl"
        style={{ "--i": 1 } as CSSProperties}
      >
        {profile.statement}
      </h2>

      <ol className="mt-7 md:grid md:grid-cols-5">
        {stack.map((layer, index) => {
          const used = projectsUsing(layer.items);
          return (
            <li
              key={layer.label}
              style={{ "--i": index + 2 } as CSSProperties}
              className="rise group/layer relative border-l border-rule pb-7 pl-5 transition-colors duration-200 last:pb-0 hover:border-accent focus-within:border-accent md:border-l-0 md:border-t md:pb-0 md:pl-0 md:pr-6 md:pt-4"
            >
              <span
                aria-hidden="true"
                className="absolute -left-[4px] top-1.5 block h-[7px] w-[7px] bg-ink-muted/50 transition-[background-color,scale] duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover/layer:scale-150 group-hover/layer:bg-accent group-focus-within/layer:scale-150 group-focus-within/layer:bg-accent md:-top-[4px] md:left-0"
              />

              <h3 className="font-mono text-[0.6875rem] uppercase tracking-[0.08em]">
                <TechLink
                  techs={layer.items}
                  title={`See ${layer.label.toLowerCase()} in the Tech Stack`}
                  className="text-ink-muted transition-colors duration-200 group-hover/layer:text-accent"
                >
                  {layer.label}
                  <span className="sr-only"> in the Tech Stack</span>
                </TechLink>
              </h3>

              <ul className="mt-3 space-y-1 text-sm text-ink">
                {layer.items.map((item) => (
                  <li key={item}>
                    <TechLink tech={item} />
                  </li>
                ))}
              </ul>

              {used > 0 ? (
                <p className="mt-3 font-mono text-[0.6875rem] text-ink-muted">
                  Used in {used} {used === 1 ? "place" : "places"}
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
