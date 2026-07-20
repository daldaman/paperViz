# paperViz — STATUS

**Phase:** active (Phase 2 complete)
**Last updated:** 2026-07-20

## Current state
- Repo born from the AI Studio "remix" export (byte-identical copy of the original `remix_-research-visualization` folder, which is left untouched).
- Phase 1 complete: CDN Tailwind, inline `tailwind.config`, and the esm.sh import map are gone; Tailwind v4 now builds locally via `@tailwindcss/vite`, bridged to the existing runtime CSS-var theme switching through `@theme inline` in `src/index.css`.
- `index.tsx`→`src/main.tsx`, `App.tsx`→`src/App.tsx` (git-mv'd, history preserved). `metadata.json`, `.env.local`, `types.ts`, and the vite.config.ts GEMINI `define` block are gone.
- Phase 2 complete: `src/content/schema.ts` (zod `PaperContentSchema` + sub-schemas), `src/content/loader.ts` (validating `import.meta.glob` registry), and `papers/alphaqubit.json` (hand-migrated regression baseline, cross-checked field-by-field and runtime-validated against the real schema). `npm run typecheck` script added; `src/vite-env.d.ts` added for `import.meta.glob`/`import.meta.env` typings.
- `App.tsx` is still the 1552-line monolith rendering from `src/paperData.ts`, unchanged this phase by design — `src/main.tsx` only gained a 2-line dev-only console log confirming the new registry loads (`papers` from `./content/loader`), so App.tsx and the new schema/loader coexist without double field-mapping until Phase 3 rewires rendering onto the schema.
- `npm run build` and `npm run typecheck` both clean (zero errors, including zero pre-existing errors elsewhere in the codebase).

## Blockers
- None.

## Next steps
- Phase 3: split `App.tsx` into `src/sections/` + `src/theme/`; rewire rendering onto `papers['alphaqubit']` from the Phase 2 schema/loader (this is where the deferred field-mapping happens); replace `main.tsx`'s dev-only log with real consumption.
- Visual parity check (browser, all 4 themes + hero scene + dark section) after Phase 3, per plan risk #1.
- Full phase list: `tasks/todo.md`.
