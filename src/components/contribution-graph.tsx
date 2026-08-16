import type {
  HeatmapColumn,
  HeatmapLevelStyles,
} from "@/components/charts/heatmap";
import {
  HeatmapCells,
  HeatmapChart,
  HeatmapInteractionBoundary,
  HeatmapInteractionProvider,
  HeatmapLegend,
  HeatmapTooltip,
  HeatmapXAxis,
  HeatmapYAxis,
} from "@/components/charts/heatmap";

const contributionLevels = [
  { color: "var(--contribution-0)", fillMode: "solid", pattern: "none" },
  { color: "var(--contribution-1)", fillMode: "solid", pattern: "none" },
  { color: "var(--contribution-2)", fillMode: "solid", pattern: "none" },
  { color: "var(--contribution-3)", fillMode: "solid", pattern: "none" },
  { color: "var(--contribution-4)", fillMode: "solid", pattern: "none" },
] as const satisfies HeatmapLevelStyles;

type ContributionGraphProps = {
  counts: Record<string, number>;
  data: HeatmapColumn[];
};

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function ContributionGraph({ counts, data }: ContributionGraphProps) {
  return (
    <div className="contribution-graph">
      <a
        aria-label="View Ognjen's contribution graph on GitHub"
        className="contribution-mobile-link"
        href="https://github.com/OgnjenAdzic28#year-list-container"
      />
      <div role="img" aria-label="GitHub contributions over the last year">
        <HeatmapInteractionProvider>
          <HeatmapInteractionBoundary className="contribution-graph-boundary">
            <HeatmapChart
              animationDuration={1200}
              className="contribution-heatmap"
              data={data}
              enterStaggerScale={0.72}
              gap={2}
              layout="fluid"
              levelStyles={contributionLevels}
              margin={{ top: 26, right: 4, bottom: 0, left: 28 }}
            >
              <HeatmapCells
                activeScale={1.24}
                cornerRadius={2}
                inactiveOpacity={0.16}
                inactiveScale={0.96}
              />
              <HeatmapXAxis className="contribution-axis-label" />
              <HeatmapYAxis
                className="contribution-axis-label"
                labelFormat="initial"
              />
              <HeatmapTooltip
                className="contribution-tooltip"
                formatLabel={(_, date) => {
                  const count = counts[dateKey(date)] ?? 0;
                  return `${count.toLocaleString()} ${count === 1 ? "contribution" : "contributions"}`;
                }}
                panelStyle={{
                  border: "1px solid var(--graph-line)",
                  borderRadius: 8,
                  boxShadow: "0 16px 44px rgba(0, 0, 0, 0.24)",
                }}
              />
            </HeatmapChart>
            <HeatmapLegend
              activeScale={1.12}
              cellSize={10}
              className="contribution-legend"
              cornerRadius={2}
              inactiveOpacity={0.2}
              labelClassName="contribution-axis-label"
              levelStyles={contributionLevels}
            />
          </HeatmapInteractionBoundary>
        </HeatmapInteractionProvider>
      </div>
    </div>
  );
}
