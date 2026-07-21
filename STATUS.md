# paperViz — STATUS

**Phase:** active (deployed)
**Last updated:** 2026-07-20

## Current state
- Engine is live at `https://daldaman.github.io/paperViz/` (gallery), deployed via GitHub Actions (`.github/workflows/deploy.yml`: npm ci → typecheck → build → deploy) from the public repo `daldaman/paperViz`. Two papers ship: `?paper=alphaqubit` (demo/regression baseline) and `?paper=wfh-bank-efficiency` (pilot: "Cheaper to Run, Harder to Earn — Working From Home and Bank Efficiency", Aldama-Navarrete/Alexander/Curti, SSRN 6973859).
- All 9 build-plan phases complete (`tasks/todo.md`): schema-validated multi-paper content, generic section/figure/customizer architecture, multi-paper routing + gallery, and the Pages deploy pipeline. Live cross-origin iframe embed test (`embed=true&hide-customizer=true`) passed.
- Pilot ships with a static crib of Figure 1 (dynamic effects) instead of an interactive event-study rebuild — deliberate, see Blockers.

## Blockers
- Interactive event-study rebuild of the pilot's Figure 1 needs replication-output coefficients + CI bounds per horizon (4 panels) from David. Numbers policy forbids eyeballing them off the published image; nothing else is gating this.

## Next steps
- Embed the live site into David's Google Sites research hub (manual step on his end; iframe snippet available in the customizer's Embed tab).
- Add the interactive event-study to the pilot once replication output arrives.
- Identify and onboard future papers onto the engine.
