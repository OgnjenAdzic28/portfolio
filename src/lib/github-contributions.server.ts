import type { HeatmapColumn } from "@/components/charts/heatmap";
import { withTimedCache } from "@/lib/timed-cache.server";

const contributionsUrl =
  "https://github.com/users/OgnjenAdzic28/contributions";
const maxResponseBytes = 750_000;
const refreshIntervalSeconds = 300;

type ContributionDay = {
  count: number;
  date: string;
  level: number;
};

export type GitHubContributionData = {
  available: boolean;
  columns: HeatmapColumn[];
  counts: Record<string, number>;
  total: number | null;
};

function startOfWeek(date: Date) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() - result.getUTCDay());
  return result;
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function buildColumns(days: ContributionDay[]) {
  const byDate = new Map(days.map((day) => [day.date, day]));
  const firstDate = days[0]?.date ?? new Date().toISOString().slice(0, 10);
  const first = new Date(`${firstDate}T00:00:00Z`);
  const last = new Date(
    `${days.at(-1)?.date ?? toDateKey(first)}T00:00:00Z`,
  );
  const firstWeek = startOfWeek(first);
  const lastWeek = startOfWeek(last);
  const columns: HeatmapColumn[] = [];

  for (
    let week = new Date(firstWeek), columnIndex = 0;
    week <= lastWeek;
    week.setUTCDate(week.getUTCDate() + 7), columnIndex += 1
  ) {
    const weekStart = new Date(week);
    columns.push({
      bin: columnIndex,
      bins: Array.from({ length: 7 }, (_, rowIndex) => {
        const date = new Date(weekStart);
        date.setUTCDate(date.getUTCDate() + rowIndex);
        const contribution = byDate.get(toDateKey(date));

        return {
          bin: rowIndex,
          count: contribution?.level ?? 0,
          date,
        };
      }),
    });
  }

  return columns;
}

function parseContributionDays(html: string) {
  const days: ContributionDay[] = [];
  const cellPattern =
    /<td\b([^>]*\bdata-date="[^"]+"[^>]*)><\/td>\s*<tool-tip\b[^>]*>([^<]*)<\/tool-tip>/g;

  for (const match of html.matchAll(cellPattern)) {
    const attributes = match[1] ?? "";
    const tooltip = match[2] ?? "";
    const date = attributes.match(/\bdata-date="(\d{4}-\d{2}-\d{2})"/)?.[1];
    const level = Number(attributes.match(/\bdata-level="([0-4])"/)?.[1]);
    const countText = tooltip.match(/([\d,]+)\s+contribution/)?.[1];
    const count = countText ? Number(countText.replaceAll(",", "")) : 0;

    if (date && Number.isInteger(level) && Number.isFinite(count)) {
      days.push({ count, date, level });
    }
  }

  return days.sort((first, second) => first.date.localeCompare(second.date));
}

export function getGitHubContributions(): Promise<GitHubContributionData> {
  return withTimedCache(
    "github-contributions",
    refreshIntervalSeconds * 1_000,
    async () => {
      try {
        const response = await fetch(contributionsUrl, {
          headers: {
            Accept: "text/html",
            "User-Agent": "ognjenadzic.com contribution graph",
          },
          redirect: "manual",
          signal: AbortSignal.timeout(8_000),
        });

        if (!response.ok) {
          throw new Error(`GitHub contributions returned ${response.status}`);
        }

        const contentLength = Number(response.headers.get("content-length"));
        if (Number.isFinite(contentLength) && contentLength > maxResponseBytes) {
          throw new Error("GitHub contributions exceeded the size limit");
        }

        const html = await response.text();
        if (Buffer.byteLength(html, "utf8") > maxResponseBytes) {
          throw new Error("GitHub contributions exceeded the size limit");
        }

        const days = parseContributionDays(html);
        if (days.length < 300) {
          throw new Error("GitHub contributions response was incomplete");
        }

        const totalText = html.match(
          /id="js-contribution-activity-description"[^>]*>\s*([\d,]+)\s*contributions/,
        )?.[1];

        return {
          available: true,
          columns: buildColumns(days),
          counts: Object.fromEntries(days.map((day) => [day.date, day.count])),
          total: totalText ? Number(totalText.replaceAll(",", "")) : null,
        };
      } catch (error) {
        console.error("Unable to load GitHub contributions", error);
        return {
          available: false,
          columns: [],
          counts: {},
          total: null,
        };
      }
    },
  );
}
