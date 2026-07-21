/**
 * Loads every `papers/<slug>.json` file, validates it against
 * `PaperContentSchema`, and exposes only the papers that pass validation.
 *
 * Invalid content fails loudly (console.error with the full zod issue list)
 * and is excluded from the registry rather than rendered broken — a bad JSON
 * file should never take down the whole app.
 *
 * After the main schema parse, each interactive figure's `props` is
 * separately re-validated against its component's registered props schema
 * (src/figures/registry.ts) — the root PaperContentSchema deliberately
 * leaves `InteractiveFigureSchema.props` as a loose `Record<string,
 * unknown>` (Phase 2's design: per-component prop shapes live in the figure
 * registry, not the root content schema). A figure whose props fail that
 * second check is excluded from the paper (loud console.error with the zod
 * issues) rather than handed to its component with the wrong shape — the
 * rest of the paper still renders.
 */
import { PaperContentSchema, type Figure, type PaperContent } from './schema';
import { getInteractivePropsSchema } from '../figures/registry';

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

/**
 * Slugs starting with "_" are dev/preview fixtures (e.g. "_preview") — they
 * load into `papers` like any other content file so they're reachable
 * during development, but are excluded from `listPapers()` so the future
 * gallery (Phase 6) never lists them to a visitor.
 */
function isDevFixtureSlug(slug: string): boolean {
  return slug.startsWith('_');
}

function validateFigureProps(figures: Figure[], slug: string): Figure[] {
  const validated: Figure[] = [];

  for (const figure of figures) {
    if (figure.kind !== 'interactive') {
      validated.push(figure);
      continue;
    }

    const schema = getInteractivePropsSchema(figure.component);
    if (!schema) {
      validated.push(figure); // no registered props schema — nothing to check
      continue;
    }

    const result = schema.safeParse(figure.props);
    if (!result.success) {
      console.error(
        `[paperViz] INVALID props for figure "${figure.id}" (component "${figure.component}") in paper "${slug}" — excluding this figure:`,
        JSON.stringify(result.error.issues, null, 2),
      );
      continue;
    }

    // Use the parsed (defaulted/coerced) props so the component always
    // receives exactly what its schema promises.
    validated.push({ ...figure, props: result.data as Record<string, unknown> });
  }

  return validated;
}

const papers: Record<string, PaperContent> = {};

for (const [path, raw] of Object.entries(modules)) {
  const slug = slugFromPath(path);
  const result = PaperContentSchema.safeParse(raw);

  if (!result.success) {
    console.error('[paperViz] INVALID paper content:', slug, JSON.stringify(result.error.issues, null, 2));
    continue;
  }

  papers[slug] = { ...result.data, figures: validateFigureProps(result.data.figures, slug) };
}

export { papers };

export function listPapers(): { slug: string; meta: PaperContent['meta'] }[] {
  return Object.entries(papers)
    .filter(([slug]) => !isDevFixtureSlug(slug))
    .map(([slug, content]) => ({ slug, meta: content.meta }));
}
