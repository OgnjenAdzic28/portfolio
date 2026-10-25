import { useMemo, useState, type PointerEvent } from "react";
import type { HeatmapColumn } from "@/components/charts/heatmap";

const contributionLevels = [0, 1, 2, 3, 4] as const;
const monthFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  timeZone: "UTC",
});
const dateFormat = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

type ContributionGraphProps = {
  counts: Record<string, number>;
  data: HeatmapColumn[];
};

type ActiveDay = {
  date: Date;
  count: number;
  left: number;
  top: number;
};

export function ContributionGraph({ counts, data }: ContributionGraphProps) {
  const [activeDay, setActiveDay] = useState<ActiveDay | null>(null);
  const months = useMemo(() => {
    const ticks: { key: string; label: string; index: number }[] = [];
    for (const [index, column] of data.entries()) {
      const date = column.bins[3]?.date ?? column.bins[0]?.date;
      if (!date) continue;
      const month = `${date.getUTCFullYear()}-${date.getUTCMonth()}`;
      if (month === ticks.at(-1)?.key) continue;
      ticks.push({ key: month, label: monthFormat.format(date), index });
    }
    // A short leading month would overlap the next label on narrow calendars.
    if (ticks.length > 1 && ticks[1].index - ticks[0].index < 4) {
      ticks.shift();
    }
    return ticks;
  }, [data]);
  const cells = useMemo(() => data.map((column, columnIndex) =>
    column.bins.map((day, row) => (
      <rect
        data-column={columnIndex}
        data-row={row}
        fill={`var(--contribution-${day.count})`}
        height={10}
        key={day.date.toISOString()}
        rx={2}
        width={10}
        x={columnIndex * 12}
        y={day.bin * 12}
      />
    )),
  ), [data]);

  function showDay(event: PointerEvent<SVGSVGElement>) {
    if (event.pointerType === "touch") {
      return;
    }
    if (!(event.target instanceof SVGRectElement)) {
      setActiveDay(null);
      return;
    }
    const column = Number(event.target.dataset.column);
    const row = Number(event.target.dataset.row);
    const day = data[column]?.bins[row];
    if (!day) return;

    const bounds = event.target.getBoundingClientRect();
    const calendar = event.currentTarget.getBoundingClientRect();
    setActiveDay({
      date: day.date,
      count: counts[day.date.toISOString().slice(0, 10)] ?? 0,
      left: Math.max(80, Math.min(bounds.left - calendar.left + bounds.width / 2, calendar.width - 80)),
      top: bounds.top - calendar.top - 8,
    });
  }

  return (
    <div className="contribution-graph">
      <a
        aria-label="View Ognjen's contribution graph on GitHub"
        className="contribution-mobile-link"
        href="https://github.com/OgnjenAdzic28#year-list-container"
      />
      <div className="contribution-graph-boundary">
        <div className="contribution-heatmap">
          <div className="contribution-months contribution-axis-label" aria-hidden="true">
            {months.map((month) => (
              <span key={month.key} style={{ left: `${month.index / data.length * 100}%` }}>
                {month.label}
              </span>
            ))}
          </div>
          <div className="contribution-plot">
            {[{ row: 1, label: "M" }, { row: 3, label: "W" }, { row: 5, label: "F" }].map(({ row, label }) => (
              <span
                aria-hidden="true"
                className="contribution-weekday contribution-axis-label"
                key={row}
                style={{ top: `${(row + 0.5) / 7 * 100}%` }}
              >
                {label}
              </span>
            ))}
            <svg
              aria-label="GitHub contributions over the last year"
              className="contribution-calendar"
              onPointerLeave={() => setActiveDay(null)}
              onPointerOver={showDay}
              role="img"
              viewBox={`0 0 ${Math.max(1, data.length) * 12} 84`}
            >
              {cells}
            </svg>
            {activeDay ? (
              <div
                className="contribution-tooltip contribution-day-tooltip"
                role="tooltip"
                style={{ left: activeDay.left, top: activeDay.top }}
              >
                <strong>{activeDay.count.toLocaleString()} {activeDay.count === 1 ? "contribution" : "contributions"}</strong>
                <span>{dateFormat.format(activeDay.date)}</span>
              </div>
            ) : null}
          </div>
        </div>
        <div className="contribution-legend contribution-axis-label" aria-hidden="true">
          <span>Less</span>
          {contributionLevels.map((level) => (
            <span
              className="contribution-legend-cell"
              key={level}
              style={{ background: `var(--contribution-${level})` }}
            />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
