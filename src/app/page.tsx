import type { CSSProperties } from "react";
import { AnimatedPillLinks } from "@/components/animated-pill-link";
import { AudioLink } from "@/components/audio-link";
import { ThemeToggle } from "@/components/theme-toggle";

type ListItem = {
  href?: string;
  name: string;
  year: string;
};

const work = [
  {
    name: "Pingless",
    year: "2025",
    href: "https://pingless.dev",
  },
  {
    name: "ArchiStella",
    year: "2024",
  },
] satisfies ListItem[];

const projects = [
  {
    name: "Maritime Perception MVP",
    year: "2026",
    href: "https://github.com/OgnjenAdzic28/maritime-perception-mvp",
  },
  {
    name: "Autonomous Driving Lab",
    year: "2026",
    href: "https://github.com/OgnjenAdzic28/autonomous-perception-lab",
  },
  {
    name: "Agent Workflow Benchmark",
    year: "2026",
    href: "https://github.com/OgnjenAdzic28/agent-workflow-benchmark",
  },
  {
    name: "FIFA Momentum Tracker",
    year: "2025",
    href: "https://github.com/OgnjenAdzic28/fifa-momentum-tracker",
  },
] satisfies ListItem[];

function revealStyle(index: number): CSSProperties {
  return { "--i": index } as CSSProperties;
}

function Section({
  title,
  items,
  delayStart,
}: {
  title: string;
  items: ListItem[];
  delayStart: number;
}) {
  return (
    <section className="portfolio-section reveal" style={revealStyle(delayStart)}>
      <h2>{title}</h2>
      <div className="list">
        {items.map((item, index) => (
          <AudioLink
            key={item.name}
            href={item.href}
            tone={index % 2 === 0 ? "low" : "mid"}
            target={item.href ? "_blank" : undefined}
            rel={item.href ? "noreferrer" : undefined}
            className="row"
            aria-disabled={item.href ? undefined : true}
          >
            <span>{item.name}</span>
            <time>{item.year}</time>
          </AudioLink>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main className="portfolio-shell">
      <header className="topbar reveal" style={revealStyle(0)}>
        <h1>Ognjen Adzic</h1>
        <ThemeToggle />
      </header>

      <section className="intro" aria-label="About">
        <p className="reveal" style={revealStyle(1)}>
          <AnimatedPillLinks
            leading="I'm Ognjen, building trust for software agents use. Previously "
            items={[
              {
                href: "https://pingless.dev",
                label: "Pingless",
                explanation:
                  "building web, SaaS, and AI applications that actually work, from landing pages to full web apps",
                target: "_blank",
                rel: "noreferrer",
              },
            ]}
            trailing=" and ArchiStella, building software around problems that usually get ignored until they start costing time."
          />
        </p>

        <p className="reveal" style={revealStyle(2)}>
          I started coding when I was 12. These days I care most about the jump
          from vague idea to shipped product: the part where taste, speed, and
          usefulness have to meet.
        </p>

        <p className="reveal" style={revealStyle(3)}>
          You can find me on{" "}
          <AudioLink
            href="https://x.com/OgnjenAdzic"
            tone="accent"
            target="_blank"
            rel="noreferrer"
            className="text-link"
          >
            X
          </AudioLink>
          ,{" "}
          <AudioLink
            href="https://www.instagram.com/adzicognjen28"
            tone="accent"
            target="_blank"
            rel="noreferrer"
            className="text-link"
          >
            Instagram
          </AudioLink>
          ,{" "}
          <AudioLink
            href="https://github.com/OgnjenAdzic28"
            tone="low"
            target="_blank"
            rel="noreferrer"
            className="text-link"
          >
            GitHub
          </AudioLink>
          , and{" "}
          <AudioLink
            href="https://www.linkedin.com/in/ognjenadzic"
            tone="mid"
            target="_blank"
            rel="noreferrer"
            className="text-link"
          >
            LinkedIn
          </AudioLink>
          .
        </p>

        <p className="reveal" style={revealStyle(4)}>
          For a sharper version of the same story, you can read my{" "}
          <AudioLink
            href="/Ognjen_Adzic_Resume.pdf"
            tone="accent"
            target="_blank"
            rel="noreferrer"
            className="cv-beam-link"
          >
            CV
          </AudioLink>
          .
        </p>
      </section>

      <Section title="Work" items={work} delayStart={5} />
      <Section title="Projects" items={projects} delayStart={6} />
    </main>
  );
}
