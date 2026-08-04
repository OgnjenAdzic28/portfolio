from __future__ import annotations

from pathlib import Path
from textwrap import wrap

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "output" / "pdf"
PUBLIC_DIR = ROOT / "public"
DOCS_DIR = Path("/Users/ognjenadzic/Documents")

PDF_NAME = "Ognjen_Adzic_Resume.pdf"
MD_NAME = "Ognjen_Adzic_Resume.md"

PAGE_W, PAGE_H = letter
LEFT = 36
RIGHT = 576
CONTENT_W = RIGHT - LEFT

BLACK = colors.black
LINK_BLUE = colors.Color(0.0667, 0.3333, 0.8)

FONT_REG = "TimesNewRoman"
FONT_BOLD = "TimesNewRoman-Bold"
FONT_ITALIC = "TimesNewRoman-Italic"
FONT_ARIAL = "Arial"
FONT_ARIAL_BOLD = "Arial-Bold"


def register_fonts() -> None:
    base = Path("/System/Library/Fonts/Supplemental")
    pdfmetrics.registerFont(TTFont(FONT_REG, str(base / "Times New Roman.ttf")))
    pdfmetrics.registerFont(TTFont(FONT_BOLD, str(base / "Times New Roman Bold.ttf")))
    pdfmetrics.registerFont(TTFont(FONT_ITALIC, str(base / "Times New Roman Italic.ttf")))
    pdfmetrics.registerFont(TTFont(FONT_ARIAL, str(base / "Arial.ttf")))
    pdfmetrics.registerFont(TTFont(FONT_ARIAL_BOLD, str(base / "Arial Bold.ttf")))


CONTENT = {
    "name": "OGNJEN ADZIC",
    "contact_parts": [
        {"text": "+382 68 618 611"},
        {"text": "oginjo28@gmail.com", "url": "mailto:oginjo28@gmail.com"},
        {"text": "LinkedIn", "url": "https://www.linkedin.com/in/ognjenadzic"},
        {"text": "GitHub", "url": "https://github.com/OgnjenAdzic28"},
        {"text": "Portfolio", "url": "https://ognjenadzic.com"},
    ],
    "experience": [
        {
            "org": "Pingless",
            "location": None,
            "date": "2025 – 2026",
            "role": "Co-Founder",
            "bullets": [
                (
                    "Built and shipped SaaS platforms, AI automation tools, and web applications "
                    "with hands-on ownership across product scope, design, engineering, and deployment."
                ),
                (
                    "Iterated end-to-end product delivery for clients and internal tools, spanning "
                    "architecture, UI, and production launch."
                ),
            ],
        },
        {
            "org": "ArchiStella",
            "location": None,
            "date": "2024",
            "role": "Co-Founder",
            "bullets": [
                (
                    "Designed and built an architecture-focused product experience spanning UI/UX, "
                    "product scope, and application development."
                ),
            ],
        },
    ],
    "projects": [
        {
            "name": "Maritime Perception MVP",
            "subtitle": None,
            "date": "2026",
            "bullets": [
                (
                    "Built a maritime perception stack for water, sky, and obstacle segmentation, "
                    "vessel detection, tracking, synthetic radar segmentation, and temporal radar "
                    "modeling using PyTorch, DeepLabV3+, YOLOv8, ByteTrack, ConvLSTM, and ONNX."
                ),
                (
                    "Benchmarked CPU inference performance and shipped an interactive Gradio demo "
                    "for inspection and evaluation."
                ),
            ],
        },
        {
            "name": "Autonomous Perception Lab",
            "subtitle": None,
            "date": "2026",
            "bullets": [
                (
                    "Built a CPU-friendly autonomous driving perception pipeline with real KITTI "
                    "verification, sparse LiDAR depth projection, multi-object tracking, metrics, "
                    "and BEV visualization."
                ),
                (
                    "Implemented replay export tooling and a Rust replay parser for offline "
                    "inspection and evaluation."
                ),
            ],
        },
        {
            "name": "Agent Workflow Benchmark",
            "subtitle": None,
            "date": "2026",
            "bullets": [
                (
                    "Built a benchmark suite for testing AI agents on email, calendar, task, memory, "
                    "privacy, prompt-injection, approval-boundary, latency, and trace-quality behavior."
                ),
                (
                    "Shipped TypeScript/Node.js CLI tooling and a React/Vite dashboard for running "
                    "evals and inspecting results."
                ),
            ],
        },
    ],
    "skills": [
        (
            "Languages",
            "TypeScript, Python, Rust, JavaScript",
        ),
        (
            "Frameworks & Tools",
            "React, Next.js, Node.js, Convex, APIs, auth, billing, deployment, Gradio, ONNX",
        ),
        (
            "AI & Computer Vision",
            (
                "Agent workflows, approval gates, memory, tool use, evaluation, PyTorch, "
                "segmentation, detection, tracking, LiDAR projection, radar simulation"
            ),
        ),
        (
            "Spoken Languages",
            (
                "English (native), Croatian (native), Mandarin/Chinese (working fluency), "
                "German (working fluency)"
            ),
        ),
    ],
}


