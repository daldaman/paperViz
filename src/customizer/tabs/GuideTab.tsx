/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Guide tab: static Google Sites embedding instructions. Extracted verbatim
 * (zero visual/content change) from the pre-Phase-5 CustomizerPanel
 * monolith into its own file.
 */
import React from 'react';
import { Info } from 'lucide-react';

export const GuideTab: React.FC = () => (
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
        Go to the <span className="font-semibold text-theme-main">Google Sites Embed tab</span> above and click{' '}
        <span className="font-semibold text-theme-accent">Copy Code</span> (or Copy URL).
      </li>
      <li>
        Open your Google Sites editor page, locate the sidebar panel on the right, and choose{' '}
        <span className="font-semibold text-theme-main">Embed</span> under the Insert menu.
      </li>
      <li>
        In the popup, click on the <span className="font-semibold text-theme-main">Embed code</span> tab (if you copied the iframe
        snippet) or keep <span className="font-semibold text-theme-main">By URL</span> (if you copied the direct URL).
      </li>
      <li>
        Paste the code/URL into the box and click <span className="font-semibold text-theme-accent font-bold">Next</span>, then click{' '}
        <span className="font-semibold text-theme-accent font-bold">Insert</span>.
      </li>
      <li>
        Drag the corner handles of the newly created card on your Google Site page to resize it so that the content displays beautifully
        without scrollbars!
      </li>
    </ol>

    <div className="pt-2 text-[10px] text-theme-muted border-t border-theme-border italic">
      Tip: Dynamic options are encoded in the URL, so any style toggles you make here are automatically preserved in the generated code!
    </div>
  </div>
);
