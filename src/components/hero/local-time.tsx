"use client";

import { useSyncExternalStore } from "react";
import { CHIP } from "@/components/shared/chip";
import { IconMoon, IconSun } from "@/components/shared/icons";

const minute = () => Math.floor(Date.now() / 60_000);

function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, 15_000);
  return () => window.clearInterval(id);
}

const server = () => null;

function offsetMinutes(timeZone: string, at: Date): number {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    })
      .formatToParts(at)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  );
  const wall = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );
  return Math.round((wall - Math.floor(at.getTime() / 1000) * 1000) / 60_000);
}

type View = {
  time: string;
  utc: string;
  hour: number;
  relation: string | null;
};

function describe(timeZone: string, at: Date): View | null {
  try {
    const time = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "numeric",
      minute: "2-digit",
    }).format(at);

    const offset =
      new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "shortOffset" })
        .formatToParts(at)
        .find((part) => part.type === "timeZoneName")?.value ?? "";

    const hour = Number(
      new Intl.DateTimeFormat("en-US", {
        timeZone,
        hour: "numeric",
        hourCycle: "h23",
      }).format(at),
    );

    const mine = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const hours = (offsetMinutes(timeZone, at) - offsetMinutes(mine, at)) / 60;
    const amount = Number.isInteger(hours)
      ? Math.abs(hours)
      : Math.abs(hours).toFixed(1);

    return {
      time,
      utc: offset.replace("GMT", "UTC") || "UTC",
      hour,
      relation:
        hours === 0
          ? null
          : `${amount}h ${hours > 0 ? "ahead of" : "behind"} you`,
    };
  } catch {
    return null;
  }
}

const isDay = (hour: number) => hour >= 6 && hour < 18;

function DayBar({ hour }: { hour: number }) {
  return (
    <span aria-hidden="true" className="hidden items-center gap-px sm:flex">
      {Array.from({ length: 24 }, (_, h) => (
        <span
          key={h}
          className={[
            "block w-[3px] rounded-[1px] transition-[height,background-color] duration-300",
            h === hour
              ? "h-3.5 bg-accent"
              : isDay(h)
                ? "h-2 bg-ink-muted/50"
                : "h-2 bg-ink-muted/20",
          ].join(" ")}
        />
      ))}
    </span>
  );
}

export function LocalTime({
  place,
  timeZone,
}: {
  place: string;
  timeZone: string;
}) {
  const now = useSyncExternalStore(subscribe, minute, server);
  const view = now === null ? null : describe(timeZone, new Date(now * 60_000));

  const shown: View = view ?? {
    time: "12:00 PM",
    utc: "UTC+8",
    hour: 12,
    relation: null,
  };
  const Icon = isDay(shown.hour) ? IconSun : IconMoon;

  if (now !== null && view === null) return null;

  return (
    <span
      className={[CHIP, "flex-wrap gap-y-1", view ? "" : "invisible"].join(" ")}
      aria-hidden={view ? undefined : true}
      title={`Local time in ${place}`}
      aria-label={`It is ${shown.time} in ${place}, ${shown.utc}${shown.relation ? `, ${shown.relation}` : ""}.`}
      role="img"
    >
      <Icon size={14} className="text-ink-muted" />
      <span className="whitespace-nowrap tabular-nums text-ink">{shown.time}</span>
      <span className="whitespace-nowrap text-ink-muted/70">{shown.utc}</span>
      <DayBar hour={shown.hour} />
      {shown.relation ? (
        <span className="whitespace-nowrap">{shown.relation}</span>
      ) : null}
    </span>
  );
}