def tw(text: str, font: str, size: float) -> float:
    return stringWidth(text, font, size)


def draw_name(c: canvas.Canvas, name: str, y_baseline: float) -> None:
    """Draw all-caps name with larger first letter of each word, centered."""
    words = name.split()
    parts: list[tuple[str, float]] = []
    total = 0.0
    for i, word in enumerate(words):
        if i:
            parts.append((" ", 26.0))
            total += tw(" ", FONT_BOLD, 26.0)
        parts.append((word[0], 26.0))
        total += tw(word[0], FONT_BOLD, 26.0)
        if len(word) > 1:
            parts.append((word[1:], 18.2))
            total += tw(word[1:], FONT_BOLD, 18.2)

    x = (PAGE_W - total) / 2
    c.setFillColor(BLACK)
    for text, size in parts:
        c.setFont(FONT_BOLD, size)
        c.drawString(x, y_baseline, text)
        x += tw(text, FONT_BOLD, size)


def draw_hrule(c: canvas.Canvas, y: float, weight: float = 0.8) -> None:
    c.setStrokeColor(BLACK)
    c.setLineWidth(weight)
    c.line(LEFT, y, RIGHT, y)


def wrap_lines(text: str, font: str, size: float, width: float) -> list[str]:
    avg = max(tw("abcdefghijklmnopqrstuvwxyz", font, size) / 26, 1)
    max_chars = max(20, int(width / avg))
    lines: list[str] = []
    for raw in text.split("\n"):
        lines.extend(wrap(raw, width=max_chars, break_long_words=True, break_on_hyphens=True) or [""])
    return lines


def draw_wrapped(
    c: canvas.Canvas,
    text: str,
    x: float,
    y: float,
    width: float,
    font: str = FONT_REG,
    size: float = 10,
    leading: float = 12.5,
    color=BLACK,
) -> float:
    c.setFont(font, size)
    c.setFillColor(color)
    for line in wrap_lines(text, font, size, width):
        c.drawString(x, y, line)
        y -= leading
    return y


def section_header(c: canvas.Canvas, title: str, y: float) -> float:
    y -= 10
    c.setFont(FONT_BOLD, 11)
    c.setFillColor(BLACK)
    c.drawString(LEFT, y, title)
    y -= 3
    draw_hrule(c, y, weight=0.7)
    return y - 12


def draw_linked_text(
    c: canvas.Canvas,
    text: str,
    x: float,
    y: float,
    url: str,
    font: str = FONT_REG,
    size: float = 10,
) -> float:
    width = tw(text, font, size)
    c.setFillColor(LINK_BLUE)
    c.setFont(font, size)
    c.drawString(x, y, text)
    c.setStrokeColor(LINK_BLUE)
    c.setLineWidth(0.6)
    c.line(x, y - 1.2, x + width, y - 1.2)
    c.linkURL(url, (x, y - 2, x + width, y + size), relative=0)
    return x + width


def draw_contact(c: canvas.Canvas, y: float) -> float:
    sep = " ▪ "
    parts = CONTENT["contact_parts"]
    chunks: list[tuple[str, str | None]] = []
    for i, part in enumerate(parts):
        if i:
            chunks.append((sep, None))
        chunks.append((part["text"], part.get("url")))

    total = sum(tw(text, FONT_REG, 10) for text, _ in chunks)
    x = (PAGE_W - total) / 2
    c.setFont(FONT_REG, 10)
    for text, url in chunks:
        if url:
            x = draw_linked_text(c, text, x, y, url)
        else:
            c.setFillColor(BLACK)
            c.setFont(FONT_REG, 10)
            c.drawString(x, y, text)
            x += tw(text, FONT_REG, 10)
    return y


