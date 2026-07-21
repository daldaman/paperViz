# MEMORY.md

## Purpose

A reusable engine that turns a paper into a themable, embeddable marketing site, driven entirely by a `papers/<slug>.json` content file. One repo = one engine + many paper content files, not one site per paper. Sites are meant to be embedded via iframe into David's Google Sites hub, so all state must be fully specified by the JSON + URL params — no server, no runtime LLM calls.

Three figure classes the engine must support natively:
1. **Interactive templated** — React components driven by JSON props (e.g. a grouped-bar chart, an event-study explorer with leads/lags).
2. **Static cribbed from the PDF** — images cropped out of the paper (via a PyMuPDF extraction script) and served as plain assets with caption/credit.
3. **LLM-generated concept-map diagrams** — rendered from a custom SVG spec (nodes/edges with typed roles and signed edges), not Mermaid. Generation happens at *authoring time* inside a Claude Code session, not at runtime — there is no live LLM pipeline in the shipped app.

## Architecture

**Current (post Phase 8, deployed and live):**

```
papers/<slug>.json  (zod PaperContentSchema, validated at load
                      via import.meta.glob loader; '_'-prefixed
                      slugs = dev fixtures hidden from gallery)
        |
        v
sections renderer (generic ProseSection: layout enum
        prose/figure-right/figure-left/figure-below,
        crossed with an orthogonal tone: default/inverse)
        |
        v
figure registry (kind: static/diagram/interactive; components:
        grouped-bar, coefficient-bar, event-study-explorer,
        surface-code, transformer-decoder, quantum-computer-scene;
        hero scenes: quantum/abstract-network/none)
        |
        v
customizer (schema-generic form, JSON import/export,
        per-slug localStorage overlay)
        |
        v
?paper= routing + gallery -> GitHub Pages under /paperViz/ base
        (static assets resolved via withBase())
```

Two papers ship live: `alphaqubit` (demo/regression baseline) and `wfh-bank-efficiency` (pilot, real research content). `src/paperData.ts` and the old monolithic `App.tsx` are gone — everything renders from `PaperContent` read through the registry/schema stack above.

## Key decisions

- **[2026-07-20] One repo = engine + `papers/*.json`, not one repo per paper.** Keeps the figure/section component library and the zod schema shared across every paper site.
- **[2026-07-20] Custom SVG concept-map spec, not Mermaid.** Full control over themed styling (node types, signed edges) matching the site's own visual language rather than Mermaid's default rendering.
- **[2026-07-20] GitHub Pages hosting → `daldaman/paperViz` will be a PUBLIC repo — first public repo in the portfolio.** Required for Pages on the free plan. Portfolio-facing/marketing use case makes this the right trade (this is explicitly a showcase tool, unlike the research repos), but it is a deliberate first: no research data, no confidential content belongs in this repo ever.
- **[2026-07-20] Pilot paper = "Cheaper to Run, Harder to Earn: WFH and Bank Efficiency"** (Aldama-Navarrete, Alexander, Curti; SSRN 6973859; local PDF `C:/Users/david/OneDrive/Escritorio/6973859.pdf`). Chosen as the first real (non-demo) content file to prove the schema against actual research content.
- **[2026-07-20] AlphaQubit content is kept as `papers/alphaqubit.json`, not deleted.** It becomes the permanent regression baseline: after any structural refactor (Phases 1, 3), the AlphaQubit site must render pixel-identical to the Phase-0 commit across all 4 theme presets, both hero scenes, and the dark section.
- **[2026-07-20] Content/figure generation happens at authoring time in Claude Code sessions, not at runtime.** No LLM API calls ship in the deployed app; `.env.local`'s `GEMINI_API_KEY` placeholder and the AI-Studio `process.env.API_KEY` define block are dead weight to be removed in Phase 1.
- **[2026-07-20] `CoefficientBar` built as a new figure component instead of reusing `grouped-bar` for the pilot's Table 3 estimates.** `InteractiveGroupedBar` assumes non-negative magnitudes; the pilot's cost/revenue/profit coefficients are signed (can be negative), so a zero-anchored diverging bar with p-value stars was needed instead.
- **[2026-07-20] `tone` made orthogonal to `layout` in `ProseSection` after the pilot exposed a coupling bug.** Originally only the `figure-left` layout had a dark/`inverse` rendering branch; the pilot's `prose`+`inverse` impact section rendered with inverse text colors on a light background. Fixed via a shared `INVERSE_SECTION_CLASS`/`InverseGlow` that any layout can opt into, plus an `inverse` variant on `QuoteBlock`. AlphaQubit's `figure-left`+`inverse` innovation section regression-checked as unchanged after the fix.
- **[2026-07-20] Interactive event-study rebuild of the pilot's Figure 1 deferred; static crib shipped instead.** The numbers policy forbids eyeballing coefficients/CI bounds off a published figure image, and the underlying per-horizon values aren't tabulated anywhere in the paper. Waiting on replication output from David rather than shipping a "stylized" placeholder next to the real static figure on the same page.
- **[2026-07-20] Deployed public on GitHub Pages — first public repository in the ccProjects portfolio.** `daldaman/paperViz` is live at `https://daldaman.github.io/paperViz/`, deploy source = GitHub Actions (`.github/workflows/deploy.yml`: npm ci -> typecheck -> build -> deploy). Verified via a live cross-origin iframe embed test (`embed=true&hide-customizer=true`).
- **[2026-07-20] SSRN's own download link serves a truncated, protected preview PDF — never source figures from it.** Always extract from the local, fully-downloaded PDF (`C:/Users/david/OneDrive/Escritorio/6973859.pdf` for the pilot) using `scripts/extract_figures.py` (PyMuPDF, run via the Anaconda Python interpreter — see the portfolio-wide `project_gemini-mcp-anaconda-python` lesson for why a bare `python` can resolve to the wrong environment).

## Open threads

- [ ] **Need replication-output coefficients for the pilot's Fig 1 (event study — coefficients + CI bounds per horizon, 4 panels) from David.** Numbers policy: never eyeball values off a published figure/table image for a Fed paper. Once available, build the `event-study-explorer` figure for `wfh-bank-efficiency.json` to replace/supplement the static crib.
- [ ] Possible next papers to onboard onto the engine once identified (no candidates queued yet).

## Session conventions

- npm for dependency management (this is the one TypeScript/JS project in the portfolio; no uv/R here).
- `npm run typecheck` (`tsc --noEmit`) — run before calling any work done; `npm run build` likewise (both must be clean; the CI deploy workflow gates on both).
- Never build Tailwind class names by concatenating JSON content values (e.g. `` `bg-${sign}-500` ``) — Tailwind's static scanner won't see the dynamic class and it silently fails to generate. Use literal lookup tables or inline styles for anything driven by JSON.
- Asset paths for static figures must go through a `withBase()` helper, never a bare `/papers/...` string — the production base path is `/paperViz/`, and bare absolute paths 404 there even though they resolve fine in dev.
- `papers/*.json` is the only per-paper content location — no paper-specific content should live in component code.
- The original AI Studio export is preserved untouched at `remix_-research-visualization` (sibling folder) — never edit it; this repo is a separate copy.
- Figure numbers for real papers come only from printed tables or replication output — never from eyeballing a published figure image. Mark a figure "stylized" and wait rather than fabricate or estimate values.
