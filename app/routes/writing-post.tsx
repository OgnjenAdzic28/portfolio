import { ArticleContent } from "@/components/article-content";
import { AudioLink } from "@/components/audio-link";
import { PageBackLink } from "@/components/page-back-link";
import { formatPostDate } from "@/lib/substack";
import { getSubstackPost } from "@/lib/substack.server";
import type { Route } from "./+types/writing-post";

export async function loader({ params }: Route.LoaderArgs) {
  const post = await getSubstackPost(params.slug);

  if (!post) {
    throw new Response("Not found", { status: 404 });
  }

  return { post };
}

export const meta: Route.MetaFunction = ({ data }) => {
  if (!data?.post) {
    return [{ title: "Writing | Ognjen Adzic" }];
  }

  const { post } = data;
  const canonical = `https://ognjenadzic.com/writing/${post.slug}`;

  return [
    { title: `${post.title} | Ognjen Adzic` },
    { name: "description", content: post.description },
    { property: "og:title", content: post.title },
    { property: "og:description", content: post.description },
    { property: "og:type", content: "article" },
    { property: "og:url", content: canonical },
    { property: "article:published_time", content: post.publishedAt },
    { property: "article:author", content: post.author },
    ...(post.coverImage
      ? [{ property: "og:image", content: post.coverImage }]
      : []),
    { tagName: "link", rel: "canonical", href: canonical },
  ];
};

export function headers() {
  return {
    "Cache-Control": "s-maxage=60, stale-while-revalidate=240",
  };
}

export default function WritingPostPage({ loaderData }: Route.ComponentProps) {
  const { post } = loaderData;

  return (
    <main className="portfolio-shell article-shell page-reveal-root">
      <article className="article page-reveal-root">
        <header className="article-header">
          <PageBackLink
            ariaLabel="Back to writing"
            href="/writing"
            label="Back to writing"
          />

          <h1>{post.title}</h1>
          <time
            className="article-date"
            dateTime={new Date(post.publishedAt).toISOString()}
          >
            {formatPostDate(post.publishedAt)}
          </time>
        </header>

        <ArticleContent html={post.content} />

        <footer className="article-footer">
          <AudioLink
            href={post.url}
            target="_blank"
            rel="noreferrer"
            className="substack-button"
          >
            View on Substack
          </AudioLink>
        </footer>
      </article>
    </main>
  );
}
