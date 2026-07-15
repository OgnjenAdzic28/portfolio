from __future__ import annotations

from pathlib import Path
from textwrap import wrap

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "output" / "pdf"
DOCS_DIR = Path("/Users/ognjenadzic/Documents")

PDF_NAME = "Ognjen_Adzic_Resume.pdf"
MD_NAME = "Ognjen_Adzic_Resume.md"


PAGE_W, PAGE_H = letter
LEFT = 50
RIGHT = PAGE_W - 50
TOP = PAGE_H - 44
BLACK = colors.HexColor("#111111")
TEXT = colors.HexColor("#222222")
MUTED = colors.HexColor("#666666")
RULE = colors.HexColor("#d6d6d6")


CONTENT = {
    "name": "OGNJEN ADZIC",
    "contact": (
        "+382 68 618 611  |  oginjo28@gmail.com  |  linkedin.com/in/ognjenadzic"
        "  |  github.com/OgnjenAdzic28  |  ognjenadzic.com"
    ),
    "profile": (
        "Founder building Invokeable, a reliability platform for software used by AI agents. "
        "Previously built PennyOne and Pingless, with additional work spanning agent evaluation "
        "and computer vision systems for maritime and autonomous perception."
    ),
    "experience": [
        {
            "role": "Founder",
            "org": "Invokeable",
            "date": "2026-Present",
            "desc": (
                "Reliability platform that tests whether AI agents can find the right actions "
                "and complete real product journeys safely."
            ),
            "bullets": [
                (
                    "Defined and built the product across React, TypeScript, Convex, Trigger.dev, "
                    "WorkOS, Stripe, PostHog, Sentry, and production deployment."
                ),
                (
                    "Built multi-step journey testing, disturbance and recovery assessment, "
                    "final-state verification, evidence-backed findings, and release assurance."
                ),
                (
                    "Launched the private waitlist and shaped positioning around making "
                    "agent-operated software safer and more reliable."
                ),
            ],
        },
        {
            "role": "Co-Founder",
            "org": "PennyOne",
            "date": "2025-2026",
            "desc": (
                "AI assistant for catching missed follow-ups, buried commitments, decisions, "
                "and scheduling issues."
            ),
            "bullets": [
                (
                    "Own product, UX, and engineering across Next.js, TypeScript, Convex, auth, "
                    "billing, deployment, email/calendar context, memory, and agent orchestration."
                ),
                (
                    "Designed an approval-gated workflow model that surfaces risks, drafts next "
                    "actions, and waits for explicit user review before sensitive actions."
                ),
            ],
        },
        {
            "role": "Co-Founder",
            "org": "Pingless",
            "date": "2025-2026",
            "desc": (
                "Product and software studio for SaaS platforms, AI automation tools, "
                "and web applications."
            ),
            "bullets": [
                (
                    "Build and ship web, SaaS, and AI products with hands-on ownership across "
                    "product scope, design, engineering, deployment, and iteration."
                ),
            ],
        },
    ],
    "projects": [
        {
            "name": "Maritime Perception MVP",
            "date": "2026",
            "meta": "PyTorch, DeepLabV3+, YOLOv8, ByteTrack, ConvLSTM, ONNX, Gradio",
            "bullets": [
                (
                    "Built a maritime perception stack for water, sky, and obstacle segmentation, "
                    "vessel detection, tracking, synthetic radar segmentation, temporal radar "
                    "modeling, and CPU inference benchmarking."
                ),
            ],
        },
        {
            "name": "Autonomous Perception Lab",
            "date": "2026",
            "meta": "Python, Rust, YOLO, KITTI, LiDAR projection, tracking, BEV visualization",
            "bullets": [
                (
                    "Built a CPU-friendly autonomous driving perception pipeline with real KITTI "
                    "verification, sparse LiDAR depth projection, multi-object tracking, metrics, "
                    "replay export, and a Rust replay parser."
                ),
            ],
        },
        {
            "name": "Agent Workflow Benchmark",
            "date": "2026",
            "meta": "TypeScript, Node.js, CLI, React/Vite dashboard, eval tooling",
            "bullets": [
                (
                    "Built a benchmark suite for testing AI agents on email, calendar, task, memory, "
                    "privacy, prompt-injection, approval-boundary, latency, and trace-quality behavior."
                ),
            ],
        },
    ],
    "skills": [
        ("Product", "MVP definition, UX, launch strategy, onboarding, positioning, feedback loops"),
        (
            "Engineering",
            "TypeScript, React, Next.js, Node.js, Python, APIs, Convex, auth, billing, deployment",
        ),
        (
            "AI systems",
            "Agent workflows, approval gates, memory, tool use, evaluation, model/provider integration",
        ),
        (
            "Computer vision",
            "PyTorch, segmentation, detection, tracking, LiDAR projection, radar simulation, ONNX",
        ),
    ],
    "additional": [
        "Additional work: Maritime@Penn (2025), ArchiStella (2024).",
        "Languages: English (native), Croatian (native), Mandarin/Chinese (working fluency), and German (working fluency).",
    ],
}


def text_width(text: str, font: str, size: float) -> float:
    return stringWidth(text, font, size)


def draw_centered(c: canvas.Canvas, text: str, y: float, font: str, size: float, color) -> None:
    c.setFillColor(color)
    c.setFont(font, size)
    c.drawCentredString(PAGE_W / 2, y, text)


