import { withTimedCache } from "@/lib/timed-cache.server";

const latestCommitUrl =
  "https://api.github.com/repos/OgnjenAdzic28/portfolio/commits/main?per_page=1";
const maxResponseBytes = 1_000_000;
const refreshIntervalSeconds = 300;
const storedCommitCacheMilliseconds = 60_000;
const latestCommitKey = "github-latest-commit:v1";

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

async function fetchLatestCommit(): Promise<LatestPortfolioCommit> {
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
}

function isStoredCommit(value: unknown): value is LatestPortfolioCommit {
  return (
    isRecord(value) &&
    typeof value.committedAt === "string" &&
    !Number.isNaN(Date.parse(value.committedAt)) &&
    typeof value.sha === "string" &&
    /^[a-f0-9]{40}$/i.test(value.sha) &&
    typeof value.url === "string" &&
    value.url.startsWith("https://github.com/") &&
    isNonNegativeInteger(value.additions) &&
    isNonNegativeInteger(value.deletions)
  );
}

async function readStoredCommit(store: KVNamespace) {
  const { value, metadata } = await store.getWithMetadata<
    unknown,
    { refreshedAt?: string }
  >(latestCommitKey, "json");

  if (!isStoredCommit(value)) {
    return null;
  }

  const refreshedAt = Date.parse(metadata?.refreshedAt ?? "");

  return {
    commit: value,
    refreshedAt: Number.isNaN(refreshedAt) ? 0 : refreshedAt,
  };
}

async function storeCommit(store: KVNamespace, commit: LatestPortfolioCommit) {
  await store.put(latestCommitKey, JSON.stringify(commit), {
    metadata: { refreshedAt: new Date().toISOString() },
  });
}

// Runs from the minute cron. GitHub's unauthenticated API allows about 60
// requests an hour per IP, and Cloudflare shares egress IPs, so only the cron
// talks to GitHub and only once per refresh interval.
export async function refreshLatestPortfolioCommit(store: KVNamespace) {
  const stored = await readStoredCommit(store);

  if (
    stored &&
    Date.now() - stored.refreshedAt < refreshIntervalSeconds * 1_000
  ) {
    return;
  }

  try {
    await storeCommit(store, await fetchLatestCommit());
  } catch (error) {
    // Keep serving the last good commit until GitHub answers again.
    console.error("Unable to refresh the latest portfolio commit", error);
  }
}

export function getLatestPortfolioCommit(
  store: KVNamespace,
): Promise<LatestPortfolioCommit | null> {
  return withTimedCache(
    "github-latest-portfolio-commit",
    storedCommitCacheMilliseconds,
    async () => {
      try {
        const stored = await readStoredCommit(store);

        if (stored) {
          return stored.commit;
        }

        // Only reached before the cron has stored a commit for the first time.
        const commit = await fetchLatestCommit();
        await storeCommit(store, commit);

        return commit;
      } catch (error) {
        console.error("Unable to load the latest portfolio commit", error);
        return null;
      }
    },
  );
}
