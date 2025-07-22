import { getAllPosts } from "@/lib/blog";
import BlogClient from "./blog-client";

export default async function BlogSection() {
  // Fetch posts from Keystatic
  const posts = await getAllPosts();

  // Transform posts to remove the content function for client component
  const postsForClient = posts.map((post) => {
    const { content: _content, ...postWithoutContent } = post;
    return postWithoutContent;
  });

  return <BlogClient posts={postsForClient} />;
}
