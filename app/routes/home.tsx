import {
  Suspense,
  type CSSProperties,
  useEffect,
  useRef,
  useState,
} from "react";
import { Await } from "react-router";
import { ProductMentions } from "@/components/product-mentions";
import { CharacterSwapText } from "@/components/character-swap-text";
import { ContributionGraph } from "@/components/contribution-graph";
import { MediaShelf } from "@/components/media-shelf";
import { AudioLink } from "@/components/audio-link";
import { ReadingProgressDate } from "@/components/reading-progress-date";
import { SectionViewAll } from "@/components/section-view-all";
import {
  emptyContributions,
  parseHomeData,
  toHomeWriting,
} from "@/lib/home-data";
import { cloudflareEnvContext } from "@/lib/cloudflare-context";
import { featuredShelfItems } from "@/lib/shelf";
import { getSubstackPosts } from "@/lib/substack.server";
import type { Route } from "./+types/home";

const projects = [
  {
    description:
      "The fastest computer use for AI agents. It drives any desktop app in the background at 178 ms per action.",
    href: "https://github.com/OgnjenAdzic28/hush",
    name: "Hush",
    tags: ["Agents", "Computer use", "Rust"],
    year: "2026",
  },
  {
    description:
      "A git-native rules layer for AI agents. I've landed CLI diagnostics, editor guides, CI fixes and a bunch of tests.",
    href: "https://github.com/gnt-ai/gnt",
    name: "gnt",
    tags: ["Contributor", "Agents", "TypeScript"],
    year: "2026",
  },
  {
    description:
      "A benchmark for agents doing real chores across email, calendar, tasks, memory and approvals.",
    href: "https://github.com/OgnjenAdzic28/agent-workflow-benchmark",
    name: "Agent Workflow Benchmark",
    tags: ["Agents", "Evaluation", "TypeScript"],
    year: "2026",
  },
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
];

type RevealStyle = CSSProperties & {
  "--reveal-delay": string;
};

function revealStyle(index: number): RevealStyle {
  return { "--reveal-delay": `${40 + index * 45}ms` };
}

export async function loader({ context }: Route.LoaderArgs) {
  const env = context.get(cloudflareEnvContext);
  const posts = await getSubstackPosts(env.PORTFOLIO_WRITING_FEED);

  return {
    contributions: emptyContributions,
    writing: toHomeWriting(posts),
  };
}

