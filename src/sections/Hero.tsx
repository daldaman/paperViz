/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowDown } from 'lucide-react';
import { HeroScene } from '../../components/QuantumScene';
import type { PaperContent } from '../content/schema';
import { useTheme } from '../theme/useTheme';
import { THEMES } from '../theme/themes';
import { scrollToId } from '../utils/scroll';

interface HeroProps {
  content: PaperContent;
}

export const Hero: React.FC<HeroProps> = ({ content }) => {
  const { embedMode, activeThemeKey } = useTheme();
  const theme = THEMES[activeThemeKey];
  const { meta } = content;

  const handleExplore = (e: React.MouseEvent) => {
    e.preventDefault();
    scrollToId('introduction', embedMode ? 40 : 100);
  };

  return (
    <header className={`relative flex items-center justify-center overflow-hidden transition-all duration-500 ${embedMode ? 'h-[75vh] min-h-[460px] border-b border-theme-border' : 'h-screen'}`}>
      {meta.heroScene === 'quantum' && <HeroScene />}

      {/* Dynamic Gradient Overlay using background custom variable */}
      <div
        className="absolute inset-0 z-0 pointer-events-none transition-all duration-500"
        style={{
          background: `radial-gradient(circle at center, ${theme.bg}eb 0%, ${theme.bg}90 55%, ${theme.bg}33 100%)`
        }}
      />

      <div className="relative z-10 container mx-auto px-6 text-center">
        <div className="inline-block mb-4 px-3 py-1 border border-theme-accent text-theme-accent text-xs tracking-[0.2em] uppercase font-bold rounded-full backdrop-blur-xs bg-theme-card/25">
          {meta.venue} • {meta.publishDate}
        </div>
        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-medium leading-tight mb-8 text-theme-main drop-shadow-xs">
          {meta.title} <br /><span className="italic font-normal text-theme-muted text-2xl md:text-4xl block mt-4 font-serif">{meta.subtitle}</span>
        </h1>
        <p className="max-w-2xl mx-auto text-base md:text-lg text-theme-body font-light leading-relaxed mb-12">
          {meta.description}
        </p>

        <div className="flex justify-center">
          <a href="#introduction" onClick={handleExplore} className="group flex flex-col items-center gap-2 text-xs font-bold text-theme-muted hover:text-theme-main transition-colors cursor-pointer">
            <span>EXPLORE</span>
            <span className="p-2 border border-theme-border rounded-full group-hover:border-theme-main transition-colors bg-theme-card/40 backdrop-blur-xs">
              <ArrowDown size={14} className="text-theme-accent" />
            </span>
          </a>
        </div>
      </div>
    </header>
  );
};