def entry_header(
    c: canvas.Canvas,
    left_bold: str,
    left_rest: str | None,
    date: str,
    y: float,
) -> float:
    c.setFont(FONT_BOLD, 10)
    c.setFillColor(BLACK)
    c.drawString(LEFT, y, left_bold)
    x = LEFT + tw(left_bold, FONT_BOLD, 10)
    if left_rest:
        c.setFont(FONT_REG, 10)
        c.drawString(x, y, left_rest)
    c.setFont(FONT_ITALIC, 10)
    c.drawRightString(RIGHT, y, date)
    return y - 12


def role_line(c: canvas.Canvas, role: str, y: float) -> float:
    c.setFont(FONT_ITALIC, 10)
    c.setFillColor(BLACK)
    c.drawString(LEFT, y, role)
    return y - 13


def bullet(c: canvas.Canvas, text: str, y: float) -> float:
    bullet_x = LEFT + 18
    text_x = LEFT + 36
    c.setFont(FONT_ARIAL, 10)
    c.setFillColor(BLACK)
    c.drawString(bullet_x, y, "●")
    return draw_wrapped(
        c,
        text,
        text_x,
        y,
        RIGHT - text_x,
        font=FONT_REG,
        size=10,
        leading=12.5,
    )


def skill_line(c: canvas.Canvas, label: str, body: str, y: float) -> float:
    label_text = f"{label}: "
    c.setFont(FONT_BOLD, 10)
    c.setFillColor(BLACK)
    c.drawString(LEFT, y, label_text)
    x = LEFT + tw(label_text, FONT_BOLD, 10)
    return draw_wrapped(c, body, x, y, RIGHT - x, font=FONT_REG, size=10, leading=12.5) - 1


def draw_resume(path: Path) -> None:
    c = canvas.Canvas(str(path), pagesize=letter)
    c.setTitle("Ognjen Adzic Resume")
    c.setAuthor("Ognjen Adzic")

    # Name
    y = PAGE_H - 52
    draw_name(c, CONTENT["name"], y)

    # Double rule under name
    y = PAGE_H - 67.5
    draw_hrule(c, y, weight=1.1)
    draw_hrule(c, y - 1.0, weight=0.5)

    # Contact
    y = PAGE_H - 82
    draw_contact(c, y)

    # Rule under contact
    y = PAGE_H - 92
    draw_hrule(c, y, weight=0.7)

    # EXPERIENCE
    y = section_header(c, "EXPERIENCE", y)
    for item in CONTENT["experience"]:
        loc = f" – {item['location']}" if item.get("location") else ""
        y = entry_header(c, item["org"], loc, item["date"], y)
        y = role_line(c, item["role"], y)
        for b in item["bullets"]:
            y = bullet(c, b, y)
        y -= 6

    # PROJECTS
    y = section_header(c, "PROJECTS", y)
    for item in CONTENT["projects"]:
        rest = f" – {item['subtitle']}" if item.get("subtitle") else None
        y = entry_header(c, item["name"], rest, item["date"], y)
        for b in item["bullets"]:
            y = bullet(c, b, y)
        y -= 6

    # TECHNICAL SKILLS
    y = section_header(c, "TECHNICAL SKILLS", y)
    for label, body in CONTENT["skills"]:
        y = skill_line(c, label, body, y)

    c.save()


def write_markdown(path: Path) -> None:
    lines = [
        f"# {CONTENT['name'].title()}",
        "",
        " ▪ ".join(part["text"] for part in CONTENT["contact_parts"]),
        "",
        "## Experience",
    ]
    for item in CONTENT["experience"]:
        loc = f" – {item['location']}" if item.get("location") else ""
        lines += [
            f"### {item['org']}{loc}  \t{item['date']}",
            f"*{item['role']}*",
        ]
        lines += [f"- {b}" for b in item["bullets"]]
        lines.append("")

    lines.append("## Projects")
    for item in CONTENT["projects"]:
        sub = f" – {item['subtitle']}" if item.get("subtitle") else ""
        lines += [f"### {item['name']}{sub}  \t{item['date']}"]
        lines += [f"- {b}" for b in item["bullets"]]
        lines.append("")

    lines.append("## Technical Skills")
    lines += [f"- **{label}:** {body}" for label, body in CONTENT["skills"]]
    path.write_text("\n".join(lines) + "\n")


def main() -> None:
    register_fonts()
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    DOCS_DIR.mkdir(parents=True, exist_ok=True)

    for directory in (OUT_DIR, PUBLIC_DIR, DOCS_DIR):
        draw_resume(directory / PDF_NAME)
    write_markdown(OUT_DIR / MD_NAME)
    write_markdown(DOCS_DIR / MD_NAME)
    print(f"Wrote {PDF_NAME} to output/pdf, public, and Documents")


if __name__ == "__main__":
    main()
