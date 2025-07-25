import Footer from "@/app/components/nav/Footer";
import { getAllPosts } from "@/lib/blog";
import BlogContent from "./blog-content";

export default async function BlogPage() {
  const posts = await getAllPosts();

  // Transform posts to exclude the content function for client component
  const postsForClient = posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    publishedDate: post.publishedDate,
    excerpt: post.excerpt,
    readTime: post.readTime,
    featured: post.featured,
    tags: post.tags,
    coverImage: post.coverImage,
    author: {
      name: post.author.name,
      avatar: post.author.avatar,
    },
  }));

  return (
    <>
      <BlogContent posts={postsForClient} />
      <Footer isHomePage={true} />
    </>
  );
}