export function headers() {
  return {
    "Cache-Control": "no-store",
  };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const [contributions, setContributions] = useState(loaderData.contributions);
  const homeDataTriggerRef = useRef<HTMLElement>(null);
  const { writing } = loaderData;
  const emptyWritingSlots = Array.from(
    { length: Math.max(0, 3 - writing.length) },
    (_, index) => index,
  );

  useEffect(() => {
    const trigger = homeDataTriggerRef.current;

    if (!trigger) {
      return;
    }

    let controller: AbortController | null = null;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) {
        return;
      }

      observer.disconnect();
      controller = new AbortController();

      void fetch("/resources/home-data", {
        headers: { Accept: "application/json" },
        signal: controller.signal,
      })
        .then((response) => (response.ok ? response.json() : null))
        .then((value: unknown) => {
          const parsed = parseHomeData(value);

          if (parsed) {
            setContributions(parsed.contributions);
          }
        })
        .catch((error: unknown) => {
          if (!(error instanceof DOMException && error.name === "AbortError")) {
            console.error("Unable to refresh the Portfolio home data", error);
          }
        });
    });

    observer.observe(trigger);

    return () => {
      observer.disconnect();
      controller?.abort();
    };
  }, []);

  return (
    <main className="site-shell page-reveal-root home-reveal-root" id="top">
      <section className="hero editorial-section" aria-labelledby="intro-title">
        <header className="hero-heading reveal" style={revealStyle(1)}>
          <h1 id="intro-title">Hi, I&apos;m Ognjen Adzic</h1>
          <p className="hero-kicker">
            <CharacterSwapText text="I build tools for AI agents" />
          </p>
        </header>

        <div className="prose-stack">
          <p className="reveal" style={revealStyle(2)}>
            <ProductMentions
              leading="Right now I'm building "
              items={[
                {
                  href: "https://invokeable.com",
                  icon: "/invokeable-icon.svg",
                  label: "Invokeable",
                  product: "invokeable",
                },
              ]}
              trailing=". It runs agents through your product for real and shows you exactly where they break, so you can make your software agent ready."
            />
          </p>
          <p className="reveal" style={revealStyle(3)}>
            <ProductMentions
              leading="I also made "
              items={[
                {
                  href: "https://github.com/OgnjenAdzic28/hush",
                  icon: "/hush-icon.svg",
                  label: "Hush",
                  product: "hush",
                },
              ]}
              trailing=", the fastest computer use for AI agents. It drives any app in the background, so the agent works and your screen stays yours."
            />
          </p>
          <p className="reveal" style={revealStyle(4)}>
            <ProductMentions
              leading="And "
              items={[
                {
                  href: "https://usedoorman.app",
                  icon: "/doorman-icon.webp",
                  label: "Doorman",
                  product: "doorman",
                },
              ]}
              trailing=", because my agents kept throwing windows in front of me while I was typing. It's a Mac app that puts mine back."
            />
          </p>
          <p className="reveal" style={revealStyle(5)}>
            <ProductMentions
              leading="I'm a core contributor to "
              items={[
                {
                  href: "https://github.com/gnt-ai/gnt",
                  icon: "/gntai-icon.jpg",
                  label: "gnt",
                  product: "gntai",
                },
              ]}
              trailing=" too, a git-native rules layer for AI agents."
            />
          </p>
          <p className="reveal" style={revealStyle(6)}>
            <ProductMentions
              leading="Before that I co-founded "
              items={[
                {
                  icon: "/pingless-icon.svg",
                  label: "Pingless",
                  product: "pingless",
                },
              ]}
              trailing=", an agency where we built AI tools and web apps for clients, including the site for the first Maritime Club at UPenn."
            />{" "}
            <ProductMentions
              leading="Then "
              items={[
                {
                  href: "https://www.pennyone.app",
                  icon: "/pennyone-icon.svg",
                  label: "PennyOne",
                  product: "pennyone",
                },
              ]}
              trailing=", an inbox assistant that sorted your email, wrote replies in your voice and waited for your OK on anything important."
            />
          </p>
          <p className="reveal" style={revealStyle(7)}>
            <ProductMentions
              leading="My first company was "
              items={[
                {
                  icon: "/archistella-icon.svg",
                  label: "ArchiStella",
                  product: "archistella",
                },
              ]}
              trailing=", a marketplace where shipping companies buy supplies straight from vendors. I built it at 13, starting on WordPress, and it got to 60 shipping companies, 150+ suppliers and 50,000+ products in beta, plus the final round at Techstars Chicago. It ended because suppliers kept taking deals offline to skip our fee."
            />
          </p>
          <p className="reveal" style={revealStyle(8)}>
            For fun, I&apos;ve built perception systems for{" "}
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
            .
          </p>
          <p className="reveal" style={revealStyle(9)}>
            I started coding at 12 and haven&apos;t really stopped.
          </p>
          <p className="reveal" style={revealStyle(10)}>
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
        <>
          <section className="editorial-section" id="writing">
            <header className="section-heading section-heading-with-link">
              <span>
                <h2>Recent writing</h2>
                <p>
                  I write about problems that keep bothering me until I can
                  explain them without hand-waving.
                </p>
              </span>
              <SectionViewAll href="/writing">View all writing</SectionViewAll>
            </header>

            <div className="wide-bleed article-grid">
              {writing.map((post) => (
                <AudioLink
                  className="editorial-card article-card"
                  href={`/writing/${post.slug}`}
                  key={post.slug}
                >
                  <span className="card-copy">
                    <span className="card-title">{post.title}</span>
                    <span className="card-description">{post.description}</span>
                  </span>
                  <span className="card-meta">
                    <ReadingProgressDate
                      dateTime={post.publishedAt}
                      formattedDate={post.formattedDate}
                      slug={post.slug}
                    />
                  </span>
                </AudioLink>
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

          <p className="section-bridge">
            Writing gives me room to think. Code is less polite about bad ideas.
          </p>
        </>
      ) : null}

      <section className="editorial-section" id="work" ref={homeDataTriggerRef}>
        <header className="section-heading section-heading-with-link">
          <span>
            <h2>On GitHub</h2>
            <p>
              Stuff you can actually read and run. Most of it I built, some of
              it I help out with.
            </p>
          </span>
          <SectionViewAll external href="https://github.com/OgnjenAdzic28">
            View all on GitHub
          </SectionViewAll>
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

      <Suspense
        fallback={
          <section className="editorial-section" id="contributions">
            <header className="section-heading">
              <h2>Code over time</h2>
              <p>A live view of my past year on GitHub.</p>
            </header>
            <div className="wide-bleed contribution-panel">
              <div className="contribution-heatmap" />
            </div>
            <p className="section-afterword">
              GitHub can count changes. It cannot tell when deleting ten lines
              was the most useful part of the day.
            </p>
          </section>
        }
      >
        <Await resolve={contributions}>
          {(resolvedContributions) => (
            <section className="editorial-section" id="contributions">
              <header className="section-heading">
                <h2>Code over time</h2>
                <p>
                  {resolvedContributions.available &&
                  resolvedContributions.total !== null
                    ? `${resolvedContributions.total.toLocaleString()} contributions across the past year on GitHub. It measures activity, not whether the code was useful.`
                    : "A live view of my past year on GitHub. The calendar is temporarily unavailable, but the work is still there."}
                </p>
              </header>

              {resolvedContributions.columns.length > 0 ? (
                <div className="wide-bleed contribution-panel">
                  <ContributionGraph
                    counts={resolvedContributions.counts}
                    data={resolvedContributions.columns}
                  />
                </div>
              ) : null}

              <p className="section-afterword">
                GitHub can count changes. It cannot tell when deleting ten lines
                was the most useful part of the day.
              </p>
            </section>
          )}
        </Await>
      </Suspense>

      <MediaShelf items={featuredShelfItems} />
    </main>
  );
}