def draw_wrapped(
    c: canvas.Canvas,
    text: str,
    x: float,
    y: float,
    width: float,
    font: str = "Helvetica",
    size: float = 8.8,
    leading: float = 10.3,
    color=TEXT,
) -> float:
    c.setFont(font, size)
    c.setFillColor(color)

    avg_char = max(text_width("abcdefghijklmnopqrstuvwxyz", font, size) / 26, 1)
    max_chars = max(28, int(width / avg_char))
    lines: list[str] = []
    for raw in text.split("\n"):
        lines.extend(wrap(raw, width=max_chars) or [""])

    for line in lines:
        c.drawString(x, y, line)
        y -= leading
    return y


def section(c: canvas.Canvas, title: str, y: float) -> float:
    y -= 11.5
    c.setFont("Helvetica-Bold", 10.8)
    c.setFillColor(BLACK)
    c.drawString(LEFT, y, title)
    y -= 4.5
    c.setStrokeColor(RULE)
    c.setLineWidth(0.6)
    c.line(LEFT, y, RIGHT, y)
    return y - 9.5


def bullet(c: canvas.Canvas, text: str, y: float, indent: float = 16) -> float:
    c.setFont("Helvetica", 8.45)
    c.setFillColor(TEXT)
    c.drawString(LEFT + 5.5, y, "-")
    return (
        draw_wrapped(
            c,
            text,
            LEFT + indent,
            y,
            RIGHT - LEFT - indent,
            font="Helvetica",
            size=8.45,
            leading=9.7,
        )
        - 0.5
    )


def label_line(c: canvas.Canvas, label: str, body: str, y: float) -> float:
    size = 8.5
    c.setFont("Helvetica-Bold", size)
    c.setFillColor(BLACK)
    c.drawString(LEFT, y, label + ":")
    x = LEFT + text_width(label + ": ", "Helvetica-Bold", size)
    return draw_wrapped(c, body, x, y, RIGHT - x, font="Helvetica", size=size, leading=10.0) - 0.4


def draw_resume(path: Path) -> None:
    c = canvas.Canvas(str(path), pagesize=letter)
    c.setTitle("Ognjen Adzic Resume")

    y = TOP
    draw_centered(c, CONTENT["name"], y, "Helvetica-Bold", 19.8, BLACK)
    y -= 20
    draw_centered(c, CONTENT["contact"], y, "Helvetica", 8.1, MUTED)
    y -= 7
    c.setStrokeColor(BLACK)
    c.setLineWidth(1.0)
    c.line(LEFT, y, RIGHT, y)

    y = section(c, "PROFILE", y)
    y = draw_wrapped(c, CONTENT["profile"], LEFT, y, RIGHT - LEFT, size=8.9, leading=10.5)

    y = section(c, "EXPERIENCE", y)
    for item in CONTENT["experience"]:
        c.setFont("Helvetica-Bold", 9.7)
        c.setFillColor(BLACK)
        c.drawString(LEFT, y, f"{item['role']} - {item['org']}")
        c.setFillColor(MUTED)
        c.drawRightString(RIGHT, y, item["date"])
        y -= 11
        y = draw_wrapped(
            c,
            item["desc"],
            LEFT,
            y,
            RIGHT - LEFT,
            font="Helvetica-Oblique",
            size=8.25,
            leading=9.5,
            color=MUTED,
        )
        y += 0.2
        for item_bullet in item["bullets"]:
            y = bullet(c, item_bullet, y)
        y -= 1.0

    y = section(c, "SELECTED PROJECTS", y)
    for item in CONTENT["projects"]:
        c.setFont("Helvetica-Bold", 9.0)
        c.setFillColor(BLACK)
        c.drawString(LEFT, y, item["name"])
        c.setFillColor(MUTED)
        c.drawRightString(RIGHT, y, item["date"])
        y -= 9.6
        y = draw_wrapped(
            c,
            item["meta"],
            LEFT,
            y,
            RIGHT - LEFT,
            font="Helvetica-Oblique",
            size=7.75,
            leading=8.8,
            color=MUTED,
        )
        y += 0.2
        for item_bullet in item["bullets"]:
            y = bullet(c, item_bullet, y)
        y -= 0.6

    y = section(c, "SKILLS", y)
    for label, body in CONTENT["skills"]:
        y = label_line(c, label, body, y)

    y = section(c, "ADDITIONAL", y)
    for line in CONTENT["additional"]:
        y = draw_wrapped(c, line, LEFT, y, RIGHT - LEFT, size=8.45, leading=9.8)

    c.save()


def write_markdown(path: Path) -> None:
    lines = [
        f"# {CONTENT['name'].title()}",
        "",
        CONTENT["contact"],
        "",
        "## Profile",
        CONTENT["profile"],
        "",
        "## Experience",
    ]
    for item in CONTENT["experience"]:
        lines += [
            f"### {item['role']} - {item['org']} ({item['date']})",
            item["desc"],
        ]
        lines += [f"- {item_bullet}" for item_bullet in item["bullets"]]
        lines.append("")
    lines.append("## Selected projects")
    for item in CONTENT["projects"]:
        lines += [
            f"### {item['name']} ({item['date']})",
            item["meta"],
        ]
        lines += [f"- {item_bullet}" for item_bullet in item["bullets"]]
        lines.append("")
    lines.append("## Skills")
    lines += [f"- {label}: {body}" for label, body in CONTENT["skills"]]
    lines += ["", "## Additional"]
    lines += [f"- {line}" for line in CONTENT["additional"]]
    path.write_text("\n".join(lines) + "\n")


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    DOCS_DIR.mkdir(parents=True, exist_ok=True)
    for directory in (OUT_DIR, DOCS_DIR):
        draw_resume(directory / PDF_NAME)
        write_markdown(directory / MD_NAME)


if __name__ == "__main__":
    main()
