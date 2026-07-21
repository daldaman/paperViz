/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import type { Quote } from '../content/schema';

interface QuoteBlockProps {
  quote: Quote;
  /** Dark variant for `tone: 'inverse'` sections (fixed stone/amber palette). */
  inverse?: boolean;
}

export const QuoteBlock: React.FC<QuoteBlockProps> = ({ quote, inverse = false }) => (
  <div
    className={
      inverse
        ? 'p-6 bg-stone-900 border border-stone-800 rounded-lg border-l-4 border-l-amber-400 transition-all duration-300 text-left'
        : 'p-6 bg-theme-bg border border-theme-border rounded-lg border-l-4 border-l-theme-accent transition-all duration-300 text-left'
    }
  >
    <p className={`font-serif italic text-xl mb-4 leading-relaxed ${inverse ? 'text-stone-100' : 'text-theme-main'}`}>
      "{quote.text}"
    </p>
    <span className={`text-sm font-bold tracking-wider uppercase ${inverse ? 'text-stone-400' : 'text-theme-muted'}`}>{quote.author}</span>
  </div>
);
