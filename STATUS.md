# paperViz — STATUS

**Phase:** active (Phase 4 complete)
**Last updated:** 2026-07-20

## Current state
- Repo born from the AI Studio "remix" export (byte-identical copy of the original `remix_-research-visualization` folder, which is left untouched).
- Phase 1 complete: CDN Tailwind, inline `tailwind.config`, and the esm.sh import map are gone; Tailwind v4 now builds locally via `@tailwindcss/vite`, bridged to the existing runtime CSS-var theme switching through `@theme inline` in `src/index.css`.
- Phase 2 complete: `src/content/schema.ts` (zod `PaperContentSchema` + sub-schemas), `src/content/loader.ts` (validating `import.meta.glob` registry), and `papers/alphaqubit.json` (hand-migrated regression baseline).
- Phase 3 complete: the 1552-line `App.tsx` monolith is split into `src/sections/` (Nav, Hero, ProseSection, QuoteBlock, AuthorsSection, Footer), `src/theme/` (themes.ts, ThemeProvider, useTheme), and `src/customizer/` (CustomizerPanel, updateAtPath). `App.tsx` is now a ~150-line shell that loads `papers['alphaqubit']`, overlays a localStorage customization with schema-validated detect-and-clear, and mounts the pieces. `src/paperData.ts` is deleted; nothing renders from flat `PaperData` anymore — everything reads `PaperContent`.
- Added `ProseSectionSchema.layout` (`prose`/`figure-right`/`figure-left`/`figure-below`) to reproduce the four distinct section arrangements generically; verified pixel parity live in-browser across all 5 sections, all 4 theme presets, and embed mode.
- Phase 4 complete: `src/figures/registry.ts` maps figure `kind`/`component` → React component + optional zod props schema; `ProseSection.tsx`'s Phase-3 temporary switch is gone. `components/` is deleted — its three diagrams moved to `src/figures/quantum/` (`SurfaceCodeDiagram.tsx`, `TransformerDecoderDiagram.tsx`, `QuantumScene.tsx`), and `PerformanceMetricDiagram` was renamed to `src/figures/InteractiveGroupedBar.tsx` (move+rename only, per plan scope — kept its existing dark-stone visual design). Three new figure components: `StaticFigure` (lightbox, via `withBase()` + a new `FigureRenderContext` threading the active slug), `EventStudyExplorer` (themed SVG event-study/local-projections chart), `ConceptMapDiagram` (themed SVG concept map, literal-lookup node/edge styling). New `src/figures/hero/HeroSceneRegistry.tsx` + `AbstractNetworkScene.tsx` (r3f drifting network, accent hex from `useTheme()`). Fixed a pre-existing bug: `animate-fade-in`/`animate-fade-in-up` had no backing `@keyframes` anywhere in the original export — added to `src/index.css`. All colors route through theme CSS vars / `useTheme()`; nothing hardcodes a palette hex outside the (color-inert) SVG placeholder fixture image. Dev fixture `papers/_preview.json` exercises every new figure kind + the abstract-network hero; `_`-prefixed slugs load but are excluded from `listPapers()`. Browser-verified across all 4 theme presets (including Cosmic Slate for concept-map negative-edge legibility) and re-verified `alphaqubit` still renders identically.
- `npm run build` and `npm run typecheck` both clean.

## Blockers
- None.

## Next steps
- Phase 5: customizer upgrades — extract to `src/customizer/` (panel + 4 tabs), make `ContentTab` schema-generic (recursive form from zod shape via `.describe()` labels), add `JsonImportExport` (paste/file import with inline zod errors, real file download export), move to per-slug localStorage keys (`paperviz:<slug>:content`), embed URLs gain `&paper=<slug>`.
- Phase 5 will replace Phase 3's hand-wired Content-tab indices (`sections[0]`, `figures[2]`, etc.) with a schema-generic recursive form, and rebuild the dropped per-figure show/hide toggles as a real "which figures exist" editor.
- Full phase list: `tasks/todo.md`.
