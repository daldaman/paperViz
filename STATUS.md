# paperViz — STATUS

**Phase:** design
**Last updated:** 2026-07-20

## Current state
- Repo born from the AI Studio "remix" export (byte-identical copy of the original `remix_-research-visualization` folder, which is left untouched).
- First commit is a pristine-export diffability anchor (`4e561ae`); scaffolding docs committed on top.
- Refactor (Phase 1 onward) not started: app is still the 1552-line `App.tsx` monolith with AlphaQubit content hardcoded in `src/paperData.ts`, CDN Tailwind, and an esm.sh import map.
- `npm install` run once to confirm React 19 + react-three-fiber/drei/three peer deps resolve; result logged below and in the handoff report.

## Blockers
- None.

## Next steps
- Phase 1: de-AI-Studio-ify (drop CDN Tailwind script, esm.sh import map, metadata.json, .env.local, GEMINI define block) + install Tailwind v4 locally via `@theme inline` CSS-var bridge, preserving runtime theme switching.
- Phase 2: zod content schema (`PaperContentSchema`) + `papers/alphaqubit.json` regression-baseline migration.
- Phase 3: split `App.tsx` into `src/sections/` + `src/theme/`; add `npm run typecheck`.
- Full phase list: `tasks/todo.md`.
