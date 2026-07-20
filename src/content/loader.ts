/**
 * Loads every `papers/<slug>.json` file, validates it against
 * `PaperContentSchema`, and exposes only the papers that pass validation.
 *
 * Invalid content fails loudly (console.error with the full zod issue list)
 * and is excluded from the registry rather than rendered broken — a bad JSON
 * file should never take down the whole app.
 */
import { PaperContentSchema, type PaperContent } from './schema';

// Eagerly import every papers/*.json at build time. Path is repo-root-relative
// per Vite's import.meta.glob convention (NOT web/public relative).
const modules = import.meta.glob('/papers/*.json', { eager: true, import: 'default' }) as Record<
  string,
  unknown
>;

function slugFromPath(path: string): string {
  const match = path.match(/([^/]+)\.json$/);
  return match ? match[1] : path;
}

const papers: Record<string, PaperContent> = {};

for (const [path, raw] of Object.entries(modules)) {
  const slug = slugFromPath(path);
  const result = PaperContentSchema.safeParse(raw);

  if (!result.success) {
    console.error('[paperViz] INVALID paper content:', slug, JSON.stringify(result.error.issues, null, 2));
    continue;
  }

  papers[slug] = result.data;
}

export { papers };

export function listPapers(): { slug: string; meta: PaperContent['meta'] }[] {
  return Object.entries(papers).map(([slug, content]) => ({ slug, meta: content.meta }));
}
