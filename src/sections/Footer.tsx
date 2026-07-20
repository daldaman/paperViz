/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import type { PaperContent } from '../content/schema';
import { useTheme } from '../theme/useTheme';
import { scrollToId } from '../utils/scroll';
import { getNavEntries } from './Nav';

interface FooterProps {
  content: PaperContent;
  onOpenCustomizer: () => void;
}

/**
 * Judgment call: the original footer's link row was four independently
 * hardcoded links with their own short labels ("Intro" / paper.scienceTitle
 * / "Impact" / "Team"), duplicating — but not matching — the nav's labels.
 * Reusing `getNavEntries` here instead (same entries/labels as Nav, e.g.
 * "Introduction" instead of "Intro", "Authors" instead of "Team") trades a
 * couple of words of exact footer text for not hardcoding section ids
 * ('science'/'impact') into component code, which would violate the
 * project's "no paper-specific copy in components" rule the moment a second
 * paper with different section ids is loaded.
 */
export const Footer: React.FC<FooterProps> = ({ content, onOpenCustomizer }) => {
  const { embedMode, setEmbedMode } = useTheme();
  const { meta, footer } = content;
  const brandInitial = (meta.title && meta.title[0]) || 'α';
  const navEntries = getNavEntries(content);

  const handleFooterLinkClick = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    scrollToId(id, embedMode ? 40 : 100);
  };

  return (
    <footer className="bg-stone-950 text-stone-400 py-16 border-t border-stone-900">
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="text-center md:text-left">
          <div className="text-white font-serif font-bold text-2xl mb-2 flex items-center justify-center md:justify-start gap-2">
            <span className="w-6 h-6 bg-theme-accent rounded-full text-white font-serif font-bold text-sm flex items-center justify-center pb-0.5">{brandInitial}</span>
            {meta.title}
          </div>
          <p className="text-sm text-stone-500">Visualizing "{meta.title} - {meta.subtitle}"</p>
        </div>
        {!embedMode && (
          <div className="flex gap-6 text-xs tracking-wider font-mono text-stone-500 uppercase">
            {navEntries.map((entry) => (
              <a
                key={entry.id}
                href={`#${entry.id}`}
                onClick={handleFooterLinkClick(entry.id)}
                className="hover:text-white transition-colors"
              >
                {entry.label}
              </a>
            ))}
          </div>
        )}
      </div>
      <div className="text-center mt-12 text-xs text-stone-700 flex flex-col md:flex-row justify-center items-center gap-4 border-t border-stone-900/60 pt-8 max-w-6xl mx-auto">
        {footer.blurb && <span>{footer.blurb}</span>}
        {footer.tagline && (
          <>
            <span className="hidden md:inline">•</span>
            <span>{footer.tagline}</span>
          </>
        )}
        <span className="hidden md:inline">•</span>
        <button
          onClick={() => { setEmbedMode(false); onOpenCustomizer(); }}
          className="text-stone-500 hover:text-white underline transition-colors"
        >
          Get Embed Code for Google Sites
        </button>
      </div>
    </footer>
  );
};
