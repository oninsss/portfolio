"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import type { Face } from "./robot";
import { IconArrowUpRight } from "@/components/shared/icons";
import { heroLinks } from "@/content";
import { OPENINGS } from "@/lib/assistant/guide-script";
import { clamp } from "@/lib/assistant/journey";

export type PanelCloseReason = "escape" | "outside";

export type Destination = {
  label: string;
  href: string;
  anchor: "home" | "target";
  reply: string;
  face: Face;
};

export const DESTINATIONS: Destination[] = [
  {
    label: "Know me",
    href: "#introduction",
    anchor: "home",
    reply: OPENINGS.introduction.text,
    face: OPENINGS.introduction.face,
  },
  {
    label: "See my work",
    href: "#projects",
    anchor: "target",
    reply: OPENINGS.projects.text,
    face: OPENINGS.projects.face,
  },
  {
    label: "My experience",
    href: "#experience",
    anchor: "target",
    reply: OPENINGS.experience.text,
    face: OPENINGS.experience.face,
  },
  {
    label: "Let's talk",
    href: "#contact",
    anchor: "target",
    reply: OPENINGS.contact.text,
    face: OPENINGS.contact.face,
  },
];

const linkedin = heroLinks.find((link) => link.label === "LinkedIn")?.href;

const MARGIN = 12;
const GAP_SIDE = 16;
const GAP = 12;
const GAP_ABOVE = 24;
const TAIL_INSET = 18;
const PRESS_SETTLE_MS = 600;

type Side = "right" | "left" | "below" | "above";

type Placement = {
  left: number;
  top: number;
  tail: number;
  side: Side;
};

type AssistantPanelProps = {
  id: string;
  triggerRef: RefObject<HTMLElement | null>;
  kind: "tip" | "menu";
  text?: string;
  announce?: boolean;
  marginWidth?: number;
  autoFocus?: boolean;
  onClose: (reason: PanelCloseReason) => void;
  onPick: (destination: Destination) => void;
  onPresence?: (inside: boolean) => void;
};

