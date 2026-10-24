"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  AssistantPanel,
  DESTINATIONS,
  type Destination,
  type PanelCloseReason,
} from "./assistant-panel";
import { GUIDE_EVENT } from "@/components/layout/back-to-top";
import { RobotParts, type Act, type Face } from "./robot";
import { BOOT_EVENT } from "@/lib/assistant/boot";
import { REVISIT, linesFor, type Line } from "@/lib/assistant/guide-script";
import {
  RESUME_QUIP,
  THEME_QUIPS,
  nextQuip,
  type Quip,
} from "@/lib/assistant/quips";
import {
  clamp,
  glide,
  legDuration,
  travel,
  type Point,
} from "@/lib/assistant/journey";
import { readingSection } from "@/lib/assistant/reading";

const GREETING: Line[] = [
  { text: "Hi! I'm your guide.", face: "happy" },
  { text: "Check me!", face: "wink" },
];
const CHECK_ME: Line[] = [{ text: "Check me!", face: "wink" }];
const CHECK_DELAY_MS = 1200;

const READ_BASE_MS = 1400;
const READ_PER_CHAR_MS = 45;
const READ_MIN_MS = 2400;
const READ_MAX_MS = 5200;

const QUIP_EVERY_MS = 15000;
const QUIP_SPREAD_MS = 9000;
const QUIP_RETRY_MS = 2500;
const REACT_COOLDOWN_MS = 12000;

const ACT_MS: Record<Act, number> = { wave: 1700, dance: 2700 };

const BLINK_EVERY_MIN_MS = 2800;
const BLINK_EVERY_SPREAD_MS = 3400;
const BLINK_MS = 150;

const HOVER_OPEN_MS = 140;
const HOVER_CLOSE_MS = 320;

const ACK_MS = 520;
const ARRIVE_MS = 150;
const TRAVEL_MIN_MS = 600;
const TRAVEL_MAX_MS = 1400;
const HOP_MIN_MS = 500;
const HOP_MAX_MS = 1100;
const ANCHOR_MARGIN = 20;
const EDGE = 6;
const EDGE_TOP = 18;

const RAIL_GAP = 14;
const POST_GAP = 6;
const POST_LEAD = 30;

const DWELL_MS = 1800;
const HOME_DWELL_MS = 450;
const OFFSCREEN_MARGIN = 48;

type AssistantCubeProps = {
  className: string;
};

type Say = Line & { id: number; announce: boolean };

type Flight = "out" | "hop" | "back";

type OpenMode = "hover" | "click";

const reduced = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const readMs = (text: string) =>
  clamp(READ_BASE_MS + text.length * READ_PER_CHAR_MS, READ_MIN_MS, READ_MAX_MS);

