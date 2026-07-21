# Lessons — append-only correction log

## Phase 4 — AI Studio export shipped CSS classes with no backing @keyframes
`animate-fade-in` and `animate-fade-in-up` were used throughout `Nav.tsx`,
`AuthorsSection.tsx`, and `CustomizerPanel.tsx` (going back to the original
AI Studio export, before any of Claude Code's phases) but had **no**
`@keyframes` definition anywhere in the codebase — with plain Tailwind those
class names simply don't exist, so every element using them for its animation
was invisible-until-instant (no fade, no translate) the entire time. It was
never caught earlier because the *elements* still rendered fine — just
without their fade-in polish — so nothing looked "broken," it looked merely
undecorated. Found only by explicitly grepping for consumers of a utility
class and checking that a definition actually exists, not by visual
inspection alone.

**Rule for myself:** when a class name looks like a utility (`animate-*`,
`bg-*`, etc.) but isn't a stock Tailwind utility, grep the CSS source for its
definition before assuming it's dead code *or* assuming it works — AI-Studio
and other LLM-generated exports are not guaranteed to ship consistent
class/keyframe pairs. Added the missing `@keyframes fade-in` / `fade-in-up`
to `src/index.css` with `animation-fill-mode: both` (not just `forwards`) —
`both` is required, not optional, because several call sites combine the
class with an inline `animationDelay`; `forwards` alone leaves the element at
its default (fully visible) style during the delay and then snaps to the 0%
keyframe when the animation starts, which is a visible flash.

## Phase 4 — dev fixture layout must match how a component is actually shipped
`papers/_preview.json` put the `grouped-bar` figure in the `figure-left`
layout slot (narrow, `md:col-span-5`) to get visual variety across the
fixture's sections, but `InteractiveGroupedBar` has fixed-width internal
panels (`min-w-[240px]` text + `w-64` chart ≈ 528px) that don't shrink to fit
a narrow column — it overflowed its card. The real `alphaqubit.json` only
ever uses `grouped-bar` inside the wide `figure-below` layout. A dev fixture
that exercises a component in a layout context it was never designed for
produces a false "this looks broken" signal that's actually a fixture bug,
not a component bug — check how a component is *actually* used in production
content before concluding a rendering issue is real. Fixed by changing the
fixture's `layout` to `figure-below` to match.
