"use client";

import { useEffect, useRef, useState } from "react";
import { RobotParts, type Face } from "./robot";
import { BOOT_EVENT, OPENER_KEY } from "@/lib/assistant/boot";
import { profile } from "@/content";

const SLEEP_MS = 1500;
const POP_MS = 320;
const HOLD_MS = 650;
const LOAD_CAP_MS = 4000;
const FAILSAFE_MS = 7000;
const FLIGHT_MS = 900;
const VEIL_MS = 600;

export function BootScreen() {
  const [face, setFace] = useState<Face>("name");
  const [awake, setAwake] = useState(false);
  const [gone, setGone] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.opener !== "run") return;

    const timers: number[] = [];
    const animations: Animation[] = [];
    let cancelled = false;
    let flown = false;

    const later = (ms: number, run: () => void) => {
      timers.push(
        window.setTimeout(() => {
          if (!cancelled) run();
        }, ms),
      );
    };

    const land = () => {
      if (cancelled) return;
      try {
        sessionStorage.setItem(OPENER_KEY, "1");
      } catch {
      }
      root.dataset.opener = "done";
      if (rootRef.current) rootRef.current.style.display = "none";
      setGone(true);
      window.dispatchEvent(new Event(BOOT_EVENT));
    };

    const fly = () => {
      if (flown || cancelled) return;
      flown = true;
      setFace("happy");
      setAwake(true);

      const stage = stageRef.current;
      const veil = veilRef.current;
      const slot = document.querySelector<HTMLElement>("[data-signature-hero]");
      if (!stage || !veil) return land();

      const vw = root.clientWidth;
      const vh = root.clientHeight;
      const box = slot?.getBoundingClientRect();
      const onScreen = !!box && box.width > 0 && box.bottom > 0 && box.top < vh;

      const lift = (a: Animation) => {
        animations.push(a);
        a.finished.then(land, () => {
        });
      };

      animations.push(
        veil.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: VEIL_MS,
          delay: 120,
          easing: "ease-out",
          fill: "forwards",
        }),
      );

      if (!box || !slot || !onScreen) {
        lift(
          stage.animate([{ opacity: 1 }, { opacity: 0 }], {
            duration: VEIL_MS,
            fill: "forwards",
          }),
        );
        return;
      }

      const bot = stage.querySelector<HTMLElement>(".bot");
      const scale = bot ? slot.offsetWidth / bot.offsetWidth : 0.4;
      const dx = box.left + box.width / 2 - vw / 2;
      const dy = box.top + box.height / 2 - vh / 2;

      lift(
        stage.animate(
          [
            { transform: "translate(0px, 0px) scale(1)" },
            {
              transform: `translate(${dx * 0.55}px, ${dy * 0.45 - 40}px) scale(${1 + (scale - 1) * 0.5})`,
              offset: 0.5,
            },
            { transform: `translate(${dx}px, ${dy}px) scale(${scale})` },
          ],
          {
            duration: FLIGHT_MS,
            easing: "cubic-bezier(0.45, 0, 0.2, 1)",
            fill: "forwards",
          },
        ),
      );
    };

    const loaded = new Promise<void>((resolve) => {
      if (document.readyState === "complete") resolve();
      else window.addEventListener("load", () => resolve(), { once: true });
    });
    const cap = new Promise<void>((resolve) => later(LOAD_CAP_MS, resolve));

    Promise.race([
      Promise.all([loaded, document.fonts?.ready ?? Promise.resolve()]),
      cap,
    ]).then(() => {
      if (cancelled) return;
      later(Math.max(0, SLEEP_MS - performance.now()), () => {
        setFace("wow");
        later(POP_MS, () => {
          setFace("happy");
          setAwake(true);
          later(HOLD_MS, fly);
        });
      });
    });

    later(FAILSAFE_MS, fly);

    window.addEventListener("pointerdown", fly);
    window.addEventListener("keydown", fly);

    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
      animations.forEach((a) => a.cancel());
      window.removeEventListener("pointerdown", fly);
      window.removeEventListener("keydown", fly);
    };
  }, []);

  if (gone) return null;

  return (
    <div ref={rootRef} className="boot" aria-hidden="true">
      <div ref={veilRef} className="boot-veil" />
      <div ref={stageRef} className="boot-stage">
        <div
          className="bot"
          data-face={face}
          data-awake={awake ? "" : undefined}
        >
          <RobotParts label={profile.name} />
        </div>
      </div>
      <p className="boot-caption" data-awake={awake ? "" : undefined}>
        Waking up…
      </p>
    </div>
  );
}
