/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import type { PaperContent } from '../content/schema';
import { useTheme } from '../theme/useTheme';
import { scrollToId } from '../utils/scroll';

interface NavProps {
  content: PaperContent;
}

interface NavEntry {
  id: string;
  label: string;
}

export function getNavEntries(content: PaperContent): NavEntry[] {
  const sectionEntries = content.sections
    .filter((s) => s.inNav !== false)
    .map((s) => ({ id: s.id, label: s.navLabel ?? s.title }));
  return [...sectionEntries, { id: 'authors', label: 'Authors' }];
}

export const Nav: React.FC<NavProps> = ({ content }) => {
  const { embedMode } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navEntries = getNavEntries(content);
  const primaryLink = content.meta.links[0];
  const brandInitial = (content.meta.title && content.meta.title[0]) || 'α';
  const brandYear = content.meta.publishDate.split(' ').pop() || '';

  const handleNavClick = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuOpen(false);
    scrollToId(id, embedMode ? 40 : 100);
  };

  if (embedMode) {
    return null;
  }

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-theme-bg/95 backdrop-blur-md shadow-xs py-4 border-b border-theme-border/50' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-8 h-8 bg-theme-accent rounded-full flex items-center justify-center text-white font-serif font-bold text-xl shadow-xs pb-1 transition-transform hover:scale-105">{brandInitial}</div>
            <span className={`font-serif font-bold text-lg tracking-wide text-theme-main transition-opacity ${scrolled ? 'opacity-100' : 'opacity-0 md:opacity-100'}`}>
              {content.meta.title.toUpperCase()} <span className="font-normal text-theme-muted">{brandYear}</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide text-theme-body">
            {navEntries.map((entry) => (
              <a
                key={entry.id}
                href={`#${entry.id}`}
                onClick={handleNavClick(entry.id)}
                className="hover:text-theme-accent transition-colors cursor-pointer uppercase"
              >
                {entry.label}
              </a>
            ))}
            <a
              href={primaryLink?.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2 bg-theme-main text-theme-bg rounded-full hover:opacity-90 transition-all shadow-xs cursor-pointer font-semibold"
            >
              View Paper
            </a>
          </div>

          <button className="md:hidden text-theme-main p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 z-45 bg-theme-bg flex flex-col items-center justify-center gap-8 text-xl font-serif animate-fade-in">
          {navEntries.map((entry) => (
            <a
              key={entry.id}
              href={`#${entry.id}`}
              onClick={handleNavClick(entry.id)}
              className="hover:text-theme-accent transition-colors cursor-pointer uppercase text-theme-main"
            >
              {entry.label}
            </a>
          ))}
          <a
            href={primaryLink?.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMenuOpen(false)}
            className="px-6 py-3 bg-theme-main text-theme-bg rounded-full shadow-lg cursor-pointer font-semibold"
          >
            View Paper
          </a>
        </div>
      )}
    </>
  );
};
