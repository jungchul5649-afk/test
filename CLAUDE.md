# CLAUDE.md

This file provides guidance for AI assistants (Claude Code and similar) working in this repository.

## Project Purpose

Nimbus Server Console — a design mockup (시안) of a web server management dashboard: traffic chart, resource usage, instance list, and live logs. All data is static/mock; there is no backend.

## Tech Stack

- React 18 + Vite 5
- Tailwind CSS 3 (PostCSS + autoprefixer)
- lucide-react for icons

## Directory Layout

- `index.html` — Vite entry, loads Inter / JetBrains Mono from Google Fonts
- `src/main.jsx` — React root
- `src/App.jsx` — the whole dashboard (mock data constants at the top, small components inline)
- `src/index.css` — Tailwind directives

## Development

```bash
npm install
npm run dev      # local dev server
npm run build    # production build to dist/
```

No tests or linter are configured yet.

## Repository Info

- **GitHub**: `jungchul5649-afk/test`
- **Development branch convention**: Feature work happens on `claude/<description>` branches; merge target is `main`.

## Git Workflow

1. **Branch**: Always develop on the designated feature branch, never directly on `main`.
2. **Commit messages**: Write concise imperative-mood subject lines (e.g., `Add user auth module`). Keep the body focused on *why*, not *what*.
3. **Push**: Use `git push -u origin <branch-name>`. Retry up to 4 times with exponential backoff (2s, 4s, 8s, 16s) on network errors.
4. **Pull requests**: Do not open a PR unless the user explicitly asks.

## General Conventions

- Prefer editing existing files over creating new ones.
- Do not add comments that restate what the code does — only comment when the *why* is non-obvious.
- Do not add error handling for impossible scenarios; trust internal invariants.
- Do not introduce abstractions beyond what the current task requires.
- Delete unused code rather than commenting it out or leaving backwards-compatibility shims.

## Adding New Content

When source files are added, update this CLAUDE.md to document:

- **Project purpose** — what the project does and its primary users.
- **Tech stack** — languages, frameworks, major libraries, and their versions.
- **Directory layout** — a brief map of top-level directories and their roles.
- **Development setup** — how to install dependencies and run the project locally.
- **Testing** — how to run tests and what the test suite covers.
- **Linting / formatting** — tools used and how to run them.
- **Key conventions** — naming rules, file organization patterns, architectural decisions.
- **Environment variables** — required env vars and where to source them.
