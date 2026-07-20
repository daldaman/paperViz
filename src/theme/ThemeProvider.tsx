/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useEffect, useState } from 'react';
import { THEMES, FONTS_HEADING, FONTS_BODY } from './themes';

export interface ThemeContextValue {
  activeThemeKey: keyof typeof THEMES;
  setActiveThemeKey: React.Dispatch<React.SetStateAction<keyof typeof THEMES>>;
  activeFontHeadingKey: keyof typeof FONTS_HEADING;
  setActiveFontHeadingKey: React.Dispatch<React.SetStateAction<keyof typeof FONTS_HEADING>>;
  activeFontBodyKey: keyof typeof FONTS_BODY;
  setActiveFontBodyKey: React.Dispatch<React.SetStateAction<keyof typeof FONTS_BODY>>;
  embedMode: boolean;
  setEmbedMode: React.Dispatch<React.SetStateAction<boolean>>;
  hideCustomizer: boolean;
  setHideCustomizer: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeThemeKey, setActiveThemeKey] = useState<keyof typeof THEMES>('gold-cream');
  const [activeFontHeadingKey, setActiveFontHeadingKey] = useState<keyof typeof FONTS_HEADING>('Playfair Display');
  const [activeFontBodyKey, setActiveFontBodyKey] = useState<keyof typeof FONTS_BODY>('Inter');
  const [embedMode, setEmbedMode] = useState(false);
  const [hideCustomizer, setHideCustomizer] = useState(false);

  // Handle URL query parameters for seamless integration
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // Parse Theme
    const tParam = params.get('theme');
    if (tParam) {
      if (tParam === 'cosmic' || tParam === 'cosmic-slate') {
        setActiveThemeKey('cosmic-slate');
      } else if (tParam === 'academic' || tParam === 'academic-indigo') {
        setActiveThemeKey('academic-indigo');
      } else if (tParam === 'forest' || tParam === 'forest-emerald') {
        setActiveThemeKey('forest-emerald');
      } else if (tParam === 'gold' || tParam === 'gold-cream') {
        setActiveThemeKey('gold-cream');
      }
    }

    // Parse Fonts
    const fontHeadParam = params.get('font-heading') || params.get('font');
    if (fontHeadParam) {
      const decodedHead = decodeURIComponent(fontHeadParam).toLowerCase();
      if (decodedHead.includes('playfair')) setActiveFontHeadingKey('Playfair Display');
      else if (decodedHead.includes('space') || decodedHead.includes('grotesk')) setActiveFontHeadingKey('Space Grotesk');
      else if (decodedHead.includes('mono') || decodedHead.includes('jetbrains')) setActiveFontHeadingKey('JetBrains Mono');
      else if (decodedHead.includes('lora')) setActiveFontHeadingKey('Lora');
      else if (decodedHead.includes('inter')) setActiveFontHeadingKey('Inter');
    }

    const fontBodyParam = params.get('font-body');
    if (fontBodyParam) {
      const decodedBody = decodeURIComponent(fontBodyParam).toLowerCase();
      if (decodedBody.includes('inter')) setActiveFontBodyKey('Inter');
      else if (decodedBody.includes('lora')) setActiveFontBodyKey('Lora');
      else if (decodedBody.includes('mono') || decodedBody.includes('jetbrains')) setActiveFontBodyKey('JetBrains Mono');
    }

    // Parse Embed Mode
    const embedParam = params.get('embed');
    if (embedParam === 'true' || embedParam === '1') {
      setEmbedMode(true);
    }

    // Parse Hide Customizer option
    const hideCustomizerParam = params.get('hide-customizer');
    const controlsParam = params.get('controls');
    if (hideCustomizerParam === 'true' || controlsParam === 'false') {
      setHideCustomizer(true);
    }
  }, []);

  // Update document body and root styles when theme/font options change
  useEffect(() => {
    const root = document.documentElement;
    const theme = THEMES[activeThemeKey];

    root.style.setProperty('--color-bg', theme.bg);
    root.style.setProperty('--color-card-bg', theme.cardBg);
    root.style.setProperty('--color-text-main', theme.textMain);
    root.style.setProperty('--color-text-body', theme.textBody);
    root.style.setProperty('--color-text-muted', theme.textMuted);
    root.style.setProperty('--color-border', theme.border);
    root.style.setProperty('--color-accent', theme.accent);
    root.style.setProperty('--color-accent-muted', theme.accentMuted);

    root.style.setProperty('--font-serif-runtime', FONTS_HEADING[activeFontHeadingKey]);
    root.style.setProperty('--font-sans-runtime', FONTS_BODY[activeFontBodyKey]);
  }, [activeThemeKey, activeFontHeadingKey, activeFontBodyKey]);

  const value: ThemeContextValue = {
    activeThemeKey,
    setActiveThemeKey,
    activeFontHeadingKey,
    setActiveFontHeadingKey,
    activeFontBodyKey,
    setActiveFontBodyKey,
    embedMode,
    setEmbedMode,
    hideCustomizer,
    setHideCustomizer,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
