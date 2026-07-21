/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Content tab: schema-generic recursive form over the current PaperContent
 * value, replacing the pre-Phase-5 hand-wired inputs that hardcoded
 * AlphaQubit's section/figure indices (sections[0], figures[2], etc. — see
 * git history before this commit). Field controls are chosen by walking
 * src/content/schema.ts's zod shapes at runtime (tabs/content/), not by any
 * paper-specific field list, so this tab renders correctly for any paper
 * JSON that validates against PaperContentSchema.
 *
 * The five top-level groups (Meta / Sections / Figures / Authors / Footer)
 * and their numbered-section header styling are the one hand-authored
 * piece — per the plan, the tab should still "look native" rather than
 * dumping one flat generic form. Everything under each header is generic:
 * Meta/Authors/Footer render straight through ObjectFields; Sections/
 * Figures get their own small group components (SectionsGroup/
 * FiguresGroup) only because those two need reordering and schema-valid
 * "+ Add" templates that the generic array field intentionally doesn't
 * provide for every array (see fields.tsx).
 */
import React from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { MetaSchema, AuthorsBlockSchema, FooterSchema, type PaperContent } from '../../content/schema';
import type { PathSegment } from '../updateAtPath';
import { JsonImportExport } from '../JsonImportExport';
import { ObjectFields } from './content/fields';
import { SectionsGroup } from './content/SectionsGroup';
import { FiguresGroup } from './content/FiguresGroup';

interface ContentTabProps {
  content: PaperContent;
  slug: string;
  updateField: (path: PathSegment[], value: unknown) => void;
  resetContent: () => void;
}

const groupHeaderClass = 'font-bold text-[11px] uppercase tracking-wider text-theme-muted mb-2';

export const ContentTab: React.FC<ContentTabProps> = ({ content, slug, updateField, resetContent }) => {
  return (
    <div className="space-y-4 animate-fade-in text-xs max-h-[50vh] overflow-y-auto pr-1 pb-4">
      <div className="p-3 bg-theme-accent/5 border border-theme-accent/20 rounded-xl mb-2">
        <h5 className="font-bold text-[11px] text-theme-accent mb-1 flex items-center gap-1">
          <Sparkles size={12} />
          Academic Paper Editor
        </h5>
        <p className="text-[10px] text-theme-muted leading-relaxed">
          Customize the text content of this interactive applet for your own academic work. Changes apply instantly and persist in your
          browser.
        </p>
      </div>

      <JsonImportExport content={content} slug={slug} onImport={(next) => updateField([], next)} />

      {/* RESET BUTTON */}
      <div className="flex justify-end">
        <button
          onClick={resetContent}
          className="text-[10px] text-theme-muted hover:text-red-500 font-semibold flex items-center gap-1 transition-colors border border-theme-border/60 rounded-sm px-2 py-1 bg-theme-bg/40"
        >
          <RefreshCw size={10} />
          Reset Content
        </button>
      </div>

      {/* GROUP: META */}
      <div className="border-t border-theme-border/50 pt-3">
        <h4 className={groupHeaderClass}>1. Meta</h4>
        <ObjectFields schema={MetaSchema} value={content.meta} path={['meta']} onUpdate={updateField} />
      </div>

      {/* GROUP: SECTIONS */}
      <div className="border-t border-theme-border/50 pt-3">
        <h4 className={groupHeaderClass}>2. Sections</h4>
        <SectionsGroup sections={content.sections} onUpdate={updateField} />
      </div>

      {/* GROUP: FIGURES */}
      <div className="border-t border-theme-border/50 pt-3">
        <h4 className={groupHeaderClass}>3. Figures</h4>
        <FiguresGroup figures={content.figures} onUpdate={updateField} />
      </div>

      {/* GROUP: AUTHORS */}
      <div className="border-t border-theme-border/50 pt-3">
        <h4 className={groupHeaderClass}>4. Authors</h4>
        <ObjectFields schema={AuthorsBlockSchema} value={content.authors} path={['authors']} onUpdate={updateField} />
      </div>

      {/* GROUP: FOOTER */}
      <div className="border-t border-theme-border/50 pt-3">
        <h4 className={groupHeaderClass}>5. Footer</h4>
        <ObjectFields schema={FooterSchema} value={content.footer} path={['footer']} onUpdate={updateField} />
      </div>

      {/* READ-ONLY PREVIEW */}
      <div className="border-t border-theme-border/50 pt-3">
        <h4 className="font-bold text-[11px] uppercase tracking-wider text-theme-muted mb-1">Live JSON Preview</h4>
        <p className="text-[9px] text-theme-muted leading-relaxed mb-2">
          Read-only — use <span className="font-semibold text-theme-main">Export JSON</span> above to download this as{' '}
          <code className="font-mono bg-theme-bg px-1 rounded-sm">{slug}.json</code>.
        </p>
        <pre className="p-2.5 bg-stone-950 text-stone-300 font-mono text-[9px] rounded-lg overflow-x-auto max-h-40 overflow-y-auto select-all leading-normal whitespace-pre-wrap">
          {JSON.stringify(content, null, 2)}
        </pre>
      </div>
    </div>
  );
};
