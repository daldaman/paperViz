/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Per-slug localStorage overlay for customizer edits. Replaces the single
 * flat `academic_paper_data` key App.tsx used through Phase 4 — every paper
 * now gets its own key (`paperviz:<slug>:content`) so a second paper (Phase
 * 6) doesn't clobber the first paper's saved edits. `slug` is always a
 * caller-supplied argument, never a literal in here, so this module has no
 * paper-specific knowledge of its own.
 *
 * `clearLegacyStorage()` is a one-time cleanup of the pre-Phase-5 key.
 * Checked against git history (every commit from the original AI Studio
 * export through Phase 4's `deeb767`): the literal has always been
 * `'academic_paper_data'` — there was never a second, differently-named key
 * introduced at Phase 3, so there is exactly one legacy key to remove, not
 * two.
 */
import { PaperContentSchema, type PaperContent } from './schema';

const LEGACY_KEY = 'academic_paper_data';

function storageKey(slug: string): string {
  return `paperviz:${slug}:content`;
}

/** Loads a slug's saved overlay, if any. Returns undefined if there is none, or if it's present but no longer matches PaperContentSchema (detect-and-clear, loud console.info — mirrors the pre-Phase-5 behavior in App.tsx). */
export function loadOverlay(slug: string): PaperContent | undefined {
  const key = storageKey(slug);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return undefined;

    const parsed = JSON.parse(raw);
    const result = PaperContentSchema.safeParse(parsed);
    if (result.success) {
      return result.data;
    }

    console.info(
      `[paperViz] Stored customization at localStorage key "${key}" no longer matches the PaperContent schema — clearing it and reloading from papers/${slug}.json.`,
      result.error.issues,
    );
    localStorage.removeItem(key);
    return undefined;
  } catch (e) {
    console.error(e);
    try {
      localStorage.removeItem(key);
    } catch {
      // localStorage unavailable (private browsing, etc.) — nothing more we can do
    }
    return undefined;
  }
}

export function saveOverlay(slug: string, content: PaperContent): void {
  try {
    localStorage.setItem(storageKey(slug), JSON.stringify(content));
  } catch (e) {
    console.error(e);
  }
}

export function clearOverlay(slug: string): void {
  try {
    localStorage.removeItem(storageKey(slug));
  } catch (e) {
    console.error(e);
  }
}

/** One-time removal of the pre-Phase-5 flat storage key. Safe to call unconditionally on every load — a no-op once it's already been removed. */
export function clearLegacyStorage(): void {
  try {
    if (localStorage.getItem(LEGACY_KEY) !== null) {
      console.info(
        `[paperViz] Removing legacy localStorage key "${LEGACY_KEY}" (pre-Phase-5 flat single-paper storage, superseded by per-slug "paperviz:<slug>:content" keys).`,
      );
      localStorage.removeItem(LEGACY_KEY);
    }
  } catch (e) {
    console.error(e);
  }
}
