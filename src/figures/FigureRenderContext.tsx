/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Ambient context threaded down to every rendered figure — currently just
 * the active paper's slug, which `StaticFigure` needs to resolve its image
 * path via `withBase('papers', slug, figure.src)`. A context (rather than a
 * prop on every figure component's signature) keeps the figure registry's
 * per-component dispatch generic: most figure kinds don't need the slug at
 * all, and new ones that do can read it without a signature change upstream.
 */
import React, { createContext, useContext } from 'react';

interface FigureRenderContextValue {
  slug: string;
}

const FigureRenderContext = createContext<FigureRenderContextValue | null>(null);

export const FigureRenderProvider: React.FC<{ slug: string; children: React.ReactNode }> = ({ slug, children }) => (
  <FigureRenderContext.Provider value={{ slug }}>{children}</FigureRenderContext.Provider>
);

export function useFigureRenderContext(): FigureRenderContextValue {
  const ctx = useContext(FigureRenderContext);
  if (!ctx) {
    throw new Error('useFigureRenderContext must be used within a FigureRenderProvider');
  }
  return ctx;
}
