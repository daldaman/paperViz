/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Entry point: resolves `?paper=<slug>` against the loaded `papers`
 * registry and either mounts a single paper's site (`PaperSite`) or the
 * `Gallery`. No path router — every navigation between the gallery and a
 * paper page is a full page load carrying a query string, so GitHub Pages
 * never sees a nested path to 404 on (Phase 6 plan note).
 *
 * `PaperSite` (the former `AppShell`) owns the localStorage-backed
 * customization overlay for one paper and mounts the theme provider's
 * children + sections; markup/logic beyond that lives in src/sections,
 * src/theme, src/customizer, same as before Phase 6 — only the slug source
 * changed, from a hardcoded literal to a prop threaded from the URL.
 */
import React, { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { papers } from './content/loader';
import type { PaperContent } from './content/schema';
import { loadOverlay, saveOverlay, clearOverlay, clearLegacyStorage } from './content/storage';
import { ThemeProvider } from './theme/ThemeProvider';
import { useTheme } from './theme/useTheme';
import { Nav } from './sections/Nav';
import { Hero } from './sections/Hero';
import { ProseSection } from './sections/ProseSection';
import { AuthorsSection } from './sections/AuthorsSection';
import { Footer } from './sections/Footer';
import { CustomizerPanel } from './customizer/CustomizerPanel';
import { updateAtPath, type PathSegment } from './customizer/updateAtPath';
import { FigureRenderProvider } from './figures/FigureRenderContext';
import { Gallery } from './gallery/Gallery';

function loadInitialContent(slug: string): PaperContent | undefined {
  clearLegacyStorage();
  const fallback = papers[slug];
  return loadOverlay(slug) ?? fallback;
}

const EmbedBadge: React.FC = () => {
  const { embedMode, setEmbedMode } = useTheme();
  if (!embedMode) return null;

  const currentBaseUrl = window.location.origin + window.location.pathname;

  return (
    <div className="fixed top-4 left-4 z-40 bg-theme-card/85 backdrop-blur-md border border-theme-border rounded-full py-1.5 px-3.5 shadow-xs text-[11px] font-sans flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-theme-accent animate-pulse"></span>
      <span className="text-theme-main font-bold tracking-wider uppercase text-[10px]">Embedded Frame</span>
      <button
        onClick={() => setEmbedMode(false)}
        className="text-theme-accent hover:text-theme-main border-l border-theme-border pl-2 ml-1 font-semibold flex items-center gap-1"
        title="Preview full site layout"
      >
        Show Full
      </button>
      <a
        href={currentBaseUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-theme-muted hover:text-theme-main border-l border-theme-border pl-2 flex items-center gap-1"
        title="Open in new tab"
      >
        <ExternalLink size={12} />
      </a>
    </div>
  );
};

interface PaperSiteProps {
  slug: string;
}

const PaperSite: React.FC<PaperSiteProps> = ({ slug }) => {
  const [content, setContent] = useState<PaperContent | undefined>(() => loadInitialContent(slug));
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    if (content) {
      document.title = `${content.meta.title} — ${content.meta.subtitle}`;
    }
  }, [content?.meta.title, content?.meta.subtitle]);

  // An empty path replaces the whole tree (updateAtPath's base case) — this
  // is also how JsonImportExport's successful import path works
  // (ContentTab calls `updateField([], parsedContent)`), so both a single
  // field edit and a full-document import flow through the exact same
  // persist-then-render path.
  const updateField = (path: PathSegment[], value: unknown) => {
    setContent((prev) => {
      if (!prev) return prev;
      const next = updateAtPath(prev, path, value);
      saveOverlay(slug, next);
      return next;
    });
  };

  const resetContent = () => {
    setContent(papers[slug]);
    clearOverlay(slug);
  };

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-theme-bg text-theme-body p-6 text-center">
        Could not load paper content for "{slug}" — check the console for zod validation errors from src/content/loader.ts.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-bg text-theme-body selection:bg-theme-accent selection:text-white transition-colors duration-500">
      <EmbedBadge />
      <Nav content={content} />
      <Hero content={content} />

      <FigureRenderProvider slug={slug}>
        <main>
          {content.sections.map((section) => (
            <ProseSection key={section.id} section={section} figures={content.figures} />
          ))}
          <AuthorsSection authors={content.authors} />
        </main>
      </FigureRenderProvider>

      <Footer content={content} onOpenCustomizer={() => setPanelOpen(true)} />

      <CustomizerPanel
        content={content}
        slug={slug}
        updateField={updateField}
        resetContent={resetContent}
        open={panelOpen}
        onOpenChange={setPanelOpen}
      />
    </div>
  );
};

/**
 * Resolves `?paper=<slug>` once against the loaded `papers` registry (which
 * includes "_"-prefixed dev fixtures like `_preview` — only `listPapers()`,
 * used by the gallery, hides those from visitors). Read synchronously from
 * `window.location.search` as a lazy `useState` initializer rather than in
 * an effect (contrast `ThemeProvider`, which parses its own URL params in an
 * effect because it needs to mutate the DOM) — this app has no client-side
 * navigation, so the slug never changes after mount, and resolving it
 * synchronously avoids a flash of the wrong page (gallery, then paper) on
 * first paint.
 *
 * `hasOwnProperty` (not `slug in papers` / bare `papers[slug]`) guards
 * against `slug` colliding with an inherited `Object.prototype` key (e.g.
 * `?paper=toString`), which would otherwise read as "known" despite there
 * being no such paper.
 */
const AppRouter: React.FC = () => {
  const [slug] = useState<string | null>(() => new URLSearchParams(window.location.search).get('paper'));
  const knownSlug = slug !== null && Object.prototype.hasOwnProperty.call(papers, slug);

  useEffect(() => {
    if (slug !== null && !knownSlug) {
      console.warn(
        `[paperViz] Unknown paper slug "${slug}" in ?paper= — showing the gallery instead. Known slugs: ${
          Object.keys(papers).join(', ') || '(none loaded)'
        }`,
      );
    }
  }, [slug, knownSlug]);

  if (slug !== null && knownSlug) {
    return <PaperSite slug={slug} />;
  }
  return <Gallery />;
};

const App: React.FC = () => (
  <ThemeProvider>
    <AppRouter />
  </ThemeProvider>
);

export default App;
