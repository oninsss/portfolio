"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { skills } from "@/content";
import { FOCUS_TECH_EVENT, type FocusTechDetail } from "@/lib/focus-tech";
import {
  evidenceFor,
  moreProjects,
  siteSource,
  sources,
  visibleProjects,
  type Source,
} from "@/lib/evidence";

const CROSS_CUTTING = ["Languages", "Tools"];

const TINT = "bg-[color-mix(in_oklab,var(--accent)_9%,transparent)]";

type Row = { item: string; used: boolean[] };
type Layer = {
  group: string;
  index?: number;
  rows: Row[];
};

const toRows = (items: string[]): Row[] =>
  items.map((item) => ({ item, used: evidenceFor(item) }));

const layers: Layer[] = skills
  .filter((g) => !CROSS_CUTTING.includes(g.group))
  .map((g, i) => ({ group: g.group, index: i + 1, rows: toRows(g.items) }));

const across: Layer[] = skills
  .filter((g) => CROSS_CUTTING.includes(g.group))
  .map((g) => ({ group: g.group, rows: toRows(g.items) }));

const total = [...layers, ...across].reduce((n, l) => n + l.rows.length, 0);

const sourceIndex = new Map(sources.map((source, index) => [source.id, index]));

export function TechStack() {
  const [selectedId, setSelectedId] = useState<string | null>(
    visibleProjects[0]?.id ?? null,
  );
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [flash, setFlash] = useState<string[]>([]);

  useEffect(() => {
    let timer: number | undefined;
    const onFocusTech = (event: Event) => {
      const detail = (event as CustomEvent<FocusTechDetail>).detail;
      if (detail?.source && sourceIndex.has(detail.source)) {
        setSelectedId(detail.source);
        return;
      }
      if (detail?.techs?.length) {
        setSelectedId(null);
        setFlash(detail.techs);
        window.clearTimeout(timer);
        timer = window.setTimeout(() => setFlash([]), 2600);
        return;
      }
      const tech = detail?.tech;
      if (!tech) return;
      const used = evidenceFor(tech);
      const first = used.findIndex(Boolean);
      setSelectedId((current) => {
        const at = current ? sourceIndex.get(current) : undefined;
        if (at !== undefined && used[at]) return current;
        return first >= 0 ? sources[first].id : null;
      });
      setFlash([tech]);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setFlash([]), 2600);
    };
    window.addEventListener(FOCUS_TECH_EVENT, onFocusTech);
    return () => {
      window.removeEventListener(FOCUS_TECH_EVENT, onFocusTech);
      window.clearTimeout(timer);
    };
  }, []);

  const selected = selectedId ? sources[sourceIndex.get(selectedId) ?? -1] : null;
  const selectedAt = selected ? (sourceIndex.get(selected.id) ?? null) : null;

  const extra =
    selected && moreProjects.some((p) => p.id === selected.id) ? selected : null;
  const columns: Source[] = [
    ...visibleProjects,
    ...(extra ? [extra] : []),
    siteSource,
  ];

  const keeps = (row: Row) => selectedAt === null || row.used[selectedAt];
  const shown = [...layers, ...across].reduce(
    (n, l) => n + l.rows.filter(keeps).length,
    0,
  );
  const acrossVisible = across.some((l) => l.rows.some(keeps));

  const template = {
    gridTemplateColumns: `minmax(0, 1fr) repeat(${columns.length}, var(--col))`,
  };

  const toggle = (id: string) =>
    setSelectedId((current) => (current === id ? null : id));

  return (
    <div
      onKeyDown={(event) => {
        if (event.key === "Escape") setSelectedId(null);
      }}
    >
      <div className="flex max-w-[36rem] flex-wrap items-center justify-between gap-x-4 gap-y-2 pb-3">
        <p
          aria-live="polite"
          className="text-xs leading-relaxed text-ink-muted"
        >
          {selected ? (
            <>
              <span className="text-ink">{shown}</span> of {total} used in{" "}
              <span className="text-ink">{selected.name}</span>.{" "}
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="cursor-pointer text-accent underline decoration-transparent underline-offset-4 transition-[text-decoration-color] duration-150 hover:decoration-accent"
              >
                Show all
              </button>
            </>
          ) : (
            "Pick a project or role to see only what it used."
          )}
        </p>

        <MoreProjects
          selectedId={selectedId}
          onPick={(id) => setSelectedId(id)}
        />
      </div>

      <div
        role="table"
        aria-label="Technologies by layer, and the projects and roles each one appears in"
        className="max-w-[36rem] [--col:4rem] sm:[--col:5.5rem]"
      >
        <div role="rowgroup">
          <div role="row" className="grid" style={template}>
            <div role="columnheader" className="pb-2">
              <span className="sr-only">Technology</span>
            </div>

            {columns.map((source) => {
              const isSelected = selectedId === source.id;
              const quiet = selectedId !== null && !isSelected;
              return (
                <div
                  key={source.id}
                  role="columnheader"
                  className={[
                    "pb-2 text-center align-bottom transition-colors duration-150",
                    isSelected || hoveredId === source.id ? TINT : "",
                  ].join(" ")}
                >
                  <button
                    type="button"
                    aria-pressed={isSelected}
                    title={`${source.name}: press to see only what it used`}
                    onClick={() => toggle(source.id)}
                    onPointerEnter={() => setHoveredId(source.id)}
                    onPointerLeave={() => setHoveredId(null)}
                    onFocus={() => setHoveredId(source.id)}
                    onBlur={() => setHoveredId(null)}
                    className={[
                      "mx-auto block cursor-pointer whitespace-nowrap px-1 py-1.5 font-mono text-[0.625rem] uppercase leading-none tracking-[0.06em] transition-[color,opacity] duration-150 focus-visible:outline-offset-2",
                      isSelected
                        ? "text-accent"
                        : quiet
                          ? "text-ink-muted opacity-40 hover:opacity-100"
                          : "text-ink-muted hover:text-ink",
                    ].join(" ")}
                  >
                    <span
                      aria-hidden="true"
                      className={[
                        "flex h-9 w-9 items-center justify-center border text-[0.6875rem] tracking-[0.04em] transition-colors duration-150 sm:hidden",
                        isSelected ? "border-accent" : "border-rule",
                      ].join(" ")}
                    >
                      {source.mark}
                    </span>
                    <span className="sr-only sm:not-sr-only">{source.label}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {layers.map((layer) => (
          <LayerBlock
            key={layer.group}
            layer={layer}
            columns={columns}
            template={template}
            selectedId={selectedId}
            selectedAt={selectedAt}
            hoveredId={hoveredId}
            flash={flash}
          />
        ))}

        <Fold open={acrossVisible}>
          <div role="rowgroup">
            <div role="row">
              <div
                role="rowheader"
                aria-colspan={columns.length + 1}
                className="border-t border-rule pt-4 pb-1.5 text-left font-mono text-[0.625rem] uppercase tracking-[0.08em] text-ink-muted"
              >
                Across every layer
              </div>
            </div>
          </div>
        </Fold>

        {across.map((layer) => (
          <LayerBlock
            key={layer.group}
            layer={layer}
            columns={columns}
            template={template}
            selectedId={selectedId}
            selectedAt={selectedAt}
            hoveredId={hoveredId}
            flash={flash}
          />
        ))}
      </div>

      <ul
        aria-hidden="true"
        className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-ink-muted sm:hidden"
      >
        {columns.map((source) => (
          <li key={source.id} className="flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center border border-rule font-mono text-[0.5625rem] uppercase">
              {source.mark}
            </span>
            {source.label}
          </li>
        ))}
      </ul>

      <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs leading-relaxed text-ink-muted">
        <span aria-hidden="true" className="inline-block h-2 w-2 bg-accent" />
        <span>Used in that project or role.</span>
      </p>
    </div>
  );
}

function Fold({ open, children }: { open: boolean; children: ReactNode }) {
  return (
    <div className="panel" data-open={open ? "true" : "false"}>
      <div className="panel-inner">{children}</div>
    </div>
  );
}

function LayerBlock({
  layer,
  columns,
  template,
  selectedId,
  selectedAt,
  hoveredId,
  flash,
}: {
  layer: Layer;
  columns: Source[];
  template: { gridTemplateColumns: string };
  selectedId: string | null;
  selectedAt: number | null;
  hoveredId: string | null;
  flash: string[];
}) {
  const keeps = (row: Row) => selectedAt === null || row.used[selectedAt];
  const layerOpen = layer.rows.some(keeps);

  return (
    <Fold open={layerOpen}>
      <div role="rowgroup">
        <div role="row">
          <div
            role="rowheader"
            aria-colspan={columns.length + 1}
            className="border-t border-rule bg-[color-mix(in_oklab,var(--ink)_3%,transparent)] px-3 py-1.5 text-left font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-ink-muted"
          >
            {layer.index ? (
              <span className="mr-2 text-ink-muted/60">
                {String(layer.index).padStart(2, "0")}
              </span>
            ) : null}
            {layer.group}
          </div>
        </div>

        {layer.rows.map((row) => (
          <Fold key={row.item} open={keeps(row)}>
            <div
              role="row"
              className={[
                "group/row grid border-t border-rule/60 transition-colors duration-500 hover:bg-[color-mix(in_oklab,var(--accent)_5%,transparent)]",
                flash.includes(row.item)
                  ? "bg-[color-mix(in_oklab,var(--accent)_16%,transparent)]"
                  : "",
              ].join(" ")}
              style={template}
            >
              <div
                role="rowheader"
                className="px-3 py-1.5 text-left text-[0.8125rem] leading-snug text-ink transition-colors duration-150 group-hover/row:text-accent"
              >
                {row.item}
              </div>

              {columns.map((source) => {
                const at = sourceIndex.get(source.id) ?? 0;
                const isUsed = row.used[at];
                const isSelected = selectedId === source.id;
                const quiet = selectedId !== null && !isSelected;

                return (
                  <div
                    key={source.id}
                    role="cell"
                    className={[
                      "py-1.5 text-center transition-colors duration-150",
                      isSelected || hoveredId === source.id ? TINT : "",
                    ].join(" ")}
                  >
                    {isUsed ? (
                      <>
                        <span
                          aria-hidden="true"
                          className={[
                            "mx-auto block transition-[width,height,background-color] duration-150 group-hover/row:scale-125",
                            isSelected ? "h-2.5 w-2.5" : "h-2 w-2",
                            quiet ? "bg-ink-muted/35" : "bg-accent",
                          ].join(" ")}
                        />
                        <span className="sr-only">Used in {source.name}</span>
                      </>
                    ) : (
                      <span
                        aria-hidden="true"
                        className="mx-auto block h-px w-2 bg-rule"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </Fold>
        ))}
      </div>
    </Fold>
  );
}

function MoreProjects({
  selectedId,
  onPick,
}: {
  selectedId: string | null;
  onPick: (id: string) => void;
}) {
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const details = ref.current;
    if (!details) return;
    const onPointerDown = (event: PointerEvent) => {
      if (details.open && !details.contains(event.target as Node)) {
        details.open = false;
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && details.open) {
        details.open = false;
        details.querySelector("summary")?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  if (moreProjects.length === 0) {
    return (
      <button
        type="button"
        disabled
        title="Every project already has its own column. Later ones will appear here."
        className="inline-flex cursor-not-allowed items-center gap-1.5 border border-dashed border-rule px-3 py-1.5 text-[0.8125rem] text-ink-muted/60"
      >
        <span>More projects</span>
        <svg
          viewBox="0 0 12 12"
          width="11"
          height="11"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M2 4.5 6 8.5 10 4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    );
  }

  return (
    <details ref={ref} className="relative">
      <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 border border-rule px-3 py-1.5 text-[0.8125rem] text-ink-muted transition-colors duration-150 hover:border-accent hover:text-accent focus-visible:outline-offset-3 [&::-webkit-details-marker]:hidden">
        <span>More projects ({moreProjects.length})</span>
        <svg
          viewBox="0 0 12 12"
          width="11"
          height="11"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M2 4.5 6 8.5 10 4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </summary>

      <ul className="cert-body absolute right-0 z-20 mt-1 max-h-64 w-64 overflow-y-auto border border-rule bg-canvas p-1">
        {moreProjects.map((project) => (
          <li key={project.id}>
            <button
              type="button"
              aria-pressed={selectedId === project.id}
              onClick={() => {
                onPick(project.id);
                if (ref.current) ref.current.open = false;
              }}
              className={[
                "block w-full cursor-pointer px-3 py-2 text-left text-[0.8125rem] transition-colors duration-150 hover:bg-[color-mix(in_oklab,var(--accent)_8%,transparent)] hover:text-accent",
                selectedId === project.id ? "text-accent" : "text-ink",
              ].join(" ")}
            >
              {project.name}
            </button>
          </li>
        ))}
      </ul>
    </details>
  );
}
