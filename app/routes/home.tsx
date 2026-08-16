import type { CSSProperties } from "react";
import { ProductMentions } from "@/components/product-mentions";
import { CharacterSwapText } from "@/components/character-swap-text";
import { ContributionGraph } from "@/components/contribution-graph";
import { MediaShelf } from "@/components/media-shelf";
import { AudioLink } from "@/components/audio-link";
import { NavigationAudioLink } from "@/components/navigation-audio-link";
import { ReadingProgressDate } from "@/components/reading-progress-date";
import { getGitHubContributions } from "@/lib/github-contributions.server";
import { featuredShelfItems } from "@/lib/shelf";
import { formatPostDate } from "@/lib/substack";
import { getSubstackPosts } from "@/lib/substack.server";
import type { Route } from "./+types/home";

const projects = [
  {
    description:
      "Water, sky, and obstacle segmentation with vessel tracking and radar demos.",
    href: "https://github.com/OgnjenAdzic28/maritime-perception-mvp",
    name: "Maritime Perception MVP",
    tags: ["Computer vision", "PyTorch", "Maritime"],
    year: "2026",
  },
  {
    description:
      "KITTI verification, YOLO detection, sparse LiDAR depth, tracking, and BEV replay.",
    href: "https://github.com/OgnjenAdzic28/autonomous-perception-lab",
    name: "Autonomous Perception Lab",
    tags: ["Autonomy", "LiDAR", "Tracking"],
    year: "2026",
  },
  {
    description:
      "A benchmark suite for agents working across email, calendar, tasks, memory, and approvals.",
    href: "https://github.com/OgnjenAdzic28/agent-workflow-benchmark",
    name: "Agent Workflow Benchmark",
    tags: ["Agents", "Evaluation", "TypeScript"],
    year: "2026",
  },
  {
    description:
      "A computer vision system for detecting momentum shifts and substitution timing in FIFA.",
    href: "https://github.com/OgnjenAdzic28/fifa-momentum-tracker",
    name: "FIFA Momentum Tracker",
    tags: ["Machine learning", "Vision", "Sports"],
    year: "2025",
  },
];

type RevealStyle = CSSProperties & {
  "--reveal-delay": string;
};

function revealStyle(index: number): RevealStyle {
  return { "--reveal-delay": `${40 + index * 45}ms` };
}

