import { getSecurityHeaders } from "@/lib/security-headers.server";

const robots = [
  "User-agent: *",
  "Allow: /",
  "",
  "Sitemap: https://ognjenadzic.com/sitemap.xml",
  "Host: https://ognjenadzic.com",
  "",
].join("\n");

export function loader() {
  return new Response(robots, {
    headers: {
      ...getSecurityHeaders(),
      "Cache-Control": "s-maxage=86400, stale-while-revalidate=86400",
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
