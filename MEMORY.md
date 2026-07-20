# MEMORY.md

## Purpose

A reusable engine that turns a paper into a themable, embeddable marketing site, driven entirely by a `papers/<slug>.json` content file. One repo = one engine + many paper content files, not one site per paper. Sites are meant to be embedded via iframe into David's Google Sites hub, so all state must be fully specified by the JSON + URL params — no server, no runtime LLM calls.

Three figure classes the engine must support natively:
1. **Interactive templated** — React components driven by JSON props (e.g. a grouped-bar chart, an event-study explorer with leads/lags).
2. **Static cribbed from the PDF** — images cropped out of the paper (via a PyMuPDF extraction script) and served as plain assets with caption/credit.
3. **LLM-generated concept-map diagrams** — rendered from a custom SVG spec (nodes/edges with typed roles and signed edges), not Mermaid. Generation happens at *authoring time* inside a Claude Code session, not at runtime — there is no live LLM pipeline in the shipped app.

## Architecture

**Current (Phase 0, post pristine-export commit):** unmodified AI Studio export.
- `App.tsx` — 1552-line monolith: nav, hero, all prose sections, quantum diagrams, customizer panel, theme switching, all hardcoded for one paper (AlphaQubit).
- `src/paperData.ts` — AlphaQubit content hardcoded as TS objects/constants (not JSON, not schema-validated).
- `components/Diagrams.tsx`, `components/QuantumScene.tsx` — demo-specific interactive figures (quantum diagrams, r3f scene) with props tied to the AlphaQubit narrative.
- `index.html` — CDN Tailwind `<script>` + inline `tailwind.config` + esm.sh import map (no local npm resolution of react/three/etc. at runtime).
- `metadata.json`, `.env.local` (`GEMINI_API_KEY` placeholder) — AI Studio scaffolding, unused by the actual app logic; `vite.config.ts` still defines `process.env.API_KEY`/`GEMINI_API_KEY` from `.env.local` for no active reason.
- `types.ts` — a handful of interfaces, some already dead.

**Target (end of plan, per `tasks/todo.md` Phases 1-9):**
- `src/main.tsx` + `src/App.tsx` (moved from root), Tailwind v4 installed locally (`tailwindcss` + `@tailwindcss/vite`), `src/index.css` bridging Tailwind's `@theme inline` to the existing CSS-var runtime theme switcher so `bg-theme-bg` etc. keep resolving to `--color-bg` set at runtime.
- `src/content/schema.ts` — zod `PaperContentSchema` (meta/sections/figures/authors/footer) + `ConceptMapSpec` (nodes/edges). Per-figure-component prop schemas live in the figure registry, not the root union.
- `src/content/loader.ts` — `import.meta.glob('/papers/*.json', {eager:true})` + `safeParse`, loud errors on malformed content.
- `papers/alphaqubit.json` — hand-migrated AlphaQubit content, kept permanently as the regression baseline for visual-parity checks after Phases 1 and 3.
- `papers/wfh-bank-efficiency.json` — the pilot paper's content (Phase 7).
- `src/sections/`, `src/theme/`, `src/figures/` (incl. `src/figures/quantum/` for the AlphaQubit-specific demo figures), `src/customizer/` — App.tsx split into a ~150-line shell plus these directories.
- `.github/workflows/deploy.yml` — GitHub Pages deploy (Phase 8); `vite.config.ts` base path `/paperViz/` on build.

## Key decisions

- **[2026-07-20] One repo = engine + `papers/*.json`, not one repo per paper.** Keeps the figure/section component library and the zod schema shared across every paper site.
- **[2026-07-20] Custom SVG concept-map spec, not Mermaid.** Full control over themed styling (node types, signed edges) matching the site's own visual language rather than Mermaid's default rendering.
- **[2026-07-20] GitHub Pages hosting → `daldaman/paperViz` will be a PUBLIC repo — first public repo in the portfolio.** Required for Pages on the free plan. Portfolio-facing/marketing use case makes this the right trade (this is explicitly a showcase tool, unlike the research repos), but it is a deliberate first: no research data, no confidential content belongs in this repo ever.
- **[2026-07-20] Pilot paper = "Cheaper to Run, Harder to Earn: WFH and Bank Efficiency"** (Aldama-Navarrete, Alexander, Curti; SSRN 6973859; local PDF `C:/Users/david/OneDrive/Escritorio/6973859.pdf`). Chosen as the first real (non-demo) content file to prove the schema against actual research content.
- **[2026-07-20] AlphaQubit content is kept as `papers/alphaqubit.json`, not deleted.** It becomes the permanent regression baseline: after any structural refactor (Phases 1, 3), the AlphaQubit site must render pixel-identical to the Phase-0 commit across all 4 theme presets, both hero scenes, and the dark section.
- **[2026-07-20] Content/figure generation happens at authoring time in Claude Code sessions, not at runtime.** No LLM API calls ship in the deployed app; `.env.local`'s `GEMINI_API_KEY` placeholder and the AI-Studio `process.env.API_KEY` define block are dead weight to be removed in Phase 1.

## Open threads

- [ ] **Need replication-output coefficients for the pilot's Fig 1 (event study) and Table 3/4 (main results) from David before Phase 7.** Numbers policy: never eyeball values off the published figure/table image for a Fed paper — if real coefficients aren't available yet when Phase 7 starts, mark the interactive figure "stylized" pending real values rather than fabricate numbers.
- [ ] Phase 1 Tailwind v4 swap is the highest visual-regression-risk step in the whole plan — needs the side-by-side 4-theme/2-scene/dark-section check against the Phase-0 commit before proceeding.
- [ ] React 19 + `@react-three/fiber`/`@react-three/drei`/`three` have never been npm-installed in this copy of the export; watch for ERESOLVE peer-dep conflicts on first install (see Phase 0 install log in the handoff report / git history for the actual result).

## Session conventions

- npm for dependency management (this is the one TypeScript/JS project in the portfolio; no uv/R here).
- `npm run typecheck` (`tsc --noEmit`) becomes available starting Phase 3 — run it before calling any post-Phase-3 work done.
- Never build Tailwind class names by concatenating JSON content values (e.g. `` `bg-${sign}-500` ``) — Tailwind's static scanner won't see the dynamic class and it silently fails to generate. Use literal lookup tables or inline styles for anything driven by JSON.
- Asset paths for static figures must go through a `withBase()` helper, never a bare `/papers/...` string — the production base path is `/paperViz/`, and bare absolute paths 404 there even though they resolve fine in dev.
- `papers/*.json` is the only per-paper content location once Phase 2 lands — no paper-specific content should live in component code after that point.
- The original AI Studio export is preserved untouched at `remix_-research-visualization` (sibling folder) — never edit it; this repo is a separate copy.
