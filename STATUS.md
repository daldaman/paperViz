# paperViz — STATUS

**Phase:** active (deployed + embedded)
**Last updated:** 2026-07-30

## Current state
- Engine is live at `https://daldaman.github.io/paperViz/` (gallery), deployed via GitHub Actions (`.github/workflows/deploy.yml`: npm ci → typecheck → build → deploy) from the public repo `daldaman/paperViz`. Three papers ship: `?paper=alphaqubit` (demo/regression baseline), `?paper=wfh-bank-efficiency` (pilot: "Cheaper to Run, Harder to Earn", Aldama-Navarrete/Alexander/Curti, SSRN 6973859), and `?paper=dark-banking` ("Dark Banking? Banks and Illicit Deposit Flows", Aldama-Navarrete solo, SSRN 3811752 — onboarded 2026-07-30, embedding into the Sites hub in progress).
- All 9 build-plan phases complete (`tasks/todo.md`): schema-validated multi-paper content, generic section/figure/customizer architecture, multi-paper routing + gallery, and the Pages deploy pipeline. Live cross-origin iframe embed test (`embed=true&hide-customizer=true`) passed.
- Pilot ships with a static crib of Figure 1 (dynamic effects) instead of an interactive event-study rebuild — deliberate, see Blockers.
- Pilot is embedded live in David's Google Sites research hub (whole-page By-URL embed, verified working 2026-07-22); the embed badge's "open in new tab" link now opens the exhibit itself rather than the gallery (`fd40c84`).

## Blockers
- Interactive event-study rebuild of the pilot's Figure 1 needs replication-output coefficients + CI bounds per horizon (4 panels) from David. Numbers policy forbids eyeballing them off the published image; nothing else is gating this.

## Next steps
- Add the interactive event-study to the pilot once replication output arrives.
- Identify and onboard future papers onto the engine.