export function AssistantPanel({
  id,
  triggerRef,
  kind,
  text,
  announce,
  marginWidth,
  autoFocus,
  onClose,
  onPick,
  onPresence,
}: AssistantPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<Placement | null>(null);
  const titleId = `${id}-title`;

  const handlers = useRef({ onClose });
  useEffect(() => {
    handlers.current = { onClose };
  }, [onClose]);

  useLayoutEffect(() => {
    const place = () => {
      const trigger = triggerRef.current;
      const panel = panelRef.current;
      if (!trigger || !panel) return;

      const t = trigger.getBoundingClientRect();
      const p = { width: panel.offsetWidth, height: panel.offsetHeight };
      const vw = document.documentElement.clientWidth;
      const vh = window.innerHeight;

      const onScreen = t.bottom > 0 && t.top < vh;
      const roomRight = vw - MARGIN - (t.right + GAP_SIDE);

      let side: Side;
      let left: number;
      let top: number;
      let tail: number;

      const marginal = kind === "tip" && marginWidth !== undefined;

      if (!marginal && roomRight >= p.width) {
        side = "right";
        left = t.right + GAP_SIDE;
        const centreY = t.top + t.height / 2;
        top = centreY - p.height / 2;
        if (onScreen && p.height <= vh - 2 * MARGIN) {
          top = clamp(top, MARGIN, vh - MARGIN - p.height);
        }
        tail = clamp(centreY - top, TAIL_INSET, Math.max(TAIL_INSET, p.height - TAIL_INSET));
      } else {
        const centreX = t.left + t.width / 2;
        left = clamp(
          marginal ? t.left : centreX - 28,
          MARGIN,
          Math.max(MARGIN, vw - MARGIN - p.width),
        );
        tail = clamp(
          centreX - left,
          TAIL_INSET,
          Math.max(TAIL_INSET, p.width - TAIL_INSET),
        );
        const fitsBelow = t.bottom + GAP + p.height <= vh - MARGIN;
        const fitsAbove = t.top - GAP_ABOVE - p.height >= MARGIN;
        side = onScreen && !fitsBelow && fitsAbove ? "above" : "below";
        top = side === "below" ? t.bottom + GAP : t.top - GAP_ABOVE - p.height;
      }

      setPos({
        left: left + window.scrollX,
        top: top + window.scrollY,
        tail,
        side,
      });
    };

    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [triggerRef, kind, text, marginWidth]);

  useEffect(() => {
    if (kind !== "menu") return;
    const panel = panelRef.current;
    if (!panel) return;

    if (autoFocus) panel.querySelector<HTMLElement>("a, button")?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        handlers.current.onClose("escape");
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (panel.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      handlers.current.onClose("outside");
    };

    // Safari never focuses a link or button that is pressed, so focus leaves the
    // panel with no related target the moment a finger or click lands on an
    // option. That looks like an outside click and would close the menu before
    // the option's click is delivered. Ignore focusout while a press that began
    // inside the panel is still settling (iOS sends its mouse events after the
    // finger lifts).
    let pressing = false;
    let settle: number | undefined;

    const onPanelPointerDown = () => {
      window.clearTimeout(settle);
      pressing = true;
    };

    const onPointerRelease = () => {
      if (!pressing) return;
      window.clearTimeout(settle);
      settle = window.setTimeout(() => {
        pressing = false;
      }, PRESS_SETTLE_MS);
    };

    const onFocusOut = (event: FocusEvent) => {
      if (pressing) return;
      const next = event.relatedTarget as Node | null;
      if (next && panel.contains(next)) return;
      if (next && triggerRef.current?.contains(next)) return;
      handlers.current.onClose("outside");
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("pointerup", onPointerRelease);
    document.addEventListener("pointercancel", onPointerRelease);
    panel.addEventListener("pointerdown", onPanelPointerDown);
    panel.addEventListener("focusout", onFocusOut);

    return () => {
      window.clearTimeout(settle);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("pointerup", onPointerRelease);
      document.removeEventListener("pointercancel", onPointerRelease);
      panel.removeEventListener("pointerdown", onPanelPointerDown);
      panel.removeEventListener("focusout", onFocusOut);
    };
  }, [triggerRef, kind, autoFocus]);

  const maxWidth = marginWidth !== undefined ? marginWidth + 24 : undefined;
  const style = {
    ...(pos
      ? { left: pos.left, top: pos.top, "--tail": `${pos.tail}px` }
      : { left: -9999, top: -9999 }),
    ...(maxWidth !== undefined ? { maxWidth } : null),
  } as CSSProperties;

  return createPortal(
    kind === "menu" ? (
      <div
        ref={panelRef}
        id={id}
        role="dialog"
        aria-modal="false"
        aria-labelledby={titleId}
        className="assist assist-menu"
        data-side={pos?.side ?? "below"}
        style={style}
        onPointerEnter={(event) =>
          event.pointerType === "mouse" && onPresence?.(true)
        }
        onPointerLeave={(event) =>
          event.pointerType === "mouse" && onPresence?.(false)
        }
      >
        <p id={titleId} className="text-sm font-medium text-ink">
          What can I show you?
        </p>

        <ul className="mt-3 divide-y divide-rule border-y border-rule">
          {DESTINATIONS.map((destination) => (
            <li key={destination.href}>
              <a
                href={destination.href}
                onClick={(event) => {
                  event.preventDefault();
                  onPick(destination);
                }}
                className="block py-3 text-sm text-ink transition-colors duration-150 hover:text-accent focus-visible:outline-offset-2"
              >
                {destination.label}
              </a>
            </li>
          ))}
          {linkedin ? (
            <li>
              <a
                href={linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-2 py-3 text-sm text-ink transition-colors duration-150 hover:text-accent focus-visible:outline-offset-2"
              >
                <span>
                  Connect on LinkedIn
                  <span className="sr-only"> (opens in a new tab)</span>
                </span>
                <IconArrowUpRight size={13} />
              </a>
            </li>
          ) : null}
        </ul>
      </div>
    ) : (
      <div
        ref={panelRef}
        id={id}
        role={announce ? "status" : undefined}
        aria-hidden={announce ? undefined : true}
        className="assist assist-tip"
        data-side={pos?.side ?? "below"}
        style={style}
      >
        <p className="text-sm leading-relaxed text-ink">{text}</p>
      </div>
    ),
    document.body,
  );
}
