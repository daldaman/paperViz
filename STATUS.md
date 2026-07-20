# paperViz — STATUS

**Phase:** active (Phase 1 complete)
**Last updated:** 2026-07-20

## Current state
- Repo born from the AI Studio "remix" export (byte-identical copy of the original `remix_-research-visualization` folder, which is left untouched).
- Phase 1 complete: CDN Tailwind, inline `tailwind.config`, and the esm.sh import map are gone; Tailwind v4 now builds locally via `@tailwindcss/vite`, bridged to the existing runtime CSS-var theme switching through `@theme inline` in `src/index.css`.
- `index.tsx`→`src/main.tsx`, `App.tsx`→`src/App.tsx` (git-mv'd, history preserved). `metadata.json`, `.env.local`, `types.ts`, and the vite.config.ts GEMINI `define` block are gone.
- App.tsx is still the 1552-line monolith with AlphaQubit content hardcoded in `src/paperData.ts` — that split is Phase 3.
- `npm run build` and dev/preview smoke tests pass; visual parity across the 4 theme presets, both 3D scenes, and the dark Innovation section still needs a human/browser check (orchestrator does this next) before Phase 2 starts.

## Blockers
- None.

## Next steps
- Visual parity check (browser, all 4 themes + hero scene + dark section) before proceeding past Phase 1, per plan risk #1.
- Phase 2: zod content schema (`PaperContentSchema`) + `papers/alphaqubit.json` regression-baseline migration.
- Phase 3: split `App.tsx` into `src/sections/` + `src/theme/`; add `npm run typecheck`.
- Full phase list: `tasks/todo.md`.
