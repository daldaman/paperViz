/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Thin shell: loads content, owns the localStorage-backed customization
 * overlay, and mounts the theme provider + sections. All markup/logic that
 * used to live here has moved to src/sections, src/theme, src/customizer.
 */
import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { papers } from './content/loader';
import { PaperContentSchema, type PaperContent } from './content/schema';
import { ThemeProvider } from './theme/ThemeProvider';
import { useTheme } from './theme/useTheme';
import { Nav } from './sections/Nav';
import { Hero } from './sections/Hero';
import { ProseSection } from './sections/ProseSection';
import { AuthorsSection } from './sections/AuthorsSection';
import { Footer } from './sections/Footer';
import { CustomizerPanel } from './customizer/CustomizerPanel';
import { updateAtPath, type PathSegment } from './customizer/updateAtPath';

const STORAGE_KEY = 'academic_paper_data';
const PAPER_SLUG = 'alphaqubit'; // hardcoded until Phase 6's multi-paper routing

function loadInitialContent(): PaperContent | undefined {
  const fallback = papers[PAPER_SLUG];

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const result = PaperContentSchema.safeParse(parsed);
      if (result.success) {
        return result.data;
      }
      console.info(
        '[paperViz] Stored customization at localStorage key "academic_paper_data" no longer matches the PaperContent schema (likely the old flat PaperData shape) — clearing it and reloading from papers/alphaqubit.json.',
        result.error.issues,
      );
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (e) {
    console.error(e);
    localStorage.removeItem(STORAGE_KEY);
  }

  return fallback;
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

const AppShell: React.FC = () => {
  const [content, setContent] = useState<PaperContent | undefined>(loadInitialContent);
  const [panelOpen, setPanelOpen] = useState(false);

  const updateField = (path: PathSegment[], value: unknown) => {
    setContent((prev) => {
      if (!prev) return prev;
      const next = updateAtPath(prev, path, value);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const resetContent = () => {
    setContent(papers[PAPER_SLUG]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
  };

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-theme-bg text-theme-body p-6 text-center">
        Could not load paper content for "{PAPER_SLUG}" — check the console for zod validation errors from src/content/loader.ts.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-bg text-theme-body selection:bg-theme-accent selection:text-white transition-colors duration-500">
      <EmbedBadge />
      <Nav content={content} />
      <Hero content={content} />

      <main>
        {content.sections.map((section) => (
          <ProseSection key={section.id} section={section} figures={content.figures} />
        ))}
        <AuthorsSection authors={content.authors} />
      </main>

      <Footer content={content} onOpenCustomizer={() => setPanelOpen(true)} />

      <CustomizerPanel
        content={content}
        updateField={updateField}
        resetContent={resetContent}
        open={panelOpen}
        onOpenChange={setPanelOpen}
      />
    </div>
  );
};

const App: React.FC = () => (
  <ThemeProvider>
    <AppShell />
  </ThemeProvider>
);

export default App;
