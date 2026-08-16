import { withTimedCache } from "@/lib/timed-cache.server";

const latestCommitUrl =
  "https://api.github.com/repos/OgnjenAdzic28/portfolio/commits/main?per_page=1";
const maxResponseBytes = 1_000_000;
const refreshIntervalSeconds = 300;

export type LatestPortfolioCommit = {
  additions: number;
  committedAt: string;
  deletions: number;
  sha: string;
  url: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function parseLatestCommit(value: unknown): LatestPortfolioCommit {
  if (!isRecord(value)) {
    throw new Error("GitHub latest commit response was not an object");
  }

  const commit = value.commit;
  const stats = value.stats;

  if (!isRecord(commit) || !isRecord(stats)) {
    throw new Error("GitHub latest commit response was incomplete");
  }

  const committer = commit.committer;
  const sha = value.sha;
  const url = value.html_url;
  const additions = stats.additions;
  const deletions = stats.deletions;

  if (
    !isRecord(committer) ||
    typeof committer.date !== "string" ||
    Number.isNaN(Date.parse(committer.date)) ||
    typeof sha !== "string" ||
    !/^[a-f0-9]{40}$/i.test(sha) ||
    typeof url !== "string" ||
    !isNonNegativeInteger(additions) ||
    !isNonNegativeInteger(deletions)
  ) {
    throw new Error("GitHub latest commit response contained invalid fields");
  }

  const commitUrl = new URL(url);
  if (commitUrl.protocol !== "https:" || commitUrl.hostname !== "github.com") {
    throw new Error("GitHub latest commit response contained an invalid URL");
  }

  return {
    additions,
    committedAt: committer.date,
    deletions,
    sha,
    url: commitUrl.toString(),
  };
}

export function getLatestPortfolioCommit(): Promise<LatestPortfolioCommit | null> {
  return withTimedCache(
    "github-latest-portfolio-commit",
    refreshIntervalSeconds * 1_000,
    async () => {
      try {
        const response = await fetch(latestCommitUrl, {
          headers: {
            Accept: "application/vnd.github+json",
            "User-Agent": "ognjenadzic.com latest commit",
            "X-GitHub-Api-Version": "2022-11-28",
          },
          redirect: "manual",
          signal: AbortSignal.timeout(8_000),
        });

        if (!response.ok) {
          throw new Error(`GitHub latest commit returned ${response.status}`);
        }

        const contentLength = Number(response.headers.get("content-length"));
        if (Number.isFinite(contentLength) && contentLength > maxResponseBytes) {
          throw new Error("GitHub latest commit exceeded the size limit");
        }

        const body = await response.text();
        if (Buffer.byteLength(body, "utf8") > maxResponseBytes) {
          throw new Error("GitHub latest commit exceeded the size limit");
        }

        return parseLatestCommit(JSON.parse(body) as unknown);
      } catch (error) {
        console.error("Unable to load the latest portfolio commit", error);
        return null;
      }
    },
  );
}
