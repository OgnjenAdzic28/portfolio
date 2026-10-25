import { getGitHubContributions } from "@/lib/github-contributions.server";
import { cloudflareEnvContext } from "@/lib/cloudflare-context";
import { toHomeWriting } from "@/lib/home-data";
import { getSubstackPosts } from "@/lib/substack.server";
import type { Route } from "./+types/home-data";

export async function loader({ context }: Route.LoaderArgs) {
  const env = context.get(cloudflareEnvContext);
  const [posts, contributions] = await Promise.all([
    getSubstackPosts(env.PORTFOLIO_WRITING_FEED),
    getGitHubContributions(),
  ]);

  return Response.json(
    { contributions, writing: toHomeWriting(posts) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
