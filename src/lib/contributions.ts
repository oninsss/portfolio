"use cache";

import { cacheLife } from "next/cache";
import { profile } from "@/content";
import { calendarMonths } from "@/lib/site";

export type ContributionDay = {
  date: string;
  count: number;
  level: number;
};

export type ContributionCalendar = {
  username: string;
  href?: string;
  total: number | null;
  days: ContributionDay[];
  connected: boolean;
};

const CALENDAR_URL = `https://github.com/users/${profile.githubUsername}/contributions`;

const CELL =
  /data-date="(\d{4}-\d{2}-\d{2})"\s+id="([^"]+)"\s+data-level="(\d+)"[\s\S]*?<\/td>(?:\s*<tool-tip[^>]*for="\2"[^>]*>([^<]*)<\/tool-tip>)?/g;

function recent(days: ContributionDay[]): ContributionDay[] {
  const edge = new Date(`${days[days.length - 1].date}T00:00:00Z`);
  edge.setUTCMonth(edge.getUTCMonth() - calendarMonths);
  const from = edge.toISOString().slice(0, 10);
  return days.filter((day) => day.date > from);
}

function offline(): ContributionCalendar {
  return {
    username: profile.githubUsername,
    href: undefined,
    total: null,
    days: [],
    connected: false,
  };
}

function countFromTooltip(tooltip: string | undefined): number {
  if (!tooltip) return 0;
  const match = /^(\d+)\s+contributions?/.exec(tooltip);
  return match ? Number(match[1]) : 0;
}

export async function getContributionCalendar(): Promise<ContributionCalendar> {
  cacheLife("hours");

  const base = {
    username: profile.githubUsername,
    href: profile.github.startsWith("[") ? undefined : profile.github,
  };

  try {
    const response = await fetch(CALENDAR_URL, {
      headers: { "user-agent": "portfolio-contribution-calendar" },
    });
    if (!response.ok) return { ...offline(), ...base };

    const html = await response.text();

    const days: ContributionDay[] = [];
    let match: RegExpExecArray | null;
    CELL.lastIndex = 0;
    while ((match = CELL.exec(html)) !== null) {
      days.push({
        date: match[1],
        count: countFromTooltip(match[4]),
        level: Number(match[3]),
      });
    }

    if (days.length === 0) return { ...offline(), ...base };

    days.sort((a, b) => a.date.localeCompare(b.date));
    const shown = recent(days);

    return {
      ...base,
      total: shown.reduce((sum, day) => sum + day.count, 0),
      days: shown,
      connected: true,
    };
  } catch {
    return { ...offline(), ...base };
  }
}
