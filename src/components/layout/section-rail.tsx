"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { readingSection } from "@/lib/assistant/reading";

const ITEMS = [
  { id: "introduction", label: "Introduction" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "certifications", label: "Certifications" },
  { id: "tech-stack", label: "Tech Stack" },
  { id: "contact", label: "Contact" },
] as const;

const REACH = 84;

function proximity(distance: number): number {
  const closeness = Math.max(0, 1 - distance / REACH);
  return closeness * closeness;
}

export function SectionRail() {
  const [active, setActive] = useState<string>("introduction");
  const items = useRef<(HTMLLIElement | null)[]>([]);
  const frame = useRef(0);
  const pointerY = useRef<number | null>(null);
  const reduced = useRef(false);

  useEffect(() => {
    let raf = 0;

    const update = () => {
      raf = 0;
      const reading = readingSection();
      setActive(
        reading === "home"
          ? "introduction"
          : reading === "footer"
            ? "contact"
            : reading,
      );
    };
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(update);
    };

    reduced.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
      if (frame.current) window.cancelAnimationFrame(frame.current);
    };
  }, []);

  const paint = () => {
    frame.current = 0;
    const y = pointerY.current;

    let nearest = -1;
    let nearestDistance = Infinity;
    items.current.forEach((item, index) => {
      if (!item || y === null) return;
      const box = item.getBoundingClientRect();
      const distance = Math.abs(y - (box.top + box.height / 2));
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = index;
      }
    });

    items.current.forEach((item, index) => {
      if (!item) return;
      let p = 0;
      if (y !== null) {
        const box = item.getBoundingClientRect();
        const distance = Math.abs(y - (box.top + box.height / 2));
        p = reduced.current ? (index === nearest ? 1 : 0) : proximity(distance);
      }
      item.style.setProperty("--p", p.toFixed(3));
    });
  };

  const schedule = (y: number | null) => {
    pointerY.current = y;
    if (!frame.current) frame.current = window.requestAnimationFrame(paint);
  };

  return (
    <nav
      aria-label="Sections"
      onPointerMove={(event) => {
        if (event.pointerType === "mouse") schedule(event.clientY);
      }}
      onPointerLeave={() => schedule(null)}
      className="fixed right-1 top-1/2 z-40 hidden -translate-y-1/2 px-1 py-6 md:block lg:right-2"
    >
      <ul className="flex flex-col items-end">
        {ITEMS.map((item, index) => {
          const current = item.id === active;
          return (
            <li
              key={item.id}
              ref={(element) => {
                items.current[index] = element;
              }}
              style={{ "--p": 0 } as CSSProperties}
              className="relative"
            >
              <a
                href={`#${item.id}`}
                aria-current={current ? "location" : undefined}
                onFocus={(event) => {
                  if (!event.currentTarget.matches(":focus-visible")) return;
                  const box = event.currentTarget.getBoundingClientRect();
                  schedule(box.top + box.height / 2);
                }}
                onBlur={() => schedule(null)}
                className="flex h-8 w-9 items-center justify-center focus-visible:outline-offset-[-2px]"
              >
                <span
                  aria-hidden="true"
                  className={[
                    "pointer-events-none absolute right-full mr-1 origin-right whitespace-nowrap font-mono text-[0.6875rem] leading-none",
                    "[opacity:clamp(0,calc((var(--p)-0.18)*2.2),1)] [scale:calc(0.88+var(--p)*0.14)] [translate:calc((1-var(--p))*10px)_0]",
                    "transition-[opacity,scale,translate,color] duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none",
                    current
                      ? "text-accent"
                      : "text-[color-mix(in_oklab,var(--accent)_calc(var(--p)*100%),var(--muted))]",
                  ].join(" ")}
                >
                  {item.label}
                </span>

                <span
                  aria-hidden="true"
                  className={[
                    "block [scale:calc(1+var(--p)*1.9)]",
                    "transition-[scale,background-color,width,height] duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none",
                    current
                      ? "h-2.5 w-2.5 bg-accent"
                      : "h-1.5 w-1.5 bg-[color-mix(in_oklab,var(--accent)_calc(var(--p)*100%),color-mix(in_oklab,var(--muted)_45%,transparent))]",
                  ].join(" ")}
                />
                <span className="sr-only">{item.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
