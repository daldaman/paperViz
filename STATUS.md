# paperViz — STATUS

**Phase:** active (Phase 3 complete)
**Last updated:** 2026-07-20

## Current state
- Repo born from the AI Studio "remix" export (byte-identical copy of the original `remix_-research-visualization` folder, which is left untouched).
- Phase 1 complete: CDN Tailwind, inline `tailwind.config`, and the esm.sh import map are gone; Tailwind v4 now builds locally via `@tailwindcss/vite`, bridged to the existing runtime CSS-var theme switching through `@theme inline` in `src/index.css`.
- Phase 2 complete: `src/content/schema.ts` (zod `PaperContentSchema` + sub-schemas), `src/content/loader.ts` (validating `import.meta.glob` registry), and `papers/alphaqubit.json` (hand-migrated regression baseline).
- Phase 3 complete: the 1552-line `App.tsx` monolith is split into `src/sections/` (Nav, Hero, ProseSection, QuoteBlock, AuthorsSection, Footer), `src/theme/` (themes.ts, ThemeProvider, useTheme), and `src/customizer/` (CustomizerPanel, updateAtPath). `App.tsx` is now a ~150-line shell that loads `papers['alphaqubit']`, overlays a localStorage customization with schema-validated detect-and-clear, and mounts the pieces. `src/paperData.ts` is deleted; nothing renders from flat `PaperData` anymore — everything reads `PaperContent`.
- Added `ProseSectionSchema.layout` (`prose`/`figure-right`/`figure-left`/`figure-below`) to reproduce the four distinct section arrangements generically; verified pixel parity live in-browser across all 5 sections, all 4 theme presets, and embed mode.
- `components/Diagrams.tsx`'s three diagram components take flat props now instead of `paper: PaperData`.
- `npm run build` and `npm run typecheck` both clean.

## Blockers
- None.

## Next steps
- Phase 4: figure registry (`src/figures/registry.ts`), generalize `PerformanceMetricDiagram` → `InteractiveGroupedBar`, move quantum diagrams/scenes to `src/figures/quantum/`, add `StaticFigure`/`EventStudyExplorer`/`ConceptMapDiagram` (load the dataviz skill first).
- Phase 5 will replace Phase 3's hand-wired Content-tab indices (`sections[0]`, `figures[2]`, etc.) with a schema-generic recursive form, and rebuild the dropped per-figure show/hide toggles as a real "which figures exist" editor.
- Full phase list: `tasks/todo.md`.
