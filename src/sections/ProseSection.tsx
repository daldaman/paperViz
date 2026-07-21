/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * ONE generic component that renders any `sections[]` entry from
 * PaperContent. The four `layout` values reproduce the four distinct
 * arrangements the original 1552-line App.tsx hardcoded per-section
 * (introduction/prose, science/figure-right, innovation/figure-left+dark,
 * results/figure-below, impact/figure-left+light). `tone: 'inverse'` is
 * orthogonal to layout: any layout can go dark, using the shared fixed
 * stone-950/amber chrome (INVERSE_SECTION_CLASS + InverseGlow) that the
 * original AlphaQubit innovation section established.
 *
 * Figure rendering is delegated to src/figures/registry.ts's renderFigure()
 * — Phase 4 replaced the Phase-3 "temporary literal switch on
 * figure.component" that used to live in this file.
 */
import React from 'react';
import { BookOpen } from 'lucide-react';
import type { ProseSection as ProseSectionData, Figure } from '../content/schema';
import { renderFigure } from '../figures/registry';
import { QuoteBlock } from './QuoteBlock';

interface ProseSectionProps {
  section: ProseSectionData;
  figures: Figure[];
}

function Eyebrow({ section }: { section: ProseSectionData }) {
  if (!section.eyebrow) return null;

  // Inverse sections always get the dark chip, whatever their layout —
  // tone is orthogonal to layout (the original AlphaQubit content only ever
  // combined inverse with figure-left, but other content may not).
  if (section.tone === 'inverse') {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-stone-900 text-amber-400 text-xs font-bold tracking-widest uppercase rounded-full mb-6 border border-stone-800">
        {section.eyebrow}
      </div>
    );
  }

  if (section.layout === 'figure-right') {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-theme-bg text-theme-body text-xs font-bold tracking-widest uppercase rounded-full mb-6 border border-theme-border">
        <BookOpen size={14} className="text-theme-accent" /> {section.eyebrow}
      </div>
    );
  }

  return (
    <div className="inline-block mb-3 text-xs font-bold tracking-widest text-theme-muted uppercase">
      {section.eyebrow}
    </div>
  );
}

function getTitleClassName(section: ProseSectionData): string {
  const titleColor = section.tone === 'inverse' ? 'text-white' : 'text-theme-main';
  if (section.layout === 'prose') {
    return `font-serif text-4xl mb-6 leading-tight ${titleColor}`;
  }
  if (section.layout === 'figure-right' || section.layout === 'figure-below') {
    return `font-serif text-4xl md:text-5xl mb-6 ${titleColor}`;
  }
  if (section.layout === 'figure-left') {
    return section.tone === 'inverse'
      ? 'font-serif text-4xl md:text-5xl mb-6 text-white leading-tight'
      : 'font-serif text-4xl mb-6 text-theme-main leading-tight';
  }
  return `font-serif text-4xl mb-6 ${titleColor}`;
}

/**
 * Shared dark-section chrome for `tone: 'inverse'` in any layout: the fixed
 * stone-950/amber palette the original AlphaQubit innovation section used
 * (deliberately NOT theme-driven — see MEMORY.md key decisions).
 */
const INVERSE_SECTION_CLASS = 'py-20 bg-stone-950 text-stone-100 overflow-hidden relative border-y border-stone-800';

function InverseGlow() {
  return (
    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
      <div className="w-96 h-96 rounded-full bg-stone-800 blur-[100px] absolute top-[-100px] left-[-100px]"></div>
      <div className="w-96 h-96 rounded-full bg-amber-500/30 blur-[100px] absolute bottom-[-100px] right-[-100px]"></div>
    </div>
  );
}

/**
 * Renders `section.body`, applying the dropcap treatment to the first
 * letter of body[0] when `section.dropcap` is set. Spacing between
 * paragraphs matches each original section: `figure-right` (science) used a
 * literal `mb-6` on every <p> including the last, everything else used a
 * `space-y-6` wrapper (no trailing margin) — reproduced here via the
 * `useIndividualMargins` branch so the two aren't visually interchangeable.
 */
function BodyParagraphs({ section }: { section: ProseSectionData }) {
  const textColorClass = section.tone === 'inverse' ? 'text-stone-300 font-sans' : 'text-theme-body';
  const useIndividualMargins = section.layout === 'figure-right';

  const renderParagraph = (text: string, key: number, isFirst: boolean) => {
    const marginClass = useIndividualMargins ? 'mb-6' : undefined;
    if (isFirst && section.dropcap) {
      const dropcapChar = text.slice(0, 1);
      const remainder = text.slice(1);
      return (
        <p key={key} className={marginClass}>
          <span className="text-5xl float-left mr-3 mt-[-8px] font-serif text-theme-accent font-semibold">{dropcapChar}</span>
          {remainder}
        </p>
      );
    }
    return (
      <p key={key} className={marginClass}>{text}</p>
    );
  };

  if (useIndividualMargins) {
    return (
      <div className={`text-lg ${textColorClass} leading-relaxed`}>
        {section.body.map((paragraph, i) => renderParagraph(paragraph, i, i === 0))}
      </div>
    );
  }

  const wrapperClass = `text-lg ${textColorClass} leading-relaxed space-y-6${section.quote ? ' mb-8' : ''}`;
  return (
    <div className={wrapperClass}>
      {section.body.map((paragraph, i) => renderParagraph(paragraph, i, i === 0))}
    </div>
  );
}

