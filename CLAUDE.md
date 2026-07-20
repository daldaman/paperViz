# Project: Paper Marketing Site Builder (`pvz`)

## Overview

paperViz is a reusable engine, originally exported from Google AI Studio as a one-off AlphaQubit showcase, that turns a `papers/<slug>.json` content file into a themable, interactive marketing site for a research paper. It supports three figure classes — interactive templated components, static images cribbed from the paper PDF, and LLM-generated concept-map diagrams from a custom SVG spec — and deploys to GitHub Pages for embedding via iframe into David's Google Sites research hub. Content and figure generation happen at authoring time inside Claude Code sessions; the shipped app makes no LLM calls at runtime.

## Stack

- Vite 6, React 19 (TypeScript)
- Tailwind CSS v4, installed locally via `@tailwindcss/vite` (from Phase 1 onward — the AI Studio export shipped CDN Tailwind, which Phase 1 removes)
- `@react-three/fiber` / `@react-three/drei` / `three` (r3f scenes for the quantum/hero visuals)
- `framer-motion` (spring-driven interactive figures)
- `zod` (planned, from Phase 2 — content schema validation)
- Git for version control

## Key Commands

- Install dependencies: `npm install`
- Dev server: `npm run dev`
- Production build: `npm run build`
- Preview production build: `npm run preview`
- Typecheck (available from Phase 3 onward): `npm run typecheck` (`tsc --noEmit`)

## Conventions

- `papers/*.json` is the only per-paper content location once the content schema lands (Phase 2) — no paper-specific prose, numbers, or copy should live in component code after that point.
- Static figure assets for a paper live under `public/papers/<slug>/`.
- Asset paths must always go through the `withBase()` helper — never reference a bare `/papers/...` path directly. The production base path is `/paperViz/`; bare absolute paths resolve in dev but 404 once deployed.
- Never build a Tailwind class name by concatenating a JSON content value (e.g. `` `bg-${sign}-500` ``) — Tailwind's static scanner cannot see dynamically constructed class names and silently omits them from the generated CSS. Use a literal lookup table or inline styles for anything driven by JSON.
- `node_modules` is excluded from git (`.gitignore`) and should also be excluded from OneDrive sync — this repo lives under OneDrive, and syncing `node_modules` is a known source of file-lock issues elsewhere in the portfolio (see the uv-hardlink lesson for the same problem class with Python venvs).
- The original AI Studio export is preserved untouched at the sibling folder `../remix_-research-visualization` — this repo (`paperViz`) is a separate working copy; never edit the sibling.
- AlphaQubit content (`papers/alphaqubit.json`, from Phase 2 onward) is a permanent regression baseline, not a demo to be deleted — structural refactors must be checked for visual parity against it.

## IMPORTANT

- Numbers policy for any paper content sourced from real research (starting with the Phase 7 pilot): never eyeball coefficients, confidence intervals, or other figures off a published image. Use replication-output values supplied by David, or mark the figure "stylized" pending real values.
- This repo will be a **public** GitHub repository (`daldaman/paperViz`, required for free-tier GitHub Pages) — never commit confidential data, unpublished results, or anything not already public alongside a paper's own publication.
- Raw data is read-only across all ccProjects. Never modify files under `data/raw/` in any project (not directly applicable here — this project has no `data/raw/`, but the portfolio-wide rule still applies if one is ever added).