function hop(el: HTMLElement | null) {
  if (!el || typeof el.animate !== "function") return;
  if (reduced()) return;
  el.animate(
    [
      { transform: "translateY(0) scale(1, 1)" },
      { transform: "translateY(-7px) scale(0.95, 1.07)", offset: 0.28 },
      { transform: "translateY(0) scale(1.07, 0.93)", offset: 0.55 },
      { transform: "translateY(0) scale(0.99, 1.02)", offset: 0.8 },
      { transform: "translateY(0) scale(1, 1)" },
    ],
    { duration: 560, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" },
  );
}

const isAway = (el: HTMLElement) =>
  el.hasAttribute("data-journey") || el.hasAttribute("data-parked");

function robotPoint(el: HTMLElement): Point {
  const box = el.getBoundingClientRect();
  return {
    x: box.left + box.width / 2 - el.offsetWidth / 2 + window.scrollX,
    y: box.top + box.height / 2 - el.offsetHeight / 2 + window.scrollY,
  };
}

function homePoint(el: HTMLElement, slot: HTMLElement): Point {
  if (!isAway(el)) return robotPoint(el);
  const box = slot.getBoundingClientRect();
  return {
    x: box.left + box.width / 2 - el.offsetWidth / 2 + window.scrollX,
    y: box.top + box.height / 2 - el.offsetHeight / 2 + window.scrollY,
  };
}

type Post = {
  at: Point;
  kind: "rail" | "rule";
  railWidth: number;
};

function postFor(id: string, el: HTMLElement): Post | null {
  const section = document.getElementById(id);
  if (!section) return null;

  const box = section.getBoundingClientRect();
  const column =
    section.querySelector<HTMLElement>("[data-post-anchor]") ?? section;
  const inset = Number.parseFloat(getComputedStyle(column).paddingLeft) || 0;
  const x = Math.max(
    EDGE,
    column.getBoundingClientRect().left + inset + window.scrollX,
  );
  const rail = section.querySelector<HTMLElement>("[data-rail]");

  if (rail && window.matchMedia("(min-width: 640px)").matches) {
    const railBox = rail.getBoundingClientRect();
    const last = rail.lastElementChild?.getBoundingClientRect() ?? railBox;
    return {
      kind: "rail",
      railWidth: railBox.width,
      at: { x, y: last.bottom + window.scrollY + RAIL_GAP },
    };
  }

  return {
    kind: "rule",
    railWidth: 0,
    at: { x, y: box.top + window.scrollY - el.offsetHeight - POST_GAP },
  };
}

function liftOff(
  el: HTMLElement,
  slot: HTMLElement,
  at: Point,
  state: "journey" | "parked",
) {
  slot.setAttribute("data-held", "");
  el.style.left = `${at.x}px`;
  el.style.top = `${at.y}px`;
  el.removeAttribute(state === "journey" ? "data-parked" : "data-journey");
  el.setAttribute(state === "journey" ? "data-journey" : "data-parked", "");
  el.style.transform = state === "journey" ? "none" : "";
}

function backHome(el: HTMLElement, slot: HTMLElement) {
  el.removeAttribute("data-journey");
  el.removeAttribute("data-parked");
  el.style.left = "";
  el.style.top = "";
  el.style.transform = "";
  slot.removeAttribute("data-held");
}

export function AssistantCube({ className }: AssistantCubeProps) {
  const [ready, setReady] = useState(false);
  const [openMode, setOpenMode] = useState<OpenMode | null>(null);
  const [say, setSay] = useState<Say | null>(null);
  const [ack, setAck] = useState(false);
  const [hot, setHot] = useState(false);
  const [flight, setFlight] = useState<Flight | null>(null);
  const [rail, setRail] = useState<number | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const slotRef = useRef<HTMLSpanElement>(null);
  const panelId = useId();
  const timers = useRef(new Set<number>());
  const ackToken = useRef(0);
  const sayToken = useRef(0);
  const sayCount = useRef(0);
  const actTimer = useRef<number | undefined>(undefined);
  const lastReact = useRef(0);
  const hoverTimer = useRef<number | undefined>(undefined);
  const runToken = useRef(0);
  const journeyTimers = useRef<number[]>([]);
  const postRef = useRef("home");
  const visited = useRef(new Set<string>());
  const busy = useRef(false);
  const held = useRef(false);
  const inView = useRef(true);

  useEffect(() => {
    busy.current =
      openMode !== null || say !== null || ack || hot || flight !== null;
    held.current = openMode !== null || hot || ack;
  }, [openMode, say, ack, hot, flight]);

  const after = useCallback((ms: number, run: () => void) => {
    const id = window.setTimeout(() => {
      timers.current.delete(id);
      run();
    }, ms);
    timers.current.add(id);
    return id;
  }, []);

  const speakLines = useCallback(
    (lines: Line[], announceFirst = false) => {
      const token = (sayToken.current += 1);
      const step = (index: number) => {
        if (sayToken.current !== token) return;
        if (index >= lines.length) {
          setSay(null);
          return;
        }
        const next = lines[index];
        sayCount.current += 1;
        setSay({
          ...next,
          id: sayCount.current,
          announce: announceFirst && index === 0,
        });
        after(readMs(next.text), () => step(index + 1));
      };
      step(0);
    },
    [after],
  );

  const hush = useCallback(() => {
    sayToken.current += 1;
    setSay(null);
  }, []);

  const playAct = useCallback((act: Act) => {
    const el = triggerRef.current;
    if (!el || reduced() || el.hasAttribute("data-journey")) return;
    window.clearTimeout(actTimer.current);
    el.setAttribute("data-act", act);
    actTimer.current = window.setTimeout(() => {
      el.removeAttribute("data-act");
    }, ACT_MS[act]);
  }, []);

  const tell = useCallback(
    (remark: Quip) => {
      speakLines([{ text: remark.text, face: remark.face }]);
      if (remark.act) playAct(remark.act);
    },
    [speakLines, playAct],
  );

  /** A small gesture the first time the guide reaches the contact section or the end of the page. */
  const celebrate = useCallback(
    (id: string) => {
      if (id === "contact") playAct("wave");
      else if (id === "footer") playAct("dance");
    },
    [playAct],
  );

  const clearHover = useCallback(() => {
    if (hoverTimer.current === undefined) return;
    window.clearTimeout(hoverTimer.current);
    timers.current.delete(hoverTimer.current);
    hoverTimer.current = undefined;
  }, []);

  const cancelJourney = useCallback(() => {
    runToken.current += 1;
    journeyTimers.current.forEach((id) => window.clearTimeout(id));
    journeyTimers.current = [];
    const el = triggerRef.current;
    const slot = slotRef.current;
    if (el && slot && isAway(el)) backHome(el, slot);
    postRef.current = "home";
  }, []);

  const park = useCallback((id: string) => {
    const el = triggerRef.current;
    const slot = slotRef.current;
    if (!el || !slot) return;
    el.removeAttribute("data-journey");
    el.setAttribute("data-parked", "");
    el.style.transform = "";
    postRef.current = id;
    const post = postFor(id, el);
    setRail(post?.kind === "rail" ? post.railWidth : null);
  }, []);

  const settleHome = useCallback(() => {
    const el = triggerRef.current;
    const slot = slotRef.current;
    if (!el || !slot) return;
    backHome(el, slot);
    postRef.current = "home";
    setRail(null);
  }, []);

  const flyTo = useCallback(
    (to: Point, kind: "hop" | "back", done: () => void) => {
      const el = triggerRef.current;
      const slot = slotRef.current;
      if (!el || !slot) return;

      journeyTimers.current.forEach((id) => window.clearTimeout(id));
      journeyTimers.current = [];
      const token = (runToken.current += 1);
      const alive = () => runToken.current === token;

      const now = isAway(el) ? robotPoint(el) : homePoint(el, slot);
      const top = window.scrollY;
      const from = {
        x: now.x,
        y: clamp(
          now.y,
          top - el.offsetHeight - OFFSCREEN_MARGIN,
          top + window.innerHeight + OFFSCREEN_MARGIN,
        ),
      };

      liftOff(el, slot, from, "journey");
      setFlight(kind);

      glide({
        from,
        to,
        duration: legDuration(
          Math.hypot(to.x - from.x, to.y - from.y),
          HOP_MIN_MS,
          HOP_MAX_MS,
        ),
        instant: reduced(),
        alive,
        apply: (point) => {
          el.style.left = `${point.x}px`;
          el.style.top = `${point.y}px`;
        },
        onDone: () => {
          if (!alive()) return;
          setFlight(null);
          hop(el);
          done();
        },
      });
    },
    [],
  );

  const follow = useCallback(
    (id: string) => {
      const el = triggerRef.current;
      const slot = slotRef.current;
      if (!el || !slot || el.hasAttribute("data-journey")) return;

      if (id === "home") {
        postRef.current = "home";
        flyTo(homePoint(el, slot), "back", settleHome);
        return;
      }

      const post = postFor(id, el);
      if (!post) return;
      postRef.current = id;
      hush();
      flyTo(post.at, "hop", () => {
        park(id);
        const first = !visited.current.has(id);
        visited.current.add(id);
        speakLines(first ? linesFor(id, "hop") : REVISIT);
        if (first) celebrate(id);
      });
    },
    [flyTo, hush, park, settleHome, speakLines, celebrate],
  );

  useEffect(() => {
    const pending = timers.current;
    const opener = document.documentElement.dataset.opener;

    const start = (booted: boolean) => {
      setReady(true);
      if (booted) {
        hop(triggerRef.current);
        playAct("wave");
        speakLines(GREETING);
      } else {
        after(CHECK_DELAY_MS, () => speakLines(CHECK_ME));
      }
    };

    const onBoot = () => start(true);
    if (opener === "run") {
      window.addEventListener(BOOT_EVENT, onBoot, { once: true });
    } else {
      after(0, () => start(opener === "done"));
    }

    return () => {
      window.removeEventListener(BOOT_EVENT, onBoot);
      pending.forEach((id) => window.clearTimeout(id));
      pending.clear();
    };
  }, [after, speakLines, playAct]);

  useEffect(
    () => () => {
      window.clearTimeout(actTimer.current);
    },
    [],
  );

  useEffect(() => cancelJourney, [cancelJourney]);

  useEffect(() => {
    const el = triggerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView.current = entry.isIntersecting;
      },
      { threshold: 0.6 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = triggerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      const id = postRef.current;
      if (id === "home" || !el.hasAttribute("data-parked")) return;
      const post = postFor(id, el);
      if (!post) return;
      el.style.left = `${post.at.x}px`;
      el.style.top = `${post.at.y}px`;
      const width = post.kind === "rail" ? post.railWidth : null;
      setRail((current) => (current === width ? current : width));
    });
    observer.observe(document.body);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!ready) return;
    let frame = 0;
    let dwell: number | undefined;
    let pending: string | null = null;

    const settle = () => {
      if (dwell !== undefined) window.clearTimeout(dwell);
      dwell = undefined;
      pending = null;
    };

    const commit = (id: string) => {
      dwell = undefined;
      if (readingSection() !== id || postRef.current === id) {
        pending = null;
        return;
      }
      if (triggerRef.current?.hasAttribute("data-journey") || held.current) {
        dwell = window.setTimeout(() => commit(id), 800);
        return;
      }
      pending = null;
      follow(id);
    };

    const check = () => {
      frame = 0;
      const id = readingSection();
      if (id === postRef.current) {
        settle();
        return;
      }
      if (pending === id) return;
      settle();
      pending = id;
      dwell = window.setTimeout(
        () => commit(id),
        id === "home" ? HOME_DWELL_MS : DWELL_MS,
      );
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(check);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
      settle();
    };
  }, [ready, follow]);

  useEffect(() => {
    if (!ready) return;
    let id: number;

    function schedule(ms: number) {
      id = window.setTimeout(tick, ms);
    }
    function tick() {
      if (document.hidden || busy.current || !inView.current) {
        schedule(QUIP_RETRY_MS);
        return;
      }
      const remark = nextQuip(postRef.current);
      if (remark) tell(remark);
      schedule(QUIP_EVERY_MS + Math.random() * QUIP_SPREAD_MS);
    }

    schedule(QUIP_EVERY_MS + Math.random() * QUIP_SPREAD_MS);
    return () => window.clearTimeout(id);
  }, [ready, tell]);

  useEffect(() => {
    if (!ready) return;

    const react = (remarks: Quip[]) => {
      const now = Date.now();
      if (busy.current || now - lastReact.current < REACT_COOLDOWN_MS) return;
      lastReact.current = now;
      tell(remarks[Math.floor(Math.random() * remarks.length)]);
    };

    let theme = document.documentElement.dataset.theme ?? "system";
    const observer = new MutationObserver(() => {
      const next = document.documentElement.dataset.theme ?? "system";
      if (next === theme) return;
      theme = next;
      const pool = next === "dark" || next === "light" ? THEME_QUIPS[next] : THEME_QUIPS.system;
      react(pool);
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest("a[download]");
      if (link) react([RESUME_QUIP]);
    };
    document.addEventListener("click", onClick);

    return () => {
      observer.disconnect();
      document.removeEventListener("click", onClick);
    };
  }, [ready, tell]);

  useEffect(() => {
    if (!ready) return;
    if (reduced()) return;
    const el = triggerRef.current;
    let id: number;

    function schedule() {
      id = window.setTimeout(
        blink,
        BLINK_EVERY_MIN_MS + Math.random() * BLINK_EVERY_SPREAD_MS,
      );
    }
    function blink() {
      if (el && !document.hidden && !el.hasAttribute("data-journey")) {
        el.setAttribute("data-blink", "");
        id = window.setTimeout(() => {
          el.removeAttribute("data-blink");
          schedule();
        }, BLINK_MS);
      } else {
        schedule();
      }
    }

    schedule();
    return () => {
      window.clearTimeout(id);
      el?.removeAttribute("data-blink");
    };
  }, [ready]);

  const close = (reason: PanelCloseReason) => {
    clearHover();
    setOpenMode(null);
    if (reason === "escape" && openMode === "click") {
      triggerRef.current?.focus();
    }
  };

  const isTravelling = () =>
    !!triggerRef.current?.hasAttribute("data-journey");

  const toggle = () => {
    if (isTravelling()) return;
    clearHover();
    hush();
    setOpenMode((mode) => (mode === "click" ? null : "click"));
  };

  const hoverOpen = () => {
    clearHover();
    hoverTimer.current = after(HOVER_OPEN_MS, () => {
      hoverTimer.current = undefined;
      if (isTravelling()) return;
      hush();
      setOpenMode((mode) => mode ?? "hover");
    });
  };

  const hoverLeave = () => {
    clearHover();
    hoverTimer.current = after(HOVER_CLOSE_MS, () => {
      hoverTimer.current = undefined;
      setOpenMode((mode) => (mode === "hover" ? null : mode));
    });
  };

  const beginTransit = (
    destination: Destination,
    anchor: HTMLElement,
    quiet = false,
  ) => {
    const el = triggerRef.current;
    const slot = slotRef.current;
    if (!el || !slot) return;

    const id = destination.href.slice(1);
    const toHome = destination.anchor === "home";

    const root = document.documentElement;
    const vw = root.clientWidth;
    const vh = window.innerHeight;
    const scroll0 = window.scrollY;
    const maxScroll = Math.max(0, root.scrollHeight - vh);
    const instant = reduced();
    const size = { w: el.offsetWidth, h: el.offsetHeight };

    const anchorTop = anchor.getBoundingClientRect().top + scroll0;
    const post = toHome ? null : postFor(id, el);
    const scroll1 = clamp(
      quiet && toHome
        ? 0
        : post?.kind === "rule"
          ? anchorTop - (size.h + POST_LEAD)
          : anchorTop - ANCHOR_MARGIN,
      0,
      maxScroll,
    );

    const home = homePoint(el, slot);
    const landing = post?.at ?? home;
    const here = robotPoint(el);

    const dest = {
      x: clamp(landing.x, EDGE, vw - EDGE - size.w),
      y: clamp(landing.y - scroll1, EDGE_TOP, vh - EDGE - size.h),
    };
    const from = {
      x: clamp(here.x - window.scrollX, EDGE, vw - EDGE - size.w),
      y: clamp(here.y - scroll0, EDGE_TOP, vh - EDGE - size.h),
    };

    liftOff(el, slot, { x: from.x + window.scrollX, y: from.y + scroll0 }, "journey");
    setFlight("out");

    journeyTimers.current.forEach((timer) => window.clearTimeout(timer));
    const local: number[] = [];
    journeyTimers.current = local;
    const token = (runToken.current += 1);
    const alive = () => runToken.current === token;
    const later = (ms: number, run: () => void) => {
      local.push(window.setTimeout(run, ms));
    };
    const applyOnScreen = (point: Point) => {
      el.style.left = `${point.x + window.scrollX}px`;
      el.style.top = `${point.y + window.scrollY}px`;
    };

    const arrive = () => {
      if (!alive()) return;
      setFlight(null);
      hop(el);

      if (toHome) {
        settleHome();
      } else {
        park(id);
        if (!anchor.hasAttribute("tabindex")) {
          anchor.setAttribute("tabindex", "-1");
        }
        anchor.focus({ preventScroll: true });
      }
      const firstVisit = !visited.current.has(id);
      visited.current.add(id);

      later(ARRIVE_MS, () => {
        if (!alive()) return;
        if (quiet) speakLines([{ text: "Back at the top.", face: "happy" }]);
        else {
          speakLines(linesFor(id, "tour"), true);
          if (firstVisit) celebrate(id);
        }
      });
    };

    travel({
      from,
      scrollFrom: scroll0,
      scrollTo: scroll1,
      duration: legDuration(
        Math.max(
          Math.hypot(dest.x - from.x, dest.y - from.y),
          Math.abs(scroll1 - scroll0),
        ),
        TRAVEL_MIN_MS,
        TRAVEL_MAX_MS,
      ),
      instant,
      alive,
      target: (scrollY) => ({
        x: dest.x,
        y: clamp(landing.y - scrollY, EDGE_TOP, vh - EDGE - size.h),
      }),
      apply: applyOnScreen,
      onDone: (outcome) => {
        if (!alive()) return;
        if (outcome === "interrupted") {
          el.style.left = `${dest.x + window.scrollX}px`;
          el.style.top = `${dest.y + scroll1}px`;
        }
        arrive();
      },
    });
  };

  const pick = (destination: Destination, options?: { quiet?: boolean }) => {
    if (isTravelling()) return;

    clearHover();
    setOpenMode(null);
    hush();

    const token = (ackToken.current += 1);
    setAck(true);
    after(ACK_MS, () => {
      if (ackToken.current === token) setAck(false);
    });

    const anchor = document.getElementById(destination.href.slice(1));
    if (!anchor) {
      speakLines([{ text: destination.reply, face: destination.face }], true);
      return;
    }

    history.pushState(null, "", destination.href);
    triggerRef.current?.focus({ preventScroll: true });
    beginTransit(destination, anchor, options?.quiet);
  };

  const pickRef = useRef(pick);
  useEffect(() => {
    pickRef.current = pick;
  });

  useEffect(() => {
    const onGuide = (event: Event) => {
      const detail = (event as CustomEvent<{ href: string; quiet?: boolean }>)
        .detail;
      const destination = DESTINATIONS.find((d) => d.href === detail?.href);
      const el = triggerRef.current;
      if (!destination || !el || el.disabled || el.hasAttribute("data-journey")) {
        return;
      }
      event.preventDefault();
      pickRef.current(destination, { quiet: detail.quiet });
    };
    window.addEventListener(GUIDE_EVENT, onGuide);
    return () => window.removeEventListener(GUIDE_EVENT, onGuide);
  }, []);

  const disabled = !ready;
  const face: Face = disabled
    ? "sleep"
    : ack
      ? "wink"
      : flight === "out"
        ? "wow"
        : flight !== null
          ? "happy"
          : say
            ? say.face
            : openMode !== null || hot
              ? "happy"
              : "smile";

  const surface: "menu" | "tip" | null = disabled
    ? null
    : openMode
      ? "menu"
      : say
        ? "tip"
        : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        data-signature-hero=""
        data-face={face}
        data-talk={say ? "" : undefined}
        disabled={disabled}
        aria-label="Portfolio guide"
        aria-haspopup="dialog"
        aria-expanded={openMode !== null}
        aria-controls={openMode ? panelId : undefined}
        onClick={toggle}
        onPointerEnter={(event) => {
          setHot(true);
          if (event.pointerType === "mouse") hoverOpen();
        }}
        onPointerLeave={(event) => {
          setHot(false);
          if (event.pointerType === "mouse") hoverLeave();
        }}
        onFocus={(event) => setHot(event.currentTarget.matches(":focus-visible"))}
        onBlur={() => setHot(false)}
        className={[
          className,
          "assistant cursor-pointer appearance-none border-0 p-0 focus-visible:outline-offset-4 disabled:cursor-default",
        ].join(" ")}
      >
        <RobotParts />
      </button>

      <span
        ref={slotRef}
        aria-hidden="true"
        className="bot-slot bot-hero ml-3"
      />

      {surface ? (
        <AssistantPanel
          key={surface === "tip" ? `tip-${say?.id}` : "menu"}
          id={panelId}
          triggerRef={triggerRef}
          kind={surface}
          text={surface === "tip" ? say?.text : undefined}
          announce={surface === "tip" ? say?.announce : undefined}
          marginWidth={surface === "tip" && rail ? rail : undefined}
          autoFocus={openMode === "click"}
          onClose={close}
          onPick={pick}
          onPresence={(inside) => (inside ? clearHover() : hoverLeave())}
        />
      ) : null}
    </>
  );
}
