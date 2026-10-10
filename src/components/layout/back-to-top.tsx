"use client";

import { IconArrowUp } from "@/components/shared/icons";

export const GUIDE_EVENT = "portfolio:guide";

export function BackToTop() {
  return (
    <button
      type="button"
      onClick={() => {
        const taken = !window.dispatchEvent(
          new CustomEvent(GUIDE_EVENT, {
            cancelable: true,
            detail: { href: "#introduction", quiet: true },
          }),
        );
        if (!taken) window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      className="group inline-flex cursor-pointer items-center gap-2 border border-rule px-3 py-2 text-[0.8125rem] text-ink-muted transition-[color,border-color,translate] duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-0.5 hover:border-accent hover:text-accent"
    >
      Back to top
      <IconArrowUp
        size={14}
        className="transition-transform duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:-translate-y-0.5"
      />
    </button>
  );
}
