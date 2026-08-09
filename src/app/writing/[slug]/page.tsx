import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleContent } from "@/components/article-content";
import { AudioLink } from "@/components/audio-link";
import { NavigationAudioLink } from "@/components/navigation-audio-link";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  formatPostDate,
  getSubstackPost,
  getSubstackPosts,
} from "@/lib/substack";

type WritingPostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const posts = await getSubstackPosts();

  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: WritingPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getSubstackPost(slug);

  if (!post) {
    return { title: "Writing" };
  }

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `/writing/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author],
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function WritingPostPage({ params }: WritingPostPageProps) {
  const { slug } = await params;
  const post = await getSubstackPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="portfolio-shell article-shell">
      <header className="topbar">
        <NavigationAudioLink
          href="/"
          tone="low"
          transitionType="writing-back"
          className="site-name-link"
        >
          Ognjen Adzic
        </NavigationAudioLink>
        <ThemeToggle />
      </header>

      <article className="article">
        <header className="article-header">
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
            tone="accent"
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
