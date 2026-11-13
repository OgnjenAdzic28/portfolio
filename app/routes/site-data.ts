import { cloudflareEnvContext } from "@/lib/cloudflare-context";
import { getLatestPortfolioCommit } from "@/lib/github-latest-commit.server";
import type { Route } from "./+types/site-data";

export async function loader({ context }: Route.LoaderArgs) {
  const env = context.get(cloudflareEnvContext);
  const latestCommit = await getLatestPortfolioCommit(
    env.PORTFOLIO_WRITING_FEED,
  );

  return Response.json(
    { latestCommit },
    {
      // Never let the edge keep a missing commit; the footer retries on the next visit.
      headers: latestCommit
        ? { "Cache-Control": "s-maxage=300, stale-while-revalidate=600" }
        : { "Cache-Control": "no-store" },
    },
  );
}