export const ProseSection: React.FC<ProseSectionProps> = ({ section, figures }) => {
  const figure = section.figureId ? figures.find((f) => f.id === section.figureId) : undefined;
  const figureElement = figure ? renderFigure(figure) : null;
  const hasFigure = Boolean(figureElement);

  const inverse = section.tone === 'inverse';

  // --- prose (introduction) ---
  if (section.layout === 'prose') {
    return (
      <section id={section.id} className={inverse ? INVERSE_SECTION_CLASS : 'py-20 bg-theme-card border-b border-theme-border/40'}>
        {inverse && <InverseGlow />}
        <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-12 items-start relative z-10">
          <div className="md:col-span-4">
            <Eyebrow section={section} />
            <h2 className={getTitleClassName(section)}>{section.title}</h2>
            <div className={`w-16 h-1 mb-6 ${inverse ? 'bg-amber-400' : 'bg-theme-accent'}`}></div>
          </div>
          <div className="md:col-span-8">
            <BodyParagraphs section={section} />
            {section.quote && <QuoteBlock quote={section.quote} inverse={inverse} />}
          </div>
        </div>
      </section>
    );
  }

  // --- figure-right (science) ---
  if (section.layout === 'figure-right') {
    return (
      <section id={section.id} className={inverse ? INVERSE_SECTION_CLASS : 'py-20 bg-theme-card border-b border-theme-border/40'}>
        {inverse && <InverseGlow />}
        <div className="container mx-auto px-6 relative z-10">
          <div className={hasFigure ? 'grid grid-cols-1 lg:grid-cols-2 gap-16 items-center' : 'max-w-3xl mx-auto'}>
            <div className={hasFigure ? '' : 'text-center md:text-left'}>
              <Eyebrow section={section} />
              <h2 className={getTitleClassName(section)}>{section.title}</h2>
              <BodyParagraphs section={section} />
              {section.quote && <QuoteBlock quote={section.quote} inverse={inverse} />}
            </div>
            {hasFigure && <div>{figureElement}</div>}
          </div>
        </div>
      </section>
    );
  }

  // --- figure-left: innovation (inverse/dark) or impact (default/light) ---
  if (section.layout === 'figure-left') {
    if (inverse) {
      return (
        <section id={section.id} className={INVERSE_SECTION_CLASS}>
          <InverseGlow />
          <div className="container mx-auto px-6 relative z-10">
            <div className={hasFigure ? 'grid grid-cols-1 lg:grid-cols-2 gap-16 items-center' : 'max-w-3xl mx-auto text-center md:text-left'}>
              {hasFigure && <div className="order-2 lg:order-1">{figureElement}</div>}
              <div className={`order-1 ${hasFigure ? 'lg:order-2' : ''} animate-fade-in`}>
                <Eyebrow section={section} />
                <h2 className={getTitleClassName(section)}>{section.title}</h2>
                <BodyParagraphs section={section} />
                {section.quote && <QuoteBlock quote={section.quote} inverse />}
              </div>
            </div>
          </div>
        </section>
      );
    }

    return (
      <section id={section.id} className="py-20 bg-theme-card border-t border-b border-theme-border/50">
        <div className="container mx-auto px-6">
          <div className={hasFigure ? 'grid grid-cols-1 md:grid-cols-12 gap-12' : 'max-w-3xl mx-auto'}>
            {hasFigure && <div className="md:col-span-5 relative">{figureElement}</div>}
            <div className={hasFigure ? 'md:col-span-7 flex flex-col justify-center' : 'flex flex-col justify-center text-center md:text-left'}>
              <Eyebrow section={section} />
              <h2 className={getTitleClassName(section)}>{section.title}</h2>
              <BodyParagraphs section={section} />
              {section.quote && <QuoteBlock quote={section.quote} />}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // --- figure-below (results) ---
  return (
    <section id={section.id} className={inverse ? INVERSE_SECTION_CLASS : 'py-20 bg-theme-bg'}>
      {inverse && <InverseGlow />}
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <Eyebrow section={section} />
          <h2 className={getTitleClassName(section)}>{section.title}</h2>
          <BodyParagraphs section={section} />
        </div>
        {hasFigure && <div className="max-w-3xl mx-auto">{figureElement}</div>}
        {section.quote && <QuoteBlock quote={section.quote} inverse={inverse} />}
      </div>
    </section>
  );
};
