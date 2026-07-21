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
- [x] `src/sections/` (Nav [+ mobile menu inline], Hero, generic ProseSection, QuoteBlock, AuthorsSection, Footer)
- [x] `src/theme/` (themes.ts, ThemeProvider, useTheme with existing URL-param parsing)
- [x] All hardcoded microcopy → schema fields; App.tsx is now a ~150-line shell (`src/App.tsx`, 147 lines)
- [x] Add `npm run typecheck` (`tsc --noEmit`) — already existed from Phase 2, reverified clean
- [x] `src/customizer/CustomizerPanel.tsx` + `updateAtPath.ts` — content tab rebound to nested `PaperContent` paths
- [x] `src/content/schema.ts`: added `ProseSectionSchema.layout` enum (`prose`/`figure-right`/`figure-left`/`figure-below`); set per-section in `papers/alphaqubit.json` (introduction→prose, science→figure-right, innovation→figure-left, results→figure-below, impact→figure-left) — innovation and impact share `figure-left` but differ by `tone`; `src/sections/ProseSection.tsx`'s top-of-file comment documents why branching on `(layout, tone)` reproduces both exactly instead of forcing one compromise ratio
- [x] `components/Diagrams.tsx`: three diagram components take flat props instead of `paper: PaperData`; `PerformanceMetricDiagram` derives its distance switcher from `categories[]` and bars from `series[]`
- [x] Deleted `src/paperData.ts` (confirmed zero remaining imports via grep)
- [x] Removed Phase 2's dev-only loader log from `src/main.tsx`
- [x] `papers/alphaqubit.json`: added `eyebrow` for introduction ("Introduction") and impact ("IMPACT") — these were hardcoded literal strings in the old JSX that Phase 2 missed capturing; needed for pixel parity now that ProseSection renders eyebrows generically
- **Dropped controls (documented per plan):** the four per-figure show/hide toggles (Fig 1–4) — visibility is now presence in `figures[]`. Every other Content-tab input was rebound and still works.
- **Judgment calls (see final report for detail):** Footer's link row now reuses `Nav`'s generic entries (full labels) instead of the old hardcoded shorter "Intro"/"Team" labels, to avoid hardcoding section ids in component code; `figure-left` layout branches internally on `tone` to reproduce innovation's (dark, 50/50, `lg:` breakpoint) and impact's (light, 5/7, `md:` breakpoint) genuinely different original grids exactly, rather than forcing one compromise ratio.
- Verified live in-browser via the running dev server: all 5 sections, 4 theme presets, embed mode (`?embed=true&theme=forest`), customizer content-tab live edit, and the localStorage detect-and-clear path (seeded an old flat-shape value, confirmed the `console.info` + clear + fallback-to-JSON behavior).

