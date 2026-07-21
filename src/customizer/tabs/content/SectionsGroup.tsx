/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * sections[] editor: item cards (rendered generically via ObjectFields over
 * ProseSectionSchema) plus the two things the generic array field
 * (fields.tsx) deliberately doesn't do — reorder and a schema-valid
 * "+ Add Section" template. `id` is excluded from the editable fields (see
 * hasEditableIdField in schemaIntrospect.ts) and shown read-only instead,
 * since it's the anchor used for #hash nav/scroll-to.
 */
import React from 'react';
import { ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import { ProseSectionSchema, type ProseSection } from '../../../content/schema';
import type { PathSegment } from '../../updateAtPath';
import { ObjectFields, ItemIdBadge, type UpdateFn } from './fields';

const moveButtonClass = 'p-1 rounded-sm text-theme-muted hover:text-theme-main hover:bg-theme-bg disabled:opacity-30 disabled:hover:bg-transparent transition-colors';

function newSectionTemplate(existing: ProseSection[]): ProseSection {
  const usedIds = new Set(existing.map((s) => s.id));
  let n = existing.length + 1;
  let id = `section-${n}`;
  while (usedIds.has(id)) {
    n += 1;
    id = `section-${n}`;
  }
  return {
    id,
    inNav: false,
    title: 'New Section',
    dropcap: false,
    layout: 'prose',
    body: ['New paragraph text.'],
    tone: 'default',
  };
}

interface SectionsGroupProps {
  sections: ProseSection[];
  onUpdate: UpdateFn;
}

export const SectionsGroup: React.FC<SectionsGroupProps> = ({ sections, onUpdate }) => {
  const path: PathSegment[] = ['sections'];

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= sections.length) return;
    const next = sections.slice();
    [next[i], next[j]] = [next[j], next[i]];
    onUpdate(path, next);
  };
  const remove = (i: number) => onUpdate(path, sections.filter((_, idx) => idx !== i));
  const add = () => onUpdate(path, [...sections, newSectionTemplate(sections)]);

  return (
    <div className="space-y-3">
      {sections.map((section, i) => (
        <div key={section.id} className="p-3 bg-theme-bg/60 rounded-xl border border-theme-border/60">
          <div className="flex items-center justify-between mb-2 gap-2">
            <span className="font-semibold text-[11px] text-theme-main truncate">
              Section {i + 1}: {section.title || '(untitled)'}
            </span>
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className={moveButtonClass} title="Move up">
                <ArrowUp size={12} />
              </button>
              <button type="button" disabled={i === sections.length - 1} onClick={() => move(i, 1)} className={moveButtonClass} title="Move down">
                <ArrowDown size={12} />
              </button>
              <button
                type="button"
                onClick={() => remove(i)}
                className="p-1 rounded-sm text-red-500 hover:bg-red-500/10 transition-colors"
                title="Remove section"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
          <div className="border-t border-theme-border/40 pt-2.5">
            <ItemIdBadge id={section.id} />
            <ObjectFields schema={ProseSectionSchema} value={section} path={[...path, i]} onUpdate={onUpdate} excludeKeys={['id']} />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="w-full py-1.5 mt-1 border border-dashed border-theme-accent/40 rounded-lg text-theme-accent hover:bg-theme-accent/5 text-[10px] font-bold transition-all text-center"
      >
        + Add New Section
      </button>
    </div>
  );
};
