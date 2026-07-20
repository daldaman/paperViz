/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * The floating "Integration & Styling" drawer, extracted verbatim (styling
 * unchanged) from the old App.tsx monolith. Content-tab inputs are rebound
 * from the old flat `updatePaperField(key, value)` calls to
 * `updateField(path, value)` against the nested PaperContent tree — see
 * the Phase 3 report for the full list of rebindings and the show/hide
 * figure toggles that were dropped (visibility is now presence in
 * `figures[]`). A schema-generic content form is Phase 5's job; this tab
 * is intentionally still hand-wired to AlphaQubit's known section/figure
 * indices, matching the plan's "keep this surgical" instruction.
 */
import React, { useState } from 'react';
import {
  Sliders,
  Copy,
  Check,
  Info,
  EyeOff,
  Sparkles,
  Code,
  RefreshCw,
  Palette,
  Layers,
  X,
} from 'lucide-react';
import type { Figure, PaperContent } from '../content/schema';
import { useTheme } from '../theme/useTheme';
import { THEMES, FONTS_HEADING, FONTS_BODY } from '../theme/themes';
import type { PathSegment } from './updateAtPath';

// Only `static` figures lack title/description in the schema (they use
// caption/alt instead); interactive and diagram figures both have them.
function figureTitle(figure: Figure | undefined): string {
  return figure && figure.kind !== 'static' ? figure.title ?? '' : '';
}
function figureDescription(figure: Figure | undefined): string {
  return figure && figure.kind !== 'static' ? figure.description ?? '' : '';
}

interface CustomizerPanelProps {
  content: PaperContent;
  updateField: (path: PathSegment[], value: unknown) => void;
  resetContent: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CustomizerPanel: React.FC<CustomizerPanelProps> = ({ content, updateField, resetContent, open, onOpenChange }) => {
  const {
    activeThemeKey, setActiveThemeKey,
    activeFontHeadingKey, setActiveFontHeadingKey,
    activeFontBodyKey, setActiveFontBodyKey,
    embedMode, setEmbedMode,
    hideCustomizer,
  } = useTheme();

  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [customizerTab, setCustomizerTab] = useState<'style' | 'content' | 'embed' | 'guide'>('style');
  const [visitorControlsEnabled, setVisitorControlsEnabled] = useState(false);

  if (hideCustomizer) {
    return null;
  }

  const currentBaseUrl = window.location.origin + window.location.pathname;

  const getEmbedUrl = () => {
    let url = `${currentBaseUrl}?embed=true&theme=${activeThemeKey}&font-heading=${encodeURIComponent(activeFontHeadingKey)}&font-body=${encodeURIComponent(activeFontBodyKey)}`;
    if (!visitorControlsEnabled) {
      url += '&hide-customizer=true';
    }
    return url;
  };

  const getIframeCode = () => {
    return `<iframe src="${getEmbedUrl()}" width="100%" height="700" style="border:none; border-radius:12px; background:${THEMES[activeThemeKey].bg}; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);" allow="geolocation; microphone; camera"></iframe>`;
  };

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(getIframeCode());
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2500);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(getEmbedUrl());
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handleResetStyle = () => {
    setActiveThemeKey('gold-cream');
    setActiveFontHeadingKey('Playfair Display');
    setActiveFontBodyKey('Inter');
  };

  // --- Content-tab derived values -------------------------------------
  // sections[0]=introduction, [1]=science, [2]=innovation, [3]=results,
  // [4]=impact; figures[0]=surface-code, [1]=transformer-decoder,
  // [2]=grouped-bar (performance), [3]=cryostat. Fixed indices, matching
  // the plan's own `sections[0].title` example — a full generic form
  // (Phase 5) will replace this with schema-driven indexing.
  const introBody0 = content.sections[0]?.body?.[0] ?? '';
  const dropcapChar = introBody0.slice(0, 1);
  const introPara1Rest = introBody0.slice(1);

  const perfProps = (content.figures[2]?.kind === 'interactive' ? content.figures[2].props : {}) as {
    series?: { id: string; label: string; values: Record<string, number> }[];
  };
  const standardSeries = perfProps.series?.[0];
  const oursSeries = perfProps.series?.[1];

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

