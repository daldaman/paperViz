# paperViz — Build Plan Checklist

Condensed from `.claude/plans/compressed-frolicking-feigenbaum.md`. Each phase should leave the app runnable; visual parity vs. the Phase-0 commit is checked after Phases 1 and 3.

## Phase 0 — Repo birth + portfolio registration
- [x] `git init -b main`; first commit = pristine AI Studio export (diffability anchor)
- [x] Add CLAUDE.md, STATUS.md, MEMORY.md, tasks/todo.md, tasks/lessons.md (this batch)
- [x] Register in `projectIndex/taxonomy.csv`, `projectIndex/CLAUDE.md` short-codes table, root `ccProjects/CLAUDE.md` portfolio table
- [x] Create `projectIndex/inventories/pvz.md` (Zone A/B format)

## Phase 1 — De-AI-Studio-ify + local Tailwind (highest visual-regression risk)
- [x] Remove CDN Tailwind `<script>`, inline `tailwind.config`, esm.sh import map from `index.html`
- [x] Install Tailwind v4 (`tailwindcss` + `@tailwindcss/vite`); `src/index.css` `@theme inline` bridge to existing CSS-var runtime theming
- [x] Move `index.tsx`→`src/main.tsx`, `App.tsx`→`src/App.tsx`; delete `metadata.json`, `.env.local`, GEMINI define block, dead `types.ts` interfaces; rewrite README
- [x] `npm install` early (watch React 19 + r3f/three ERESOLVE); commit lockfile
- [x] v3→v4 default-scale audit: remapped `shadow-sm`→`shadow-xs` (9), bare `rounded`→`rounded-sm` (32), `rounded-sm`→`rounded-xs` (3), `drop-shadow-sm`→`drop-shadow-xs` (1), `backdrop-blur-sm`→`backdrop-blur-xs` (5, found via compiled-CSS check, not in original plan checklist). No bare uncolored `border` utilities found — v4 border-color compat snippet not needed. No bare `ring` utilities found — no remap needed.

## Phase 2 — Content schema + validation
- [x] `src/content/schema.ts`: zod `PaperContentSchema` (meta/sections/figures/authors/footer) + `ConceptMapSpec`
- [x] `src/content/loader.ts`: `import.meta.glob('/papers/*.json', {eager:true})` + safeParse, loud errors
- [x] Hand-migrate AlphaQubit content → `papers/alphaqubit.json` (regression baseline)
- [x] `npm i zod` (runtime dep); `npm run typecheck` script added to `package.json`
- [x] `src/vite-env.d.ts` added (`/// <reference types="vite/client" />`) — needed for `import.meta.glob`/`import.meta.env` typings since this AI-Studio-derived scaffold never had one and `tsconfig.json`'s `"types": ["node"]` doesn't pull it in automatically
- [x] Validated the real `schema.ts` at runtime (esbuild-bundled, outside the repo in scratch) against `papers/alphaqubit.json` (passes) and 7 hand-broken variants (all correctly rejected with legible zod issues) — stronger than the plan's "read carefully" fallback bar
- **Deviation from plan text (approved in task brief):** did NOT rewire `src/App.tsx` to consume the new schema/loader this phase — that happens in Phase 3's component split, to avoid double field-mapping work. `App.tsx` still renders from `src/paperData.ts` unchanged (diff is empty for that file).
- **Deliberate dev-only hook:** `src/main.tsx` now imports `{ papers }` from `./content/loader` and logs `[paperViz] papers loaded: [...]` under `import.meta.env.DEV`. This is intentionally throwaway — Phase 3 replaces it with real consumption (Nav/sections/etc. reading from `papers[slug]`). Don't flag it as a leftover console.log.
- **Judgment call:** the `cryostat` figure's `description: "Interactive Cryostat visualization"` was NOT in the plan's literal figure-mapping list (which specified `props:{}` only) but WAS a hardcoded caption string in `App.tsx`'s JSX. Added it to avoid silently dropping content, per the "hand-migrate EVERYTHING ... plus the hardcoded strings in App.tsx" instruction.
- **Judgment call:** footer.blurb was kept **verbatim**, including "Created with Google AI Studio" — which is no longer literally true now that the app is a Vite/Claude-Code-built engine — because Phase 3's visual-parity regression check needs byte-identical rendered text vs. Phase 0. Flagging this phrase as a candidate for a real edit once Phase 3/5 content-editing tooling exists.

## Phase 3 — Split the 1552-line App.tsx
- [ ] `src/sections/` (Nav, MobileMenu, Hero, generic ProseSection, QuoteBlock, AuthorsSection, Footer)
- [ ] `src/theme/` (themes.ts, ThemeProvider, useTheme with existing URL-param parsing)
- [ ] All hardcoded microcopy → schema fields; App.tsx becomes a ~150-line shell
- [ ] Add `npm run typecheck` (`tsc --noEmit`)

## Phase 4 — Figure registry + components
- [ ] `src/figures/registry.ts` (name → component + props schema)
- [ ] Generalize `PerformanceMetricDiagram` → `InteractiveGroupedBar`; move quantum diagrams/scenes to `src/figures/quantum/`
- [ ] NEW: `StaticFigure` (caption/credit/lightbox, via `withBase()`), `EventStudyExplorer`, `ConceptMapDiagram` — load the dataviz skill first
- [ ] Delete `src/paperData.ts` when last consumer migrates

## Phase 5 — Customizer upgrades
- [ ] Extract to `src/customizer/` (panel + 4 tabs); ContentTab becomes schema-generic (recursive form from zod shape)
- [ ] NEW JsonImportExport: paste/file import with inline zod errors; real file download export
- [ ] localStorage per slug (`paperviz:<slug>:content`); detect-and-clear legacy `academic_paper_data` key
- [ ] Embed URLs gain `&paper=<slug>`; drop unused `geolocation; microphone; camera` iframe allow list

## Phase 6 — Multi-paper routing + gallery
- [ ] `?paper=<slug>` (URLSearchParams) → glob registry lookup
- [ ] Miss/no-param → minimal `Gallery.tsx` grid
- [ ] No path router → no GH Pages SPA-404 problem

## Phase 7 — Pilot paper content (WFH and Bank Efficiency, SSRN 6973859)
- [ ] `scripts/extract_figures.py` (anaconda python, PyMuPDF) → `public/papers/wfh-bank-efficiency/fig1-event-study.png`
- [ ] `papers/wfh-bank-efficiency.json`: prose sections, static Fig 1 crib, event-study-explorer rebuild, grouped-bar (Table 3/4), concept-map mechanism
- [ ] Numbers policy: get replication-output coefficients/CIs from David — never eyeball off the published figure; mark "stylized" if unavailable

## Phase 8 — Deploy
- [ ] `vite.config.ts` base: `/paperViz/` on build, `/` in dev
- [ ] `.github/workflows/deploy.yml` (checkout → setup-node 20 → npm ci → typecheck → build → upload/deploy Pages)
- [ ] One-time manual: create public repo `daldaman/paperViz`, enable Pages (Source=GitHub Actions)
- [ ] Verify: local build+preview under base path; live iframe embed test (both papers)

## Phase 9 — Docs finalization
- [ ] STATUS.md → active; taxonomy status → active
- [ ] MEMORY.md architecture + key-decisions log refreshed
- [ ] tasks/lessons.md for anything that bit; refresh `inventories/pvz.md`
