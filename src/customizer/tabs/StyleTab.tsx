/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Style tab: theme palette + font pickers. Extracted verbatim (zero visual
 * change) from the pre-Phase-5 CustomizerPanel monolith into its own file;
 * reads/writes theme state directly via useTheme() instead of having it
 * threaded down as props.
 */
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { useTheme } from '../../theme/useTheme';
import { THEMES, FONTS_HEADING, FONTS_BODY } from '../../theme/themes';

export const StyleTab: React.FC = () => {
  const {
    activeThemeKey, setActiveThemeKey,
    activeFontHeadingKey, setActiveFontHeadingKey,
    activeFontBodyKey, setActiveFontBodyKey,
  } = useTheme();

  const handleResetStyle = () => {
    setActiveThemeKey('gold-cream');
    setActiveFontHeadingKey('Playfair Display');
    setActiveFontBodyKey('Inter');
  };

  return (
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
  );
};
