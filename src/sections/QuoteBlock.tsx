/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import type { Quote } from '../content/schema';

interface QuoteBlockProps {
  quote: Quote;
}

export const QuoteBlock: React.FC<QuoteBlockProps> = ({ quote }) => (
  <div className="p-6 bg-theme-bg border border-theme-border rounded-lg border-l-4 border-l-theme-accent transition-all duration-300 text-left">
    <p className="font-serif italic text-xl text-theme-main mb-4 leading-relaxed">
      "{quote.text}"
    </p>
    <span className="text-sm font-bold text-theme-muted tracking-wider uppercase">{quote.author}</span>
  </div>
);
