/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * The floating "Integration & Styling" drawer shell: header, the Quick
 * Presets block, and the tab switcher. The four tab bodies live in
 * ./tabs/{Style,Content,Embed,Guide}Tab.tsx (Phase 5 split — this file was
 * 991 lines before, all four tabs' markup inlined; see git history). Style
 * and Guide are byte-identical to their pre-split JSX; Content and Embed
 * got their Phase-5 upgrades (schema-generic form, JSON import/export,
 * per-slug storage, `&paper=<slug>`) inside their own files, not here.
 */
import React, { useState } from 'react';
import { Sliders, Sparkles, Palette, X } from 'lucide-react';
import type { PaperContent } from '../content/schema';
import { useTheme } from '../theme/useTheme';
import type { PathSegment } from './updateAtPath';
import { StyleTab } from './tabs/StyleTab';
import { ContentTab } from './tabs/ContentTab';
import { EmbedTab } from './tabs/EmbedTab';
import { GuideTab } from './tabs/GuideTab';

interface CustomizerPanelProps {
  content: PaperContent;
  slug: string;
  updateField: (path: PathSegment[], value: unknown) => void;
  resetContent: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CustomizerPanel: React.FC<CustomizerPanelProps> = ({ content, slug, updateField, resetContent, open, onOpenChange }) => {
  const { activeThemeKey, setActiveThemeKey, activeFontHeadingKey, setActiveFontHeadingKey, activeFontBodyKey, setActiveFontBodyKey, hideCustomizer } = useTheme();

  const [customizerTab, setCustomizerTab] = useState<'style' | 'content' | 'embed' | 'guide'>('style');

  if (hideCustomizer) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {open ? (
        /* Floating Drawer Panel */
        <div className="w-[92vw] sm:w-[420px] max-h-[85vh] overflow-y-auto bg-theme-card border border-theme-border rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-300 p-6 flex flex-col text-theme-main font-sans">

          {/* Header */}
          <div className="flex justify-between items-center pb-4 border-b border-theme-border mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-sm bg-theme-accent/15 text-theme-accent">
                <Sliders size={16} />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-wide uppercase">Integration & Styling</h3>
                <p className="text-[10px] text-theme-muted font-mono leading-none">GOOGLE SITES COMPATIBLE</p>
              </div>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="p-1 rounded-full hover:bg-theme-bg text-theme-muted hover:text-theme-main transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Quick Presets Section */}
          <div className="mb-5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-theme-muted mb-2.5 flex items-center gap-1.5">
              <Sparkles size={11} className="text-theme-accent" />
              Cohesive Visual Presets
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setActiveThemeKey('gold-cream');
                  setActiveFontHeadingKey('Playfair Display');
                  setActiveFontBodyKey('Inter');
                }}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  activeThemeKey === 'gold-cream' && activeFontHeadingKey === 'Playfair Display'
                    ? 'border-theme-accent bg-theme-accent/5 ring-1 ring-theme-accent'
                    : 'border-theme-border hover:bg-theme-bg/50'
                }`}
              >
                <div className="font-bold text-xs">Sand & Gold</div>
                <div className="text-[9px] text-theme-muted font-mono truncate">Editorial Serif</div>
              </button>
              <button
                onClick={() => {
                  setActiveThemeKey('cosmic-slate');
                  setActiveFontHeadingKey('Space Grotesk');
                  setActiveFontBodyKey('Inter');
                }}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  activeThemeKey === 'cosmic-slate' && activeFontHeadingKey === 'Space Grotesk'
                    ? 'border-theme-accent bg-theme-accent/5 ring-1 ring-theme-accent'
                    : 'border-theme-border hover:bg-theme-bg/50'
                }`}
              >
                <div className="font-bold text-xs">Cosmic Slate</div>
                <div className="text-[9px] text-theme-muted font-mono truncate">Modern Tech</div>
              </button>
              <button
                onClick={() => {
                  setActiveThemeKey('academic-indigo');
                  setActiveFontHeadingKey('Lora');
                  setActiveFontBodyKey('Inter');
                }}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  activeThemeKey === 'academic-indigo' && activeFontHeadingKey === 'Lora'
                    ? 'border-theme-accent bg-theme-accent/5 ring-1 ring-theme-accent'
                    : 'border-theme-border hover:bg-theme-bg/50'
                }`}
              >
                <div className="font-bold text-xs">Academic Ink</div>
                <div className="text-[9px] text-theme-muted font-mono truncate">Scholarly Paper</div>
              </button>
              <button
                onClick={() => {
                  setActiveThemeKey('forest-emerald');
                  setActiveFontHeadingKey('JetBrains Mono');
                  setActiveFontBodyKey('JetBrains Mono');
                }}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  activeThemeKey === 'forest-emerald' && activeFontHeadingKey === 'JetBrains Mono'
                    ? 'border-theme-accent bg-theme-accent/5 ring-1 ring-theme-accent'
                    : 'border-theme-border hover:bg-theme-bg/50'
                }`}
              >
                <div className="font-bold text-xs">Forest Emerald</div>
                <div className="text-[9px] text-theme-muted font-mono truncate">Technical Lab</div>
              </button>
            </div>
          </div>

          {/* Customizer Tabs Navigation */}
          <div className="flex border-b border-theme-border mb-4 text-xs font-medium">
            <button
              onClick={() => setCustomizerTab('style')}
              className={`flex-1 py-1.5 text-center border-b-2 transition-colors ${customizerTab === 'style' ? 'border-theme-accent text-theme-accent font-semibold' : 'border-transparent text-theme-muted hover:text-theme-main'}`}
            >
              Style
            </button>
            <button
              onClick={() => setCustomizerTab('content')}
              className={`flex-1 py-1.5 text-center border-b-2 transition-colors ${customizerTab === 'content' ? 'border-theme-accent text-theme-accent font-semibold' : 'border-transparent text-theme-muted hover:text-theme-main'}`}
            >
              Edit Content
            </button>
            <button
              onClick={() => setCustomizerTab('embed')}
              className={`flex-1 py-1.5 text-center border-b-2 transition-colors ${customizerTab === 'embed' ? 'border-theme-accent text-theme-accent font-semibold' : 'border-transparent text-theme-muted hover:text-theme-main'}`}
            >
              Embed
            </button>
            <button
              onClick={() => setCustomizerTab('guide')}
              className={`flex-1 py-1.5 text-center border-b-2 transition-colors ${customizerTab === 'guide' ? 'border-theme-accent text-theme-accent font-semibold' : 'border-transparent text-theme-muted hover:text-theme-main'}`}
            >
              Guide
            </button>
          </div>

          {/* Tab Contents */}
          <div className="flex-1">
            {customizerTab === 'style' && <StyleTab />}
            {customizerTab === 'content' && <ContentTab content={content} slug={slug} updateField={updateField} resetContent={resetContent} />}
            {customizerTab === 'embed' && <EmbedTab slug={slug} />}
            {customizerTab === 'guide' && <GuideTab />}
          </div>

        </div>
      ) : (
        /* Sleek FAB Trigger Button when closed */
        <button
          onClick={() => onOpenChange(true)}
          className="flex items-center gap-2 px-4 py-3 bg-theme-accent text-white rounded-full shadow-lg hover:shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 cursor-pointer text-xs font-bold uppercase tracking-wider select-none border border-white/10"
          id="styling-customizer-trigger"
        >
          <Palette size={16} className="animate-pulse" />
          <span>Customize Style & Google Sites</span>
        </button>
      )}
    </div>
  );
};
