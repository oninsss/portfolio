import { calendarMonths } from "@/lib/site";
import type { ContributionCalendar } from "@/lib/contributions";
import { IconGitHub } from "@/components/shared/icons";

const DAY_MS = 86_400_000;
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const PERIOD = calendarMonths === 12 ? "year" : `${calendarMonths} months`;

const PHONE_MONTHS = 6;

function lastMonths(days: ContributionCalendar["days"], months: number) {
  if (days.length === 0) return days;
  const edge = new Date(ms(days[days.length - 1].date));
  edge.setUTCMonth(edge.getUTCMonth() - months);
  const from = edge.toISOString().slice(0, 10);
  return days.filter((day) => day.date > from);
}

const PLACEHOLDER_WEEKS = Math.round(calendarMonths * 4.4);

const ms = (date: string) => Date.parse(`${date}T00:00:00Z`);

type Cell = { date: string; count: number; level: number; col: number; row: number };
type Tick = { col: number; label: string };

function layout(days: ContributionCalendar["days"]) {
  if (days.length === 0) return { anchor: 0, weeks: 0, cells: [], ticks: [] };

  const first = ms(days[0].date);
  const weekday = new Date(first).getUTCDay();
  const anchor = first - weekday * DAY_MS;
  const last = ms(days[days.length - 1].date);
  const weeks = Math.floor((last - anchor) / DAY_MS / 7) + 1;

  const cells: Cell[] = days.map((day) => {
    const at = ms(day.date);
    const offset = Math.round((at - anchor) / DAY_MS);
    return {
      date: day.date,
      count: day.count,
      level: day.level,
      col: Math.floor(offset / 7),
      row: offset % 7,
    };
  });

  const ticks: Tick[] = [];
  let lastCol = -Infinity;
  for (const cell of cells) {
    const month = Number(cell.date.slice(5, 7)) - 1;
    const label = MONTHS[month];
    if (ticks.at(-1)?.label === label) continue;
    if (cell.col - lastCol < 4 && ticks.length > 0) continue;
    ticks.push({ col: cell.col, label });
    lastCol = cell.col;
  }

  return { anchor, weeks, cells, ticks };
}

function longDate(date: string) {
  const at = ms(date);
  const d = new Date(at);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

function label(cell: Cell) {
  if (cell.count === 0) return `No contributions on ${longDate(cell.date)}.`;
  const noun = cell.count === 1 ? "contribution" : "contributions";
  return `${cell.count} ${noun} on ${longDate(cell.date)}.`;
}

type ContributionHeatmapProps = {
  calendar: ContributionCalendar;
};

export function ContributionHeatmap({ calendar }: ContributionHeatmapProps) {
  const { connected, total, href, username } = calendar;
  const { weeks, cells, ticks } = layout(calendar.days);
  const phoneDays = lastMonths(calendar.days, PHONE_MONTHS);
  const phone = layout(phoneDays);
  const phoneTotal = phoneDays.reduce((sum, day) => sum + day.count, 0);
  const hasPhoneView = calendarMonths > PHONE_MONTHS;

  const summary =
    total === null
      ? `GitHub contribution calendar for ${username}.`
      : `GitHub contribution calendar for ${username}: ${total} contributions in the last ${PERIOD}.`;

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="flex items-center gap-2 text-sm text-ink">
          <IconGitHub size={15} className="text-ink-muted" />
          <span>
            GitHub activity ·{" "}
            <span className={hasPhoneView ? "hidden sm:inline" : undefined}>last {PERIOD}</span>
            {hasPhoneView ? <span className="sm:hidden">last {PHONE_MONTHS} months</span> : null}
          </span>
        </p>
        {total !== null ? (
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.06em] text-ink-muted">
            <span className={hasPhoneView ? "hidden sm:inline" : undefined}>{total} in the last {PERIOD}</span>
            {hasPhoneView ? <span className="sm:hidden">{phoneTotal} in the last {PHONE_MONTHS} months</span> : null}
          </p>
        ) : null}
      </div>

      {connected && weeks > 0 ? (
        href ? (
          <a
            href={href}
            aria-label={`${summary} Opens in a new tab.`}
            target="_blank"
            rel="noreferrer noopener"
            className="group mt-3 block focus-visible:outline-offset-4"
          >
            <Calendars wide={{ weeks, cells, ticks }} phone={hasPhoneView ? phone : null} />
          </a>
        ) : (
          <div className="mt-3">
            <Calendars wide={{ weeks, cells, ticks }} phone={hasPhoneView ? phone : null} />
          </div>
        )
      ) : (
        <div
          aria-hidden="true"
          className="mt-3 grid gap-[2px]"
          style={{
            gridTemplateColumns: `repeat(${PLACEHOLDER_WEEKS}, minmax(0, 1fr))`,
            gridTemplateRows: "repeat(7, auto)",
          }}
        >
          {Array.from({ length: PLACEHOLDER_WEEKS * 7 }, (_, index) => (
            <span
              key={index}
              className="aspect-square rounded-[1.5px] bg-rule"
              style={{
                gridColumn: Math.floor(index / 7) + 1,
                gridRow: (index % 7) + 1,
              }}
            />
          ))}
        </div>
      )}

      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <p className="text-xs leading-relaxed text-ink-muted">
          {connected
            ? `Real contribution data from github.com/${username}.`
            : "Contribution data is unavailable right now."}
        </p>

        {connected ? (
          <p className="flex items-center gap-1" aria-hidden="true">
            <span className="mr-1 text-[0.625rem] text-ink-muted">Less</span>
            {[0, 1, 2, 3, 4].map((level) => (
              <span
                key={level}
                data-level={level}
                className="heat h-2.5 w-2.5 rounded-[1.5px]"
              />
            ))}
            <span className="ml-1 text-[0.625rem] text-ink-muted">More</span>
          </p>
        ) : null}
      </div>
    </div>
  );
}

type Laid = { weeks: number; cells: Cell[]; ticks: Tick[] };

function Calendars({ wide, phone }: { wide: Laid; phone: Laid | null }) {
  if (!phone) return <Calendar {...wide} />;
  return (
    <>
      <div className="sm:hidden">
        <Calendar {...phone} />
      </div>
      <div className="hidden sm:block">
        <Calendar {...wide} />
      </div>
    </>
  );
}

function Calendar({
  weeks,
  cells,
  ticks,
}: {
  weeks: number;
  cells: Cell[];
  ticks: Tick[];
}) {
  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="relative mb-1.5 hidden h-3 sm:block"
      >
        {ticks.map((tick) => (
          <span
            key={`${tick.col}-${tick.label}`}
            className="absolute top-0 font-mono text-[0.625rem] leading-none text-ink-muted"
            style={{ left: `${(tick.col / weeks) * 100}%` }}
          >
            {tick.label}
          </span>
        ))}
      </div>

      <div
        className="grid gap-[2px]"
        style={{
          gridTemplateColumns: `repeat(${weeks}, minmax(0, 1fr))`,
          gridTemplateRows: "repeat(7, auto)",
        }}
      >
        {cells.map((cell) => (
          <span
            key={cell.date}
            data-level={cell.level}
            title={label(cell)}
            className="heat aspect-square rounded-[1.5px]"
            style={{ gridColumn: cell.col + 1, gridRow: cell.row + 1 }}
          />
        ))}
      </div>
    </div>
  );
}
