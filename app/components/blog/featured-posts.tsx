import Link from "next/link";
import { getFeaturedPosts } from "@/lib/blog";
import { formatDate } from "@/lib/utils";

export default async function FeaturedPosts() {
  const featuredPosts = await getFeaturedPosts();

  if (featuredPosts.length === 0) {
    return null;
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Featured Posts</h2>
            <Link
              href="/blog"
              className="text-primary hover:underline font-medium"
            >
              View all posts →
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredPosts.slice(0, 3).map((post) => (
              <article
                key={post.slug}
                className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col space-y-4">
                  <time className="text-sm text-muted-foreground">
                    {formatDate(post.publishedDate)}
                  </time>

                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="hover:text-primary transition-colors"
                      >
                        {post.title
                          .replace(/-/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </Link>
                    </h3>

                    {post.excerpt && (
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                    )}

                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-primary hover:underline font-medium text-sm"
                  >
                    Read more →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