            {/* STYLE TAB */}
            {customizerTab === 'style' && (
              <div className="space-y-4 animate-fade-in text-xs">
                {/* Theme Selector */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-theme-muted mb-2">Color Scheme Palette</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(THEMES).map(([key, t]) => (
                      <button
                        key={key}
                        onClick={() => setActiveThemeKey(key as keyof typeof THEMES)}
                        className={`flex items-center gap-2.5 p-2 rounded-lg border text-left transition-all ${
                          activeThemeKey === key ? 'border-theme-accent bg-theme-accent/5 ring-1 ring-theme-accent' : 'border-theme-border hover:bg-theme-bg/50'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-theme-border/50 flex-shrink-0 flex items-center justify-center"
                          style={{ backgroundColor: t.bg }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.accent }}></span>
                        </span>
                        <span className="font-medium text-xs truncate">{t.name.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Heading Font */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-theme-muted mb-2">Header Font (Serif)</label>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.keys(FONTS_HEADING).map((f) => (
                      <button
                        key={f}
                        onClick={() => setActiveFontHeadingKey(f as keyof typeof FONTS_HEADING)}
                        className={`px-2.5 py-1.5 rounded-sm border text-[11px] transition-all font-serif ${
                          activeFontHeadingKey === f ? 'border-theme-accent bg-theme-accent/5 text-theme-accent font-bold' : 'border-theme-border hover:bg-theme-bg/50 text-theme-body'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Body Font */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-theme-muted mb-2">Body Font (Sans)</label>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.keys(FONTS_BODY).map((f) => (
                      <button
                        key={f}
                        onClick={() => setActiveFontBodyKey(f as keyof typeof FONTS_BODY)}
                        className={`px-2.5 py-1.5 rounded-sm border text-[11px] transition-all font-sans ${
                          activeFontBodyKey === f ? 'border-theme-accent bg-theme-accent/5 text-theme-accent font-bold' : 'border-theme-border hover:bg-theme-bg/50 text-theme-body'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reset to defaults */}
                <div className="pt-2 border-t border-theme-border flex justify-end">
                  <button
                    onClick={handleResetStyle}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-sm text-theme-muted hover:text-theme-main hover:bg-theme-bg transition-colors"
                  >
                    <RefreshCw size={12} />
                    <span>Reset Styles</span>
                  </button>
                </div>
              </div>
            )}

            {/* CONTENT TAB */}
            {customizerTab === 'content' && (
              <div className="space-y-4 animate-fade-in text-xs max-h-[50vh] overflow-y-auto pr-1 pb-4">
                <div className="p-3 bg-theme-accent/5 border border-theme-accent/20 rounded-xl mb-2">
                  <h5 className="font-bold text-[11px] text-theme-accent mb-1 flex items-center gap-1">
                    <Sparkles size={12} />
                    Academic Paper Editor
                  </h5>
                  <p className="text-[10px] text-theme-muted leading-relaxed">
                    Customize the text content of this interactive applet for your own academic work. Changes apply instantly and persist in your browser.
                  </p>
                </div>

                {/* RESET BUTTON */}
                <div className="flex justify-end">
                  <button
                    onClick={resetContent}
                    className="text-[10px] text-theme-muted hover:text-red-500 font-semibold flex items-center gap-1 transition-colors border border-theme-border/60 rounded-sm px-2 py-1 bg-theme-bg/40"
                  >
                    <RefreshCw size={10} />
                    Reset to AlphaQubit
                  </button>
                </div>

                {/* SECTION: GENERAL METADATA */}
                <div className="border-t border-theme-border/50 pt-3">
                  <h4 className="font-bold text-[11px] uppercase tracking-wider text-theme-muted mb-2">1. Paper Metadata</h4>
                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[10px] text-theme-muted mb-1 font-semibold uppercase">Paper Title</label>
                      <input
                        type="text"
                        value={content.meta.title}
                        onChange={(e) => updateField(['meta', 'title'], e.target.value)}
                        className="w-full p-2 text-xs rounded-lg border border-theme-border bg-theme-bg text-theme-main animate-none"
                        placeholder="e.g. My Custom Paper"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-theme-muted mb-1 font-semibold uppercase">Subtitle / Research Goal</label>
                      <input
                        type="text"
                        value={content.meta.subtitle}
                        onChange={(e) => updateField(['meta', 'subtitle'], e.target.value)}
                        className="w-full p-2 text-xs rounded-lg border border-theme-border bg-theme-bg text-theme-main animate-none"
                        placeholder="e.g. A New Approach to ..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-theme-muted mb-1 font-semibold uppercase">Journal / Conference</label>
                        <input
                          type="text"
                          value={content.meta.venue}
                          onChange={(e) => updateField(['meta', 'venue'], e.target.value)}
                          className="w-full p-2 text-xs rounded-lg border border-theme-border bg-theme-bg text-theme-main animate-none"
                          placeholder="e.g. Nature"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-theme-muted mb-1 font-semibold uppercase">Publish Date</label>
                        <input
                          type="text"
                          value={content.meta.publishDate}
                          onChange={(e) => updateField(['meta', 'publishDate'], e.target.value)}
                          className="w-full p-2 text-xs rounded-lg border border-theme-border bg-theme-bg text-theme-main animate-none"
                          placeholder="e.g. Nov 2026"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] text-theme-muted mb-1 font-semibold uppercase">DOI or Web URL</label>
                      <input
                        type="text"
                        value={content.meta.links[0]?.url ?? ''}
                        onChange={(e) => updateField(['meta', 'links', 0, 'url'], e.target.value)}
                        className="w-full p-2 text-xs rounded-lg border border-theme-border bg-theme-bg text-theme-main font-mono text-[10px]"
                        placeholder="e.g. https://doi.org/..."
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-theme-muted mb-1 font-semibold uppercase">Abstract / Hero Description</label>
                      <textarea
                        rows={3}
                        value={content.meta.description}
                        onChange={(e) => updateField(['meta', 'description'], e.target.value)}
                        className="w-full p-2 text-xs rounded-lg border border-theme-border bg-theme-bg text-theme-main resize-none"
                        placeholder="Brief high-level summary of the paper..."
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION: INTRODUCTION */}
                <div className="border-t border-theme-border/50 pt-3">
                  <h4 className="font-bold text-[11px] uppercase tracking-wider text-theme-muted mb-2">2. Section 1: Introduction</h4>
                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[10px] text-theme-muted mb-1 font-semibold uppercase">Intro Section Title</label>
                      <input
                        type="text"
                        value={content.sections[0]?.title ?? ''}
                        onChange={(e) => updateField(['sections', 0, 'title'], e.target.value)}
                        className="w-full p-2 text-xs rounded-lg border border-theme-border bg-theme-bg text-theme-main"
                      />
                    </div>
                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-3">
                        <label className="block text-[10px] text-theme-muted mb-1 font-semibold uppercase">Dropcap</label>
                        <input
                          type="text"
                          maxLength={1}
                          value={dropcapChar}
                          onChange={(e) => updateField(['sections', 0, 'body', 0], e.target.value.slice(0, 1) + introPara1Rest)}
                          className="w-full p-2 text-xs rounded-lg border border-theme-border bg-theme-bg text-theme-main text-center font-bold font-serif text-base"
                        />
                      </div>
                      <div className="col-span-9">
                        <label className="block text-[10px] text-theme-muted mb-1 font-semibold uppercase">Intro Paragraph 1 (Continues Dropcap)</label>
                        <textarea
                          rows={2}
                          value={introPara1Rest}
                          onChange={(e) => updateField(['sections', 0, 'body', 0], dropcapChar + e.target.value)}
                          className="w-full p-2 text-xs rounded-lg border border-theme-border bg-theme-bg text-theme-main resize-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] text-theme-muted mb-1 font-semibold uppercase">Intro Paragraph 2</label>
                      <textarea
                        rows={3}
                        value={content.sections[0]?.body?.[1] ?? ''}
                        onChange={(e) => updateField(['sections', 0, 'body', 1], e.target.value)}
                        className="w-full p-2 text-xs rounded-lg border border-theme-border bg-theme-bg text-theme-main resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION: SYSTEM / SCIENCE */}
                <div className="border-t border-theme-border/50 pt-3">
                  <h4 className="font-bold text-[11px] uppercase tracking-wider text-theme-muted mb-2">3. Section 2: Core System</h4>
                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[10px] text-theme-muted mb-1 font-semibold uppercase">System Section Title</label>
                      <input
                        type="text"
                        value={content.sections[1]?.title ?? ''}
                        onChange={(e) => updateField(['sections', 1, 'title'], e.target.value)}
                        className="w-full p-2 text-xs rounded-lg border border-theme-border bg-theme-bg text-theme-main"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-theme-muted mb-1 font-semibold uppercase">Paragraph 1</label>
                      <textarea
                        rows={3}
                        value={content.sections[1]?.body?.[0] ?? ''}
                        onChange={(e) => updateField(['sections', 1, 'body', 0], e.target.value)}
                        className="w-full p-2 text-xs rounded-lg border border-theme-border bg-theme-bg text-theme-main resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-theme-muted mb-1 font-semibold uppercase">Paragraph 2</label>
                      <textarea
                        rows={3}
                        value={content.sections[1]?.body?.[1] ?? ''}
                        onChange={(e) => updateField(['sections', 1, 'body', 1], e.target.value)}
                        className="w-full p-2 text-xs rounded-lg border border-theme-border bg-theme-bg text-theme-main resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION: INNOVATION & RESULTS */}
                <div className="border-t border-theme-border/50 pt-3">
                  <h4 className="font-bold text-[11px] uppercase tracking-wider text-theme-muted mb-2">4. Section 3: Innovation & Results</h4>
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-theme-muted mb-1 font-semibold uppercase">Innovation Badge</label>
                        <input
                          type="text"
                          value={content.sections[2]?.eyebrow ?? ''}
                          onChange={(e) => updateField(['sections', 2, 'eyebrow'], e.target.value)}
                          className="w-full p-2 text-xs rounded-lg border border-theme-border bg-theme-bg text-theme-main"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-theme-muted mb-1 font-semibold uppercase">Innovation Title</label>
                        <input
                          type="text"
                          value={content.sections[2]?.title ?? ''}
                          onChange={(e) => updateField(['sections', 2, 'title'], e.target.value)}
                          className="w-full p-2 text-xs rounded-lg border border-theme-border bg-theme-bg text-theme-main"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] text-theme-muted mb-1 font-semibold uppercase">Innovation Desc 1</label>
                      <textarea
                        rows={3}
                        value={content.sections[2]?.body?.[0] ?? ''}
                        onChange={(e) => updateField(['sections', 2, 'body', 0], e.target.value)}
                        className="w-full p-2 text-xs rounded-lg border border-theme-border bg-theme-bg text-theme-main resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-theme-muted mb-1 font-semibold uppercase">Innovation Desc 2</label>
                      <textarea
                        rows={3}
                        value={content.sections[2]?.body?.[1] ?? ''}
                        onChange={(e) => updateField(['sections', 2, 'body', 1], e.target.value)}
                        className="w-full p-2 text-xs rounded-lg border border-theme-border bg-theme-bg text-theme-main resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-theme-muted mb-1 font-semibold uppercase">Results Section Title</label>
                      <input
                        type="text"
                        value={content.sections[3]?.title ?? ''}
                        onChange={(e) => updateField(['sections', 3, 'title'], e.target.value)}
                        className="w-full p-2 text-xs rounded-lg border border-theme-border bg-theme-bg text-theme-main"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-theme-muted mb-1 font-semibold uppercase">Results Text Summary</label>
                      <textarea
                        rows={3}
                        value={content.sections[3]?.body?.[0] ?? ''}
                        onChange={(e) => updateField(['sections', 3, 'body', 0], e.target.value)}
                        className="w-full p-2 text-xs rounded-lg border border-theme-border bg-theme-bg text-theme-main resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION: IMPACT & QUOTE */}
                <div className="border-t border-theme-border/50 pt-3">
                  <h4 className="font-bold text-[11px] uppercase tracking-wider text-theme-muted mb-2">5. Section 4: Impact & Key Quote</h4>
                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[10px] text-theme-muted mb-1 font-semibold uppercase">Impact Title</label>
                      <input
                        type="text"
                        value={content.sections[4]?.title ?? ''}
                        onChange={(e) => updateField(['sections', 4, 'title'], e.target.value)}
                        className="w-full p-2 text-xs rounded-lg border border-theme-border bg-theme-bg text-theme-main"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-theme-muted mb-1 font-semibold uppercase">Impact Text 1</label>
                      <textarea
                        rows={3}
                        value={content.sections[4]?.body?.[0] ?? ''}
                        onChange={(e) => updateField(['sections', 4, 'body', 0], e.target.value)}
                        className="w-full p-2 text-xs rounded-lg border border-theme-border bg-theme-bg text-theme-main resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-theme-muted mb-1 font-semibold uppercase">Impact Text 2</label>
                      <textarea
                        rows={3}
                        value={content.sections[4]?.body?.[1] ?? ''}
                        onChange={(e) => updateField(['sections', 4, 'body', 1], e.target.value)}
                        className="w-full p-2 text-xs rounded-lg border border-theme-border bg-theme-bg text-theme-main resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-theme-muted mb-1 font-semibold uppercase">Featured Quote</label>
                      <textarea
                        rows={3}
                        value={content.sections[4]?.quote?.text ?? ''}
                        onChange={(e) => updateField(['sections', 4, 'quote', 'text'], e.target.value)}
                        className="w-full p-2 text-xs rounded-lg border border-theme-border bg-theme-bg text-theme-main resize-none italic"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-theme-muted mb-1 font-semibold uppercase">Quote Author / Citation</label>
                      <input
                        type="text"
                        value={content.sections[4]?.quote?.author ?? ''}
                        onChange={(e) => updateField(['sections', 4, 'quote', 'author'], e.target.value)}
                        className="w-full p-2 text-xs rounded-lg border border-theme-border bg-theme-bg text-theme-main"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION: FIGURES & DIAGRAMS */}
                <div className="border-t border-theme-border/50 pt-3">
                  <h4 className="font-bold text-[11px] uppercase tracking-wider text-theme-muted mb-2.5 flex items-center gap-1.5">
                    <Layers size={11} className="text-theme-accent" />
                    6. Figures & Diagrams
                  </h4>
                  <p className="text-[10px] text-theme-muted leading-relaxed mb-3">
                    Edit the labels and simulation parameters for the figures included in this draft. Visibility is now controlled by which figures exist in the paper's JSON file, so the old per-figure show/hide toggles have been retired (Phase 5 rebuilds this tab generically).
                  </p>

                  <div className="space-y-3 mb-4">
                    {/* Figure 1 */}
                    <div className="p-3 bg-theme-bg/60 rounded-xl border border-theme-border/60">
                      <span className="font-semibold text-[11px] text-theme-main">Fig 1: Surface Code Simulator</span>
                      <div className="mt-2.5 space-y-2 border-t border-theme-border/40 pt-2.5">
                        <div>
                          <label className="block text-[9px] text-theme-muted mb-0.5 font-semibold uppercase">Diagram Title</label>
                          <input
                            type="text"
                            value={figureTitle(content.figures[0])}
                            onChange={(e) => updateField(['figures', 0, 'title'], e.target.value)}
                            className="w-full p-1.5 text-[11px] rounded-sm border border-theme-border bg-theme-bg text-theme-main"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-theme-muted mb-0.5 font-semibold uppercase">Interactive Guide</label>
                          <textarea
                            rows={2}
                            value={figureDescription(content.figures[0])}
                            onChange={(e) => updateField(['figures', 0, 'description'], e.target.value)}
                            className="w-full p-1.5 text-[11px] rounded-sm border border-theme-border bg-theme-bg text-theme-main resize-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[9px] text-theme-muted mb-0.5 font-semibold uppercase">Qubit Label</label>
                            <input
                              type="text"
                              value={(content.figures[0]?.kind === 'interactive' ? content.figures[0].props.dataLabel as string : '') ?? ''}
                              onChange={(e) => updateField(['figures', 0, 'props', 'dataLabel'], e.target.value)}
                              className="w-full p-1.5 text-[11px] rounded-sm border border-theme-border bg-theme-bg text-theme-main"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] text-theme-muted mb-0.5 font-semibold uppercase">Stabilizer Label</label>
                            <input
                              type="text"
                              value={(content.figures[0]?.kind === 'interactive' ? content.figures[0].props.stabilizerLabel as string : '') ?? ''}
                              onChange={(e) => updateField(['figures', 0, 'props', 'stabilizerLabel'], e.target.value)}
                              className="w-full p-1.5 text-[11px] rounded-sm border border-theme-border bg-theme-bg text-theme-main"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Figure 2 */}
                    <div className="p-3 bg-theme-bg/60 rounded-xl border border-theme-border/60">
                      <span className="font-semibold text-[11px] text-theme-main">Fig 2: Architecture Layout</span>
                      <div className="mt-2.5 space-y-2 border-t border-theme-border/40 pt-2.5">
                        <div>
                          <label className="block text-[9px] text-theme-muted mb-0.5 font-semibold uppercase">Diagram Title</label>
                          <input
                            type="text"
                            value={figureTitle(content.figures[1])}
                            onChange={(e) => updateField(['figures', 1, 'title'], e.target.value)}
                            className="w-full p-1.5 text-[11px] rounded-sm border border-theme-border bg-theme-bg text-theme-main"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-theme-muted mb-0.5 font-semibold uppercase">Architecture Summary</label>
                          <textarea
                            rows={2}
                            value={figureDescription(content.figures[1])}
                            onChange={(e) => updateField(['figures', 1, 'description'], e.target.value)}
                            className="w-full p-1.5 text-[11px] rounded-sm border border-theme-border bg-theme-bg text-theme-main resize-none"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-1.5">
                          <div>
                            <label className="block text-[9px] text-theme-muted mb-0.5 font-semibold uppercase">Input Stage</label>
                            <input
                              type="text"
                              value={(content.figures[1]?.kind === 'interactive' ? content.figures[1].props.inputLabel as string : '') ?? ''}
                              onChange={(e) => updateField(['figures', 1, 'props', 'inputLabel'], e.target.value)}
                              className="w-full p-1 text-[10px] rounded-sm border border-theme-border bg-theme-bg text-theme-main"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] text-theme-muted mb-0.5 font-semibold uppercase">Core Model</label>
                            <input
                              type="text"
                              value={(content.figures[1]?.kind === 'interactive' ? content.figures[1].props.modelLabel as string : '') ?? ''}
                              onChange={(e) => updateField(['figures', 1, 'props', 'modelLabel'], e.target.value)}
                              className="w-full p-1 text-[10px] rounded-sm border border-theme-border bg-theme-bg text-theme-main"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] text-theme-muted mb-0.5 font-semibold uppercase">Output Stage</label>
                            <input
                              type="text"
                              value={(content.figures[1]?.kind === 'interactive' ? content.figures[1].props.outputLabel as string : '') ?? ''}
                              onChange={(e) => updateField(['figures', 1, 'props', 'outputLabel'], e.target.value)}
                              className="w-full p-1 text-[10px] rounded-sm border border-theme-border bg-theme-bg text-theme-main"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Figure 3 */}
                    <div className="p-3 bg-theme-bg/60 rounded-xl border border-theme-border/60">
                      <span className="font-semibold text-[11px] text-theme-main">Fig 3: Performance Chart</span>
                      <div className="mt-2.5 space-y-2 border-t border-theme-border/40 pt-2.5">
                        <div>
                          <label className="block text-[9px] text-theme-muted mb-0.5 font-semibold uppercase">Diagram Title</label>
                          <input
                            type="text"
                            value={figureTitle(content.figures[2])}
                            onChange={(e) => updateField(['figures', 2, 'title'], e.target.value)}
                            className="w-full p-1.5 text-[11px] rounded-sm border border-theme-border bg-theme-bg text-theme-main"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-theme-muted mb-0.5 font-semibold uppercase">Performance Summary</label>
                          <textarea
                            rows={2}
                            value={figureDescription(content.figures[2])}
                            onChange={(e) => updateField(['figures', 2, 'description'], e.target.value)}
                            className="w-full p-1.5 text-[11px] rounded-sm border border-theme-border bg-theme-bg text-theme-main resize-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[9px] text-theme-muted mb-0.5 font-semibold uppercase">Baseline Method</label>
                            <input
                              type="text"
                              value={standardSeries?.label ?? ''}
                              onChange={(e) => updateField(['figures', 2, 'props', 'series', 0, 'label'], e.target.value)}
                              className="w-full p-1.5 text-[11px] rounded-sm border border-theme-border bg-theme-bg text-theme-main"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] text-theme-muted mb-0.5 font-semibold uppercase">Our Proposed Method</label>
                            <input
                              type="text"
                              value={oursSeries?.label ?? ''}
                              onChange={(e) => updateField(['figures', 2, 'props', 'series', 1, 'label'], e.target.value)}
                              className="w-full p-1.5 text-[11px] rounded-sm border border-theme-border bg-theme-bg text-theme-main"
                            />
                          </div>
                        </div>
                        <div className="p-2 bg-theme-bg/80 border border-theme-border rounded-lg space-y-1.5">
                          <span className="block text-[9px] font-bold text-theme-accent uppercase tracking-wider">Custom Logical Error Rates (%)</span>
                          <div className="grid grid-cols-3 gap-1.5 text-[8px] text-theme-muted font-bold uppercase text-center">
                            <div>D=3</div>
                            <div>D=5</div>
                            <div>D=11</div>
                          </div>
                          <div className="grid grid-cols-3 gap-1.5">
                            {(['d3', 'd5', 'd11'] as const).map((catId) => (
                              <div key={catId} className="space-y-1">
                                <input
                                  type="number"
                                  step={catId === 'd11' ? '0.0001' : '0.01'}
                                  value={standardSeries?.values?.[catId] ?? 0}
                                  onChange={(e) => updateField(['figures', 2, 'props', 'series', 0, 'values', catId], parseFloat(e.target.value) || 0)}
                                  className="w-full p-1 text-[10px] rounded-sm border border-theme-border bg-theme-bg text-theme-muted font-mono text-center"
                                  placeholder="MWPM"
                                  title={`Standard LER ${catId}`}
                                />
                                <input
                                  type="number"
                                  step={catId === 'd11' ? '0.0001' : '0.01'}
                                  value={oursSeries?.values?.[catId] ?? 0}
                                  onChange={(e) => updateField(['figures', 2, 'props', 'series', 1, 'values', catId], parseFloat(e.target.value) || 0)}
                                  className="w-full p-1 text-[10px] rounded-sm border border-theme-border bg-theme-bg text-theme-accent font-mono font-semibold text-center"
                                  placeholder="Ours"
                                  title={`Ours LER ${catId}`}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Figure 4 */}
                    <div className="p-3 bg-theme-bg/60 rounded-xl border border-theme-border/60">
                      <span className="font-semibold text-[11px] text-theme-main">Fig 4: Cryostat 3D Visualizer</span>
                      <p className="text-[9px] text-theme-muted mt-1">No editable labels — driven entirely by figure presence.</p>
                    </div>
                  </div>
                </div>

                {/* SECTION: AUTHORS */}
                <div className="border-t border-theme-border/50 pt-3">
                  <h4 className="font-bold text-[11px] uppercase tracking-wider text-theme-muted mb-2">7. Research Contributors</h4>
                  <div className="space-y-2">
                    {content.authors.list.map((auth, index) => (
                      <div key={index} className="flex gap-1 items-center bg-theme-bg/40 p-1.5 rounded-sm border border-theme-border/50">
                        <div className="flex-1 space-y-1">
                          <input
                            type="text"
                            value={auth.name}
                            onChange={(e) => updateField(['authors', 'list', index, 'name'], e.target.value)}
                            className="w-full p-1 text-[10px] rounded-sm border border-theme-border bg-theme-bg text-theme-main"
                            placeholder="Contributor Name"
                          />
                          <input
                            type="text"
                            value={auth.role}
                            onChange={(e) => updateField(['authors', 'list', index, 'role'], e.target.value)}
                            className="w-full p-1 text-[9px] rounded-sm border border-theme-border bg-theme-bg text-theme-muted"
                            placeholder="Affiliation / Role"
                          />
                        </div>
                        <button
                          onClick={() => updateField(['authors', 'list'], content.authors.list.filter((_, i) => i !== index))}
                          className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-sm transition-colors self-stretch flex items-center justify-center animate-none"
                          title="Remove Author"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => updateField(['authors', 'list'], [...content.authors.list, { name: '', role: '' }])}
                      className="w-full py-1.5 mt-1 border border-dashed border-theme-accent/40 rounded-lg text-theme-accent hover:bg-theme-accent/5 text-[10px] font-bold transition-all text-center"
                    >
                      + Add New Contributor
                    </button>
                  </div>
                </div>

                {/* SECTION: JSON EXPORT */}
                <div className="border-t border-theme-border/50 pt-3">
                  <h4 className="font-bold text-[11px] uppercase tracking-wider text-theme-muted mb-1 flex items-center gap-1">
                    <Code size={11} />
                    Export Content JSON
                  </h4>
                  <p className="text-[9px] text-theme-muted leading-relaxed mb-2">
                    Copy this structure to overwrite <code className="font-mono bg-theme-bg px-1 rounded-sm">papers/alphaqubit.json</code> for a static deployment:
                  </p>
                  <div className="relative">
                    <pre className="p-2.5 bg-stone-950 text-stone-300 font-mono text-[9px] rounded-lg overflow-x-auto max-h-40 overflow-y-auto select-all leading-normal whitespace-pre-wrap">
                      {JSON.stringify(content, null, 2)}
                    </pre>
                  </div>
                </div>

              </div>
            )}

            {/* EMBED TAB */}
            {customizerTab === 'embed' && (
              <div className="space-y-4 animate-fade-in text-xs">
                {/* Embed Layout Mode Toggle */}
                <div className="p-3 bg-theme-bg/60 rounded-xl border border-theme-border">
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <Layers size={14} className="text-theme-accent" />
                      <span className="font-bold text-xs">Compact Embed Mode</span>
                    </div>
                    <button
                      onClick={() => setEmbedMode(!embedMode)}
                      className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${embedMode ? 'bg-theme-accent' : 'bg-theme-border'}`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${embedMode ? 'translate-x-5.5' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  <p className="text-[10px] text-theme-muted leading-relaxed">
                    Hides standard top-navbar, adjusts page paddings, and optimizes margins. Toggle this to preview how seamless it will look inside Google Sites!
                  </p>
                </div>

                {/* Hide Controls Option for Visitors */}
                <div className="p-3 bg-theme-bg/60 rounded-xl border border-theme-border">
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <EyeOff size={14} className="text-theme-accent" />
                      <span className="font-bold text-xs">Hide Customizer for Visitors</span>
                    </div>
                    <button
                      onClick={() => setVisitorControlsEnabled(!visitorControlsEnabled)}
                      className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${!visitorControlsEnabled ? 'bg-theme-accent' : 'bg-theme-border'}`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${!visitorControlsEnabled ? 'translate-x-5.5' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  <p className="text-[10px] text-theme-muted leading-relaxed">
                    When enabled, the floating customizer panel is completely hidden from page visitors, presenting a perfectly clean, professional layout.
                  </p>
                </div>

                {/* Direct Embed URL */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-theme-muted">Direct Embed URL</span>
                    <button
                      onClick={handleCopyUrl}
                      className="text-theme-accent hover:underline flex items-center gap-0.5 font-semibold text-[10px]"
                    >
                      {copiedUrl ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
                      <span>{copiedUrl ? 'Copied' : 'Copy URL'}</span>
                    </button>
                  </div>
                  <div className="p-2 bg-theme-bg border border-theme-border rounded-lg font-mono text-[10px] text-theme-body break-all max-h-16 overflow-y-auto select-all">
                    {getEmbedUrl()}
                  </div>
                </div>

                {/* Full iframe Code */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-theme-muted">iframe HTML Code</span>
                    <button
                      onClick={handleCopyEmbed}
                      className="text-theme-accent hover:underline flex items-center gap-0.5 font-semibold text-[10px]"
                    >
                      {copiedEmbed ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
                      <span>{copiedEmbed ? 'Copied' : 'Copy Code'}</span>
                    </button>
                  </div>
                  <div className="p-2 bg-theme-bg border border-theme-border rounded-lg font-mono text-[10px] text-theme-body break-all max-h-24 overflow-y-auto select-all leading-normal">
                    {getIframeCode()}
                  </div>
                </div>
              </div>
            )}

            {/* GUIDE TAB */}
            {customizerTab === 'guide' && (
              <div className="space-y-3.5 animate-fade-in text-[11px] text-theme-body leading-relaxed">
                <div className="p-3 bg-theme-accent/5 border border-theme-accent/20 rounded-xl">
                  <h5 className="font-bold text-xs text-theme-accent mb-1 flex items-center gap-1">
                    <Info size={13} />
                    Adding to Google Sites is incredibly easy!
                  </h5>
                  <p className="text-[10px] text-theme-muted leading-relaxed">
                    Follow these simple steps to integrate this interactive presentation perfectly:
                  </p>
                </div>

                <ol className="space-y-2.5 list-decimal list-inside px-1">
                  <li>
                    Go to the <span className="font-semibold text-theme-main">Google Sites Embed tab</span> above and click <span className="font-semibold text-theme-accent">Copy Code</span> (or Copy URL).
                  </li>
                  <li>
                    Open your Google Sites editor page, locate the sidebar panel on the right, and choose <span className="font-semibold text-theme-main">Embed</span> under the Insert menu.
                  </li>
                  <li>
                    In the popup, click on the <span className="font-semibold text-theme-main">Embed code</span> tab (if you copied the iframe snippet) or keep <span className="font-semibold text-theme-main">By URL</span> (if you copied the direct URL).
                  </li>
                  <li>
                    Paste the code/URL into the box and click <span className="font-semibold text-theme-accent font-bold">Next</span>, then click <span className="font-semibold text-theme-accent font-bold">Insert</span>.
                  </li>
                  <li>
                    Drag the corner handles of the newly created card on your Google Site page to resize it so that the content displays beautifully without scrollbars!
                  </li>
                </ol>

                <div className="pt-2 text-[10px] text-theme-muted border-t border-theme-border italic">
                  Tip: Dynamic options are encoded in the URL, so any style toggles you make here are automatically preserved in the generated code!
                </div>
              </div>
            )}

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
