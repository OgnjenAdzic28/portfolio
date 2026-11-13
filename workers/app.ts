import { createRequestHandler, RouterContextProvider } from "react-router";
import { cloudflareEnvContext } from "@/lib/cloudflare-context";
import { refreshLatestPortfolioCommit } from "@/lib/github-latest-commit.server";
import { refreshSubstackPosts } from "@/lib/substack.server";

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.hostname === "www.ognjenadzic.com") {
      url.hostname = "ognjenadzic.com";
      return Response.redirect(url, 308);
    }

    const context = new RouterContextProvider();
    context.set(cloudflareEnvContext, env);

    return requestHandler(request, context);
  },

  async scheduled(_controller, env, ctx) {
    ctx.waitUntil(refreshSubstackPosts(env.PORTFOLIO_WRITING_FEED));
    ctx.waitUntil(refreshLatestPortfolioCommit(env.PORTFOLIO_WRITING_FEED));
  },
} satisfies ExportedHandler<Env>;
