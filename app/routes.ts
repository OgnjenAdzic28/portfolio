import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("favorites", "routes/favorites.tsx"),
  route("writing", "routes/writing.tsx"),
  route("writing/:slug", "routes/writing-post.tsx"),
  route("sitemap.xml", "routes/sitemap.ts"),
  route("robots.txt", "routes/robots.ts"),
  route("resources/site-data", "routes/site-data.ts"),
  route("resources/home-data", "routes/home-data.ts"),
] satisfies RouteConfig;
