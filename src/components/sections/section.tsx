import type { ReactNode } from "react";

type SectionProps = {
  id: string;
  label: string;
  note?: string;
  children: ReactNode;
};

export function Section({ id, label, note, children }: SectionProps) {
  return (
    <section id={id} className="border-t border-rule pt-7 sm:pt-9">
      <div className="grid gap-5 sm:grid-cols-[8.5rem_1fr] sm:gap-8 lg:grid-cols-[11rem_1fr]">
        <div data-rail="" className="min-w-0">
          <h2 className="flex items-center gap-2 font-mono text-xs font-medium tracking-[0.02em] text-ink sm:text-[0.8125rem]">
            <span
              aria-hidden="true"
              className="section-marker block h-1.5 w-1.5 shrink-0 bg-accent"
            />
            <span>{label}</span>
          </h2>
          {note ? (
            <p className="mt-2 max-w-[16rem] text-xs leading-relaxed text-ink-muted">
              {note}
            </p>
          ) : null}
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}