function cleanExcerpt(description: string) {
  return description
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function loader() {
  const [posts, contributions] = await Promise.all([
    getSubstackPosts(),
    getGitHubContributions(),
  ]);
  const writing = posts.slice(0, 6).map((post) => ({
    description: cleanExcerpt(post.description),
    formattedDate: formatPostDate(post.publishedAt),
    publishedAt: post.publishedAt,
    slug: post.slug,
    title: post.title,
  }));

  return { contributions, writing };
}

export function headers() {
  return {
    "Cache-Control": "s-maxage=60, stale-while-revalidate=240",
  };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { contributions, writing } = loaderData;
  const emptyWritingSlots = Array.from(
    { length: Math.max(0, 3 - writing.length) },
    (_, index) => index,
  );

  return (
    <main className="site-shell page-reveal-root home-reveal-root" id="top">
      <section className="hero editorial-section" aria-labelledby="intro-title">
        <header className="hero-heading reveal" style={revealStyle(1)}>
          <h1 id="intro-title">Hi, I&apos;m Ognjen Adzic</h1>
          <p className="hero-kicker">
            <CharacterSwapText text="I turn vague ideas into dependable software" />
          </p>
        </header>

        <div className="prose-stack">
          <p className="reveal" style={revealStyle(2)}>
            <ProductMentions
              leading="Right now, I'm building "
              items={[
                {
                  cover: "/invokeable-banner.webp",
                  description:
                    "Tests whether AI agents can use a product correctly and safely. It runs important customer journeys, verifies the resulting state and side effects, and turns failures into evidence-backed findings.",
                  href: "https://invokeable.com",
                  icon: "/invokeable-icon.svg",
                  label: "Invokeable",
                  meta: ["Building", "now"],
                  product: "invokeable",
                },
              ]}
              trailing=" to make your software agent ready."
            />
          </p>
          <p className="reveal" style={revealStyle(3)}>
            <ProductMentions
              leading="I'm also a core contributor to "
              items={[
                {
                  cover: "/gntai-banner.png",
                  description:
                    "Governance infrastructure for AI agents, with versioned policies, pull request approval, and runtime checks over MCP.",
                  href: "https://github.com/gnt-ai/gnt",
                  icon: "/gntai-icon.jpg",
                  label: "gnt.ai",
                  meta: ["Core contributor", "now"],
                  product: "gntai",
                },
              ]}
              trailing=". I help build governance infrastructure for AI agents."
            />
          </p>
          <p className="reveal" style={revealStyle(4)}>
            <ProductMentions
              leading="Before that, I co-founded "
              items={[
                {
                  cover: "/pingless-banner.png",
                  description:
                    "Web, SaaS, and AI applications that actually work, from landing pages to full web products.",
                  icon: "/pingless-icon.svg",
                  label: "Pingless",
                  meta: ["Built", "2025"],
                  product: "pingless",
                },
                {
                  cover: "/archistella-banner.png",
                  description:
                    "A B2B marketplace connecting maritime companies directly with vessel suppliers, distributors, and brand owners.",
                  icon: "/archistella-icon.svg",
                  label: "ArchiStella",
                  meta: ["Built", "2024"],
                  product: "archistella",
                },
              ]}
              separator={[" and "]}
              trailing=". They were different products, but the job was similar: find the annoying part people had accepted and make it work better."
            />
          </p>
          <p className="reveal" style={revealStyle(5)}>
            I&apos;ve also been working on perception systems for{" "}
            <AudioLink
              className="editorial-link"
              href="https://github.com/OgnjenAdzic28/maritime-perception-mvp"
              rel="noreferrer"
              target="_blank"
            >
              boats
            </AudioLink>{" "}
            and{" "}
            <AudioLink
              className="editorial-link"
              href="https://github.com/OgnjenAdzic28/autonomous-perception-lab"
              rel="noreferrer"
              target="_blank"
            >
              cars
            </AudioLink>
            , where a clean demo is usually the beginning of the work, not proof
            that it is finished.
          </p>
          <p className="reveal" style={revealStyle(6)}>
            I started coding when I was 12. The part I enjoy has not changed: turning
            a vague idea into something useful, then removing everything that gets
            in the way.
          </p>
          <p className="reveal" style={revealStyle(7)}>
            I&apos;m on{" "}
            <AudioLink
              className="editorial-link"
              href="https://github.com/OgnjenAdzic28"
              rel="noreferrer"
              target="_blank"
            >
              GitHub
            </AudioLink>
            ,{" "}
            <AudioLink
              className="editorial-link"
              href="https://x.com/OgnjenAdzic"
              rel="noreferrer"
              target="_blank"
            >
              X
            </AudioLink>
            ,{" "}
            <AudioLink
              className="editorial-link"
              href="https://www.linkedin.com/in/ognjenadzic"
              rel="noreferrer"
              target="_blank"
            >
              LinkedIn
            </AudioLink>
            ,{" "}
            <AudioLink
              className="editorial-link"
              href="https://www.reddit.com/user/OgnjenAdzic/"
              rel="noreferrer"
              target="_blank"
            >
              Reddit
            </AudioLink>
            , and{" "}
            <AudioLink
              className="editorial-link"
              href="https://ognjenadzic.substack.com"
              rel="noreferrer"
              target="_blank"
            >
              Substack
            </AudioLink>
            . You can also read{" "}
            <AudioLink
              className="editorial-link"
              href="/Ognjen_Adzic_Resume.pdf"
              rel="noreferrer"
              target="_blank"
            >
              my CV
            </AudioLink>
            .
          </p>
        </div>
      </section>

      {writing.length > 0 ? (
        <section className="editorial-section" id="writing">
          <header className="section-heading">
            <h2>Recent writing</h2>
            <p>
              I write about problems that keep bothering me until I can explain them
              without hand-waving.
            </p>
          </header>

          <div className="wide-bleed article-grid">
            {writing.map((post) => (
              <NavigationAudioLink
                className="editorial-card article-card"
                href={`/writing/${post.slug}`}
                key={post.slug}
                transitionType="writing-forward"
              >
                <span className="card-copy">
                  <span className="card-title">{post.title}</span>
                  <span className="card-description">
                    {post.description}
                  </span>
                </span>
                <span className="card-meta">
                  <ReadingProgressDate
                    dateTime={post.publishedAt}
                    formattedDate={post.formattedDate}
                    slug={post.slug}
                  />
                </span>
              </NavigationAudioLink>
            ))}
            {emptyWritingSlots.map((slot) => (
              <span
                aria-hidden="true"
                className="editorial-card article-card writing-empty-slot"
                key={slot}
              >
                <span className="writing-empty-mark" />
              </span>
            ))}
          </div>
          {emptyWritingSlots.length > 0 ? (
            <p className="writing-coming-soon">
              More writing is on the way. The empty space is intentional.
            </p>
          ) : null}
        </section>
      ) : null}

      {writing.length > 0 ? (
        <p className="section-bridge">
          Writing gives me room to think. Code is less polite about bad ideas.
        </p>
      ) : null}

      <section className="editorial-section" id="work">
        <header className="section-heading">
          <h2>Selected work</h2>
          <p>
            Recent projects where I tested the difficult parts before polishing
            everything around them.
          </p>
        </header>

        <div className="wide-bleed project-grid">
          {projects.map((project) => (
            <AudioLink
              className="editorial-card project-card"
              href={project.href}
              key={project.name}
              rel="noreferrer"
              target="_blank"
            >
              <span className="card-copy">
                <span className="card-title">{project.name}</span>
                <span className="card-description">{project.description}</span>
              </span>
              <span className="card-meta">
                <span className="card-year">{project.year}</span>
                <span className="project-tags">
                  {project.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </span>
              </span>
            </AudioLink>
          ))}
        </div>
      </section>

      <section className="editorial-section" id="contributions">
        <header className="section-heading">
          <h2>Code over time</h2>
          <p>
            {contributions.available && contributions.total !== null
              ? `${contributions.total.toLocaleString()} contributions across the past year on GitHub. It measures activity, not whether the code was useful.`
              : "A live view of my past year on GitHub. The calendar is temporarily unavailable, but the work is still there."}
          </p>
        </header>

        {contributions.columns.length > 0 ? (
          <div className="wide-bleed contribution-panel">
            <ContributionGraph
              counts={contributions.counts}
              data={contributions.columns}
            />
          </div>
        ) : null}

        <p className="section-afterword">
          GitHub can count changes. It cannot tell when deleting ten lines was the
          most useful part of the day.
        </p>
      </section>

      <MediaShelf items={featuredShelfItems} />
    </main>
  );
}
