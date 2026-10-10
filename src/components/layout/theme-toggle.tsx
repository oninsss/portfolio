"use client";

import { useSyncExternalStore, type ReactElement } from "react";

import { IconMonitor, IconMoon, IconSun } from "@/components/shared/icons";

type Theme = "system" | "light" | "dark";

const OPTIONS: {
  value: Theme;
  label: string;
  Icon: (props: { size?: number; className?: string }) => ReactElement;
}[] = [
  { value: "system", label: "System", Icon: IconMonitor },
  { value: "light", label: "Light", Icon: IconSun },
  { value: "dark", label: "Dark", Icon: IconMoon },
];

const CHANGE_EVENT = "portfolio:theme-change";

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(CHANGE_EVENT, onStoreChange);
  };
}

function getSnapshot(): Theme {
  try {
    const value = window.localStorage.getItem("theme");
    return value === "light" || value === "dark" ? value : "system";
  } catch {
    return "system";
  }
}

function getServerSnapshot(): Theme {
  return "system";
}

const FADE_MS = 420;

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => {
    ready: Promise<void>;
    finished: Promise<void>;
  };
};

function applyTheme(next: Theme, origin?: { x: number; y: number }) {
  const switchNow = () => {
    commitTheme(next);
  };

  const root = document.documentElement;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    switchNow();
    return;
  }

  const doc = document as ViewTransitionDocument;
  if (typeof doc.startViewTransition !== "function") {
    root.classList.add("theme-fade");
    switchNow();
    window.setTimeout(() => root.classList.remove("theme-fade"), 450);
    return;
  }

  const x = origin?.x ?? window.innerWidth / 2;
  const y = origin?.y ?? 0;

  root.classList.add("theme-switching");
  const transition = doc.startViewTransition(switchNow);
  transition.finished
    ?.catch(() => {})
    .finally(() => root.classList.remove("theme-switching"));

  transition.ready
    .then(() => {
      root.animate(
        {
          opacity: [0, 1],
          transform: ["scale(1.012)", "scale(1)"],
          transformOrigin: [`${x}px ${y}px`, `${x}px ${y}px`],
        },
        {
          duration: FADE_MS,
          easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    })
    .catch(() => {
    });
}

function commitTheme(next: Theme) {
  try {
    if (next === "system") {
      window.localStorage.removeItem("theme");
    } else {
      window.localStorage.setItem("theme", next);
    }
  } catch {
  }

  const root = document.documentElement;
  if (next === "system") {
    delete root.dataset.theme;
  } else {
    root.dataset.theme = next;
  }

  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <div
      role="group"
      aria-label="Colour theme"
      className="flex items-center gap-0.5"
    >
      {OPTIONS.map((option) => {
        const active = option.value === theme;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            aria-label={option.label}
            title={option.label}
            onClick={(event) => {
              if (active) return;
              const box = event.currentTarget.getBoundingClientRect();
              applyTheme(option.value, {
                x: box.left + box.width / 2,
                y: box.top + box.height / 2,
              });
            }}
            className={[
              "tab group cursor-pointer px-2 pt-1.5 pb-[7px] transition-colors duration-200",
              active ? "text-accent" : "text-ink-muted hover:text-ink",
            ].join(" ")}
          >
            <option.Icon
              size={16}
              className="transition-transform duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-110 group-active:scale-95"
            />
          </button>
        );
      })}
    </div>
  );
}
