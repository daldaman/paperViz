/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Minimal standalone gallery — shown at `/` (no `?paper=` param) or when an
 * unknown slug is requested. Deliberately its own small page: no Nav, Hero,
 * Footer, or CustomizerPanel FAB, and no search/filter/tags (out of v1
 * scope per the Phase 6 plan). Themed via the same `bg-theme-*`/`text-theme-*`
 * Tailwind classes as the rest of the app, which resolve through the
 * `@theme inline` CSS-var bridge in src/index.css — so it automatically
 * follows whatever theme/font `ThemeProvider` (wrapping the whole app, see
 * App.tsx) has picked up from the URL.
 */
import React, { useEffect } from 'react';
import { listPapers } from '../content/loader';

const TAGLINE = 'Interactive marketing sites for research papers.';

/**
 * Builds a card's link href: sets `paper` to the target slug while carrying
 * forward any theme/font query params already present on the current URL
 * (e.g. landing on `/?theme=cosmic` and clicking a card should hand that
 * theme choice to the paper page too). Deliberately does NOT forward
 * embed/hide-customizer — those describe how *this* page should render, not
 * a default for the next one. Query-only relative href, so it resolves
 * against the current pathname unchanged under both the dev root and the
 * GitHub Pages base path.
 */
function buildPaperHref(slug: string): string {
  const current = new URLSearchParams(window.location.search);
  const next = new URLSearchParams();
  for (const key of ['theme', 'font', 'font-heading', 'font-body']) {
    const value = current.get(key);
    if (value !== null) next.set(key, value);
  }
  next.set('paper', slug);
  return `?${next.toString()}`;
}

export const Gallery: React.FC = () => {
  useEffect(() => {
    document.title = 'paperViz — Interactive Paper Sites';
  }, []);

  const papers = listPapers();

  return (
    <div className="min-h-screen bg-theme-bg text-theme-body transition-colors duration-500">
      <header className="container mx-auto px-6 pt-20 pb-12 text-center">
        <h1 className="font-serif text-4xl md:text-5xl font-medium text-theme-main mb-3">paperViz</h1>
        <p className="text-theme-muted text-base md:text-lg">{TAGLINE}</p>
      </header>

      <main className="container mx-auto px-6 pb-24">
        {papers.length === 0 ? (
          <p className="text-center text-theme-muted">No papers published yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {papers.map(({ slug, meta }) => (
              <a
                key={slug}
                href={buildPaperHref(slug)}
                className="group block bg-theme-card border border-theme-border rounded-2xl p-6 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="text-xs font-bold uppercase tracking-wider text-theme-accent mb-3">
                  {meta.venue} • {meta.publishDate}
                </div>
                <h2 className="font-serif text-2xl font-semibold text-theme-main mb-1 group-hover:text-theme-accent transition-colors">
                  {meta.title}
                </h2>
                <p className="text-sm italic text-theme-muted mb-4">{meta.subtitle}</p>
                <p className="text-sm text-theme-body leading-relaxed line-clamp-3">{meta.description}</p>
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
