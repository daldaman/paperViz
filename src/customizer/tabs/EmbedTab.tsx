/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Embed tab: compact-mode + visitor-controls toggles, the direct embed URL,
 * and the iframe snippet. Extracted from the pre-Phase-5 CustomizerPanel
 * monolith with two Phase-5 changes: the generated URL/snippet now carry
 * `&paper=<slug>` (App.tsx still hardcodes the active slug until Phase 6's
 * routing lands, but the customizer already threads it through so this file
 * won't need to change again then), and the unused
 * `allow="geolocation; microphone; camera"` iframe attribute — a leftover
 * from the AI Studio export; nothing in this app requests any of those
 * permissions — has been dropped from the generated snippet.
 */
import React, { useState } from 'react';
import { Layers, EyeOff, Copy, Check } from 'lucide-react';
import { useTheme } from '../../theme/useTheme';
import { THEMES } from '../../theme/themes';

interface EmbedTabProps {
  slug: string;
}

export const EmbedTab: React.FC<EmbedTabProps> = ({ slug }) => {
  const { activeThemeKey, activeFontHeadingKey, activeFontBodyKey, embedMode, setEmbedMode } = useTheme();
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [visitorControlsEnabled, setVisitorControlsEnabled] = useState(false);

  const currentBaseUrl = window.location.origin + window.location.pathname;

  const getEmbedUrl = () => {
    let url = `${currentBaseUrl}?embed=true&theme=${activeThemeKey}&font-heading=${encodeURIComponent(activeFontHeadingKey)}&font-body=${encodeURIComponent(activeFontBodyKey)}&paper=${encodeURIComponent(slug)}`;
    if (!visitorControlsEnabled) {
      url += '&hide-customizer=true';
    }
    return url;
  };

  const getIframeCode = () => {
    return `<iframe src="${getEmbedUrl()}" width="100%" height="700" style="border:none; border-radius:12px; background:${THEMES[activeThemeKey].bg}; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);"></iframe>`;
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

  return (
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
          <button onClick={handleCopyUrl} className="text-theme-accent hover:underline flex items-center gap-0.5 font-semibold text-[10px]">
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
          <button onClick={handleCopyEmbed} className="text-theme-accent hover:underline flex items-center gap-0.5 font-semibold text-[10px]">
            {copiedEmbed ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
            <span>{copiedEmbed ? 'Copied' : 'Copy Code'}</span>
          </button>
        </div>
        <div className="p-2 bg-theme-bg border border-theme-border rounded-lg font-mono text-[10px] text-theme-body break-all max-h-24 overflow-y-auto select-all leading-normal">
          {getIframeCode()}
        </div>
      </div>
    </div>
  );
};