## Phase 4 — Figure registry + components
- [x] `src/figures/registry.ts` (name → component + props schema; `renderFigure()` dispatches by `kind`, `getInteractivePropsSchema()` feeds `src/content/loader.ts`'s post-parse props validation). Unknown `component` name renders nothing + loud `console.error`.
- [x] `ProseSection.tsx`'s Phase-3 temporary literal switch on `figure.component` replaced by the registry lookup (`renderFigure`)
- [x] Generalize `PerformanceMetricDiagram` → `InteractiveGroupedBar` (move+rename only, per plan scope — kept its existing dark-stone visual design to preserve AlphaQubit pixel parity); registered props schema (categories min 1, series min 1, values keyed by category id)
- [x] `components/Diagrams.tsx` → `src/figures/quantum/SurfaceCodeDiagram.tsx` + `src/figures/quantum/TransformerDecoderDiagram.tsx` (git mv + split); `components/QuantumScene.tsx` → `src/figures/quantum/QuantumScene.tsx` (git mv); `components/` deleted
- [x] `src/lib/publicPath.ts`: `withBase(...segments)` joins `import.meta.env.BASE_URL` with segments, no double slashes
- [x] NEW `src/figures/StaticFigure.tsx`: figure + caption + optional credit, click-to-open lightbox (dark scrim, Escape/scrim-click close, framer-motion fade/scale), `loading="lazy"`; resolves `src` via `withBase('papers', slug, figure.src)` using a new `src/figures/FigureRenderContext.tsx` (`FigureRenderProvider`) threading the active slug down from `App.tsx`
- [x] NEW `src/figures/EventStudyExplorer.tsx` (registered `event-study-explorer`): themed SVG event-study chart — CI band, coefficient line (path-length draw-in), zero line, hollow reference-period marker, hover+focus tooltip, responsive viewBox. Dataviz-skill-informed decisions documented inline (single-series → no legend box; polarity read from position vs. the zero line rather than a second hue, since the palette has one accent to spend).
- [x] NEW `src/figures/ConceptMapDiagram.tsx` (registered for kind `diagram`): renders `ConceptMapSpec` — column/topological layout, node-type literal-lookup styling (driver/mechanism/outcome/moderator/neutral), edge-sign literal-lookup styling (positive = accent, negative = muted tone + always-on "⊖" chip + hollow arrowhead — never color alone), `dashed` style as an independent channel, foreignObject text wrapping, staggered framer-motion entrance, always-shown legend.
- [x] NEW `src/figures/hero/HeroSceneRegistry.tsx` (`meta.heroScene` → component) + `src/figures/hero/AbstractNetworkScene.tsx` (r3f drifting node/edge network, ≤40 nodes, accent hex pulled live from `useTheme()`/`THEMES`); `Hero.tsx` now uses the registry instead of a hardcoded scene
- [x] Fixed pre-existing bug (shipped since the original AI Studio export, found in Phase 3): `animate-fade-in`/`animate-fade-in-up` used in Nav/AuthorsSection/CustomizerPanel had no backing `@keyframes` anywhere — added to `src/index.css` (fill-mode `both`, not just `forwards`, so `animationDelay` doesn't flash); noted in `tasks/lessons.md`.
- [x] Dev fixture `papers/_preview.json` + `public/papers/_preview/placeholder.svg` exercising all new figure kinds + `abstract-network` hero; `src/content/loader.ts` excludes `_`-prefixed slugs from `listPapers()` while still loading them into `papers`
- [x] Dataviz-skill gap found on review (loaded `references/marks-and-anatomy.md`, `interaction.md`, `anti-patterns.md`, `components.md`): "every chart has a table-view toggle (the accessibility twin)" was missing — added an accessible `<details>`-based data table to `EventStudyExplorer`, `ConceptMapDiagram`, and `InteractiveGroupedBar`
- [x] Browser-verified all new figures + `abstract-network` hero live via `?paper=_preview`, including Cosmic Slate (dark) for concept-map negative-edge legibility; fixed one issue found live — the dev fixture had `grouped-bar` in the narrow `figure-left` layout slot (causing overflow) instead of the wide `figure-below` slot the component is actually shipped in on `alphaqubit.json`; not a component bug, a fixture misconfiguration, now corrected
- [x] Spot-checked `alphaqubit` still renders identically post-registry-refactor (hero scene, surface-code + transformer-decoder diagrams, grouped-bar in `figure-below`, quantum-computer-scene in `impact`, pull-quote)
- [x] `npm run typecheck` + `npm run build` clean
- [x] `src/paperData.ts` was already deleted in Phase 3 (confirmed no remaining references)

## Phase 5 — Customizer upgrades
- [x] Extract to `src/customizer/` (panel + 4 tabs): `CustomizerPanel.tsx` (991 -> 186 lines; drawer/FAB shell + presets + tab switcher) + `tabs/StyleTab.tsx` / `tabs/ContentTab.tsx` / `tabs/EmbedTab.tsx` / `tabs/GuideTab.tsx`. Style/Guide are byte-identical JSX moves — zero visual change, confirmed live in-browser.
- [x] ContentTab is schema-generic: `tabs/content/schemaIntrospect.ts` (unwrap ZodOptional/ZodNullable/ZodDefault via `.unwrap()`/`.removeDefault()`, `.describe()` extraction, `prettifyKey()` fallback, `buildPlaceholderValue()`) + `tabs/content/fields.tsx` (`ObjectFields`/`FieldRow` recursive dispatcher: string/textarea (>80 chars or any `body[]` item)/number/boolean-toggle/zod-enum-select/nested-object/generic-array/`z.record` -> JSON sub-editor). Grouped top-level as Meta/Sections/Figures/Authors/Footer with the original numbered-section styling.
- [x] `tabs/content/SectionsGroup.tsx` + `tabs/content/FiguresGroup.tsx`: the two arrays that get move-up/down + a schema-*valid* "+ Add" template (minimal ProseSection; per-kind minimal Figure via a kind selector for interactive/static/diagram). Both exclude the item's `id` field from the editable form (shown read-only instead) since it's a cross-referenced key (`sections[].figureId` -> `figures[].id`; `edges[].from/to` -> `nodes[].id`) — generalized via `hasEditableIdField()`, not hardcoded per-schema.
- [x] Generic arrays (meta.links, authors.list, and any nested array like a concept-map's nodes[]/edges[]) get add/remove only, using `buildPlaceholderValue()` for the new-item template — produces exactly the plan's `{label:'',url:''}` / `{name:'',role:''}` shapes with no per-field hardcoding.
- [x] NEW `src/customizer/JsonImportExport.tsx`, rendered at the top of ContentTab: Export = real `Blob` + `<a download="<slug>.json">`; Import = file picker (FileReader) or paste-textarea, both funnel through one `applyImport()` (JSON.parse -> PaperContentSchema.safeParse -> success replaces content via `updateField([], parsed)` / failure shows JSON-syntax or zod path+message issues inline, scrollable, themed, app untouched). Read-only live JSON `<pre>` preview kept at the bottom of ContentTab.
- [x] `src/content/storage.ts`: `loadOverlay`/`saveOverlay`/`clearOverlay`/`clearLegacyStorage`, key `paperviz:<slug>:content`, safeParse-on-load detect-and-clear (console.info). `slug` is always a parameter, never a literal in the module. App.tsx now uses these; `PAPER_SLUG` stays hardcoded (Phase 6 threads it from the URL) but is passed as an explicit `slug` prop everywhere downstream.
- [x] Legacy-key audit (git history, every commit `4e561ae`..`deeb767`): the flat storage key has always been the literal `'academic_paper_data'` — no second, differently-named Phase-3 key ever existed. `clearLegacyStorage()` removes just that one key, unconditionally, with a loud `console.info`.
- [x] `tabs/EmbedTab.tsx`: `getEmbedUrl()`/`getIframeCode()` gain `&paper=<slug>` (slug threaded in as a prop from CustomizerPanel <- App.tsx); the unused `allow="geolocation; microphone; camera"` attribute is gone from the generated iframe snippet. Compact-mode toggle, visitor-controls toggle, copy buttons unchanged.
- [x] `npm run typecheck` + `npm run build` both clean (only pre-existing >500kB chunk-size warning, unrelated to this phase).
- [x] Full browser verification against the running dev server (see Phase 5 report for the item-by-item checklist): live meta/section-paragraph edits, add/remove author, section reorder + revert, figures[].props JSON sub-editor rendering a real figure's props, export/paste-import round-trip (no-op), broken-JSON paste (missing required field) showing legible zod issues without harming the app, malformed-JSON-syntax paste showing a parse error, per-slug localStorage persisting across reload with the legacy key gone, Embed tab URL/snippet correctness. Content reset back to pristine AlphaQubit and localStorage cleared before finishing.

## Phase 6 — Multi-paper routing + gallery
- [x] `?paper=<slug>` (URLSearchParams, read synchronously as a lazy `useState` initializer — not in an effect, to avoid a gallery-then-paper flash on first paint) → looked up against the `papers` registry (`src/App.tsx`'s new `AppRouter`); known slug (including "_"-prefixed dev fixtures like `_preview`, which are in the record but hidden only from `listPapers()`) renders `PaperSite` (the former `AppShell`, now takes `slug` as a prop instead of a hardcoded `PAPER_SLUG` literal — confirmed Phase 5 had already threaded `slug` all the way through `storage.ts`/`FigureRenderProvider`/`CustomizerPanel`/`EmbedTab`, so this was the one line the Phase 5 comment said it would be)
- [x] Miss/no-param → minimal `src/gallery/Gallery.tsx` grid: per-card title (font-serif) / subtitle / `venue • publishDate` / description (`line-clamp-3`) / link to `?paper=<slug>`, preserving `theme`/`font`/`font-heading`/`font-body` (not embed/hide-customizer — those describe the current page, not a default for the next one) from the current URL. Simple "paperViz" + tagline header. No Nav/Hero/Footer/CustomizerPanel FAB — standalone page, same `bg-theme-*`/`text-theme-*` theming as the rest of the app (wrapped in the same top-level `ThemeProvider`, so `?theme=`/`?font=` on the gallery itself work too, not just when forwarded). No search/filter/tags (out of v1 scope).
- [x] Unknown slug → `console.warn` (lists known slugs) + falls back to `Gallery` (same branch as no-param)
- [x] No path router → no GH Pages SPA-404 problem (every nav is a full page load with a query string)
- [x] Dynamic `document.title`: `PaperSite` sets `${meta.title} — ${meta.subtitle}` in a `useEffect` keyed off `content.meta.title`/`.subtitle` (updates live if the customizer edits the title); `Gallery` sets `"paperViz — Interactive Paper Sites"` on mount. `index.html`'s static `<title>` is now just the pre-hydration fallback: `"paperViz"`.
- [x] `npm run typecheck` + `npm run build` both clean (same pre-existing >500kB chunk warning, unrelated to this phase)
- [x] Browser-verified against the running dev server: `/` shows the gallery with only the AlphaQubit card (`_preview` absent) and correct title; clicking the card navigates to `?paper=alphaqubit` and renders the full AlphaQubit site with correct title; `?paper=_preview` renders the dev fixture (all Phase 4 figure kinds present in its nav); `?paper=nonsense` renders the gallery and logs the expected `console.warn` (fires twice under dev-mode StrictMode's double effect-invocation — expected, production-only build doesn't double-fire); `?paper=alphaqubit&theme=cosmic&embed=true` renders AlphaQubit in the dark Cosmic Slate theme with the embed pill and nav hidden; landing on `/?theme=cosmic&font-heading=Lora` (no paper) rendered the gallery itself in that theme and its card's `href` correctly preserved both params (`?theme=cosmic&font-heading=Lora&paper=alphaqubit`, confirmed via the DOM, not just visually)

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
