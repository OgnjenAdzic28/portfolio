import { PageBackLink } from "@/components/page-back-link";
import { WritingArchive } from "@/components/writing-archive";
import styles from "@/components/writing.module.css";
import { cloudflareEnvContext } from "@/lib/cloudflare-context";
import { formatPostDate } from "@/lib/substack";
import { getSubstackPosts } from "@/lib/substack.server";
import type { Route } from "./+types/writing";

const siteUrl = "https://ognjenadzic.com/writing";
const description =
  "Mostly AI, SWE, and whatever Ognjen Adzic is learning at the time.";

export const meta: Route.MetaFunction = () => [
  { title: "Writing | Ognjen Adzic" },
  { name: "description", content: description },
  { property: "og:title", content: "Writing | Ognjen Adzic" },
  { property: "og:description", content: description },
  { property: "og:type", content: "website" },
  { property: "og:url", content: siteUrl },
  { tagName: "link", rel: "canonical", href: siteUrl },
];

function cleanExcerpt(description: string) {
  return description
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export async function loader({ context }: Route.LoaderArgs) {
  const env = context.get(cloudflareEnvContext);
  const posts = await getSubstackPosts(env.PORTFOLIO_WRITING_FEED);
  const writing = posts.map((post) => ({
    description: cleanExcerpt(post.description),
    formattedDate: formatPostDate(post.publishedAt),
    publishedAt: post.publishedAt,
    slug: post.slug,
    title: post.title,
  }));

  return { writing };
}

export function headers() {
  return {
    "Cache-Control": "s-maxage=60, stale-while-revalidate=240",
  };
}

export default function WritingPage({ loaderData }: Route.ComponentProps) {
  return (
    <main className={styles.page}>
      <div className={`${styles.shell} page-reveal-root`}>
        <PageBackLink />

        <section className={styles.intro} aria-labelledby="writing-title">
          <h1 className={styles.title} id="writing-title">
            things i wrote
          </h1>
          <p className={styles.lede}>
            Mostly AI, SWE, and whatever I&apos;m learning at the time. Sometimes I
            get distracted and write about something else.
          </p>
        </section>

        <WritingArchive posts={loaderData.writing} />
      </div>
    </main>
  );
}
