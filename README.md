# Ognjen Adzic

I'm the co-founder of [Pingless](https://pingless.dev) and ArchiStella, building AI-first software from idea to shipped product. My work spans agent workflows, SaaS applications, and computer vision systems for maritime and autonomous perception.

This repository is home to [ognjenadzic.com](https://ognjenadzic.com), my personal portfolio.

[LinkedIn](https://www.linkedin.com/in/ognjenadzic) · [X](https://x.com/OgnjenAdzic)

## Development

The site runs on React Router framework mode with Vite and server-side rendering.

```bash
npm install
npm run dev
```

Run the production checks with:

```bash
npm run lint
npm test
npm run typecheck
npm run build
```

Recent writing is loaded on the server before the home page renders and stays
unchanged while the GitHub graph loads. Healthy requests check Substack with a
10-second in-memory cache; pages do not use stale HTML caching. A one-minute cron
saves an outage fallback in KV. A failed live request falls back after two seconds.
Substack controls when newly published posts become available in its RSS feed.

## Resume

The resume is maintained as ATS-friendly LaTeX in `resume/Ognjen_Adzic_Resume.tex`.
Build the PDF for the portfolio with:

```bash
npm run build:resume
```

This requires [Tectonic](https://tectonic-typesetting.github.io/), available on macOS with `brew install tectonic`.
