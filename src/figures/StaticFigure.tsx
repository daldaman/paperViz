/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Renders a static image cribbed from the paper PDF: caption, optional
 * credit line, click-to-open lightbox. New in Phase 4 — registered for
 * figure kind 'static' in src/figures/registry.ts.
 */
import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { StaticFigure as StaticFigureData } from '../content/schema';
import { withBase } from '../lib/publicPath';
import { useFigureRenderContext } from './FigureRenderContext';

interface StaticFigureProps {
  figure: StaticFigureData;
}

export const StaticFigure: React.FC<StaticFigureProps> = ({ figure }) => {
  const { slug } = useFigureRenderContext();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const src = withBase('papers', slug, figure.src);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxOpen]);

  return (
    <figure className="my-8">
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        className="block w-full overflow-hidden rounded-xl border border-theme-border bg-theme-card cursor-zoom-in group"
        aria-label={`Open larger view of: ${figure.alt}`}
      >
        <img
          src={src}
          alt={figure.alt}
          loading="lazy"
          className="w-full h-auto transition-transform duration-300 group-hover:scale-[1.02]"
        />
      </button>
      <figcaption className="mt-3 text-sm text-theme-body text-center">
        {figure.caption}
        {figure.credit && <span className="block mt-1 text-xs text-theme-muted">{figure.credit}</span>}
      </figcaption>

      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6 cursor-zoom-out"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setLightboxOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label={figure.alt}
          >
            <motion.img
              src={src}
              alt={figure.alt}
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl cursor-auto"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            />
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </figure>
  );
};
