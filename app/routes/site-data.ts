import { getLatestPortfolioCommit } from "@/lib/github-latest-commit.server";

export async function loader() {
  return Response.json({ latestCommit: await getLatestPortfolioCommit() });
}

export function headers() {
  return {
    "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
  };
}
