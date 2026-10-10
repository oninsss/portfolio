"use client";

import {
  Fragment,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import { IconPause, IconPlay } from "@/components/shared/icons";

const LEAVE_MS = 460;

const HOLD_MS = 7000;

const prefersReduced = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function subscribeReduced(onChange: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function Words({ text, leaving }: { text: string; leaving: boolean }) {
  const words = text.split(" ");
  return words.map((word, index) => (
    <Fragment key={index}>
      <span
        className={leaving ? "word-out" : "word-in"}
        style={{ "--w": index } as CSSProperties}
      >
        {word}
      </span>
      {index < words.length - 1 ? " " : null}
    </Fragment>
  ));
}

export function RotatingLead({ lines }: { lines: string[] }) {
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [held, setHeld] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [inView, setInView] = useState(true);

  const root = useRef<HTMLDivElement>(null);
  const swap = useRef<number | undefined>(undefined);

  const reduced = useSyncExternalStore(
    subscribeReduced,
    prefersReduced,
    () => false,
  );

  useEffect(() => {
    const el = root.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(
    () => () => {
      if (swap.current !== undefined) window.clearTimeout(swap.current);
    },
    [],
  );

  const go = (next: number) => {
    if (leaving || next === index) return;
    if (reduced) {
      setIndex(next);
      return;
    }
    setLeaving(true);
    swap.current = window.setTimeout(() => {
      setIndex(next);
      setLeaving(false);
    }, LEAVE_MS);
  };

  const running = !reduced && !stopped && !held && inView && !leaving;

  return (
    <div
      ref={root}
      onPointerEnter={(event) => event.pointerType === "mouse" && setHeld(true)}
      onPointerLeave={(event) => event.pointerType === "mouse" && setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
    >
      <p className="grid text-[1.0625rem] leading-snug tracking-tight text-ink sm:text-lg lg:max-w-[38ch] lg:text-[1.1875rem]">
        {lines.map((line, at) => (
          <span
            key={line}
            aria-hidden={at === index ? undefined : true}
            className={["col-start-1 row-start-1", at === index ? "" : "invisible"].join(" ")}
          >
            {at === index ? <Words text={line} leaving={leaving} /> : line}
          </span>
        ))}
      </p>

      {lines.length > 1 ? (
        <div className="mt-4 flex items-center gap-3">
          <ul className="flex items-center gap-1.5" aria-label="Choose a line">
            {lines.map((line, at) => {
              const current = at === index;
              return (
                <li key={line}>
                  <button
                    type="button"
                    aria-label={`Show line ${at + 1} of ${lines.length}`}
                    aria-current={current ? "true" : undefined}
                    onClick={() => {
                      setStopped(true);
                      go(at);
                    }}
                    className="group flex h-5 w-6 cursor-pointer items-center focus-visible:outline-offset-1"
                  >
                    <span className="relative block h-px w-full overflow-hidden bg-rule transition-[background-color] duration-200 group-hover:bg-ink-muted/50">
                      {current ? (
                        <span
                          key={index}
                          onAnimationEnd={() => go((index + 1) % lines.length)}
                          style={
                            {
                              "--hold": `${HOLD_MS}ms`,
                              animationPlayState: running ? "running" : "paused",
                            } as CSSProperties
                          }
                          className={[
                            "absolute inset-y-0 left-0 block h-full bg-accent",
                            reduced || stopped ? "w-full" : "lead-bar w-0",
                          ].join(" ")}
                        />
                      ) : null}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {!reduced ? (
            <button
              type="button"
              aria-pressed={stopped}
              aria-label={stopped ? "Resume the rotation" : "Pause the rotation"}
              title={stopped ? "Resume" : "Pause"}
              onClick={() => setStopped((value) => !value)}
              className="flex h-5 w-5 cursor-pointer items-center justify-center text-ink-muted transition-colors duration-150 hover:text-accent"
            >
              {stopped ? <IconPlay size={11} /> : <IconPause size={11} />}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
