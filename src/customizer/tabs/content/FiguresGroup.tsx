/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * figures[] editor: each item dispatches to the matching Figure variant
 * schema (InteractiveFigureSchema / StaticFigureSchema / DiagramFigureSchema)
 * by its `kind`, rendered generically via ObjectFields — for `interactive`
 * that's exactly "title/description/component normally, props as a raw
 * JSON sub-editor" per the plan, because `props` is a `z.record(...)` field
 * and ObjectFields already routes record fields to the JSON sub-editor
 * (fields.tsx) with no figure-specific code needed here. `id` is excluded
 * and shown read-only (see SectionsGroup for the same rationale — figures
 * are referenced by id from sections[].figureId).
 *
 * Adding a new figure is kind-first: pick interactive/static/diagram from
 * the selector, then "+ Add Figure" inserts a minimal but schema-valid
 * template for that kind (a real `component` pick for interactive, a real
 * placeholder node for diagram — `nodes` has a `min(1)`).
 */
import React, { useState } from 'react';
import { ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import {
  InteractiveFigureSchema,
  StaticFigureSchema,
  DiagramFigureSchema,
  INTERACTIVE_COMPONENTS,
  type Figure,
} from '../../../content/schema';
import type { PathSegment } from '../../updateAtPath';
import { ObjectFields, ItemIdBadge, type UpdateFn } from './fields';

const moveButtonClass = 'p-1 rounded-sm text-theme-muted hover:text-theme-main hover:bg-theme-bg disabled:opacity-30 disabled:hover:bg-transparent transition-colors';

type FigureKind = Figure['kind'];
const FIGURE_KINDS: { value: FigureKind; label: string }[] = [
  { value: 'interactive', label: 'Interactive' },
  { value: 'static', label: 'Static Image' },
  { value: 'diagram', label: 'Concept Map' },
];

function nextFigureId(existing: Figure[]): string {
  const usedIds = new Set(existing.map((f) => f.id));
  let n = existing.length + 1;
  let id = `figure-${n}`;
  while (usedIds.has(id)) {
    n += 1;
    id = `figure-${n}`;
  }
  return id;
}

function newFigureTemplate(kind: FigureKind, existing: Figure[]): Figure {
  const id = nextFigureId(existing);
  switch (kind) {
    case 'interactive':
      return { kind: 'interactive', id, component: INTERACTIVE_COMPONENTS[0], title: '', description: '', props: {} };
    case 'static':
      return { kind: 'static', id, src: 'placeholder.png', alt: 'Placeholder image', caption: 'New caption' };
    case 'diagram':
      return {
        kind: 'diagram',
        id,
        title: '',
        description: '',
        spec: { nodes: [{ id: 'node-1', label: 'New node', type: 'neutral' }], edges: [] },
      };
  }
}

function schemaForKind(kind: FigureKind) {
  switch (kind) {
    case 'interactive':
      return InteractiveFigureSchema;
    case 'static':
      return StaticFigureSchema;
    case 'diagram':
      return DiagramFigureSchema;
  }
}

interface FiguresGroupProps {
  figures: Figure[];
  onUpdate: UpdateFn;
}

export const FiguresGroup: React.FC<FiguresGroupProps> = ({ figures, onUpdate }) => {
  const path: PathSegment[] = ['figures'];
  const [addKind, setAddKind] = useState<FigureKind>('interactive');

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= figures.length) return;
    const next = figures.slice();
    [next[i], next[j]] = [next[j], next[i]];
    onUpdate(path, next);
  };
  const remove = (i: number) => onUpdate(path, figures.filter((_, idx) => idx !== i));
  const add = () => onUpdate(path, [...figures, newFigureTemplate(addKind, figures)]);

  return (
    <div className="space-y-3">
      {figures.map((figure, i) => (
        <div key={figure.id} className="p-3 bg-theme-bg/60 rounded-xl border border-theme-border/60">
          <div className="flex items-center justify-between mb-2 gap-2">
            <span className="font-semibold text-[11px] text-theme-main truncate">
              Fig {i + 1} <span className="uppercase text-theme-accent text-[9px] font-mono ml-1">{figure.kind}</span>
            </span>
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className={moveButtonClass} title="Move up">
                <ArrowUp size={12} />
              </button>
              <button type="button" disabled={i === figures.length - 1} onClick={() => move(i, 1)} className={moveButtonClass} title="Move down">
                <ArrowDown size={12} />
              </button>
              <button
                type="button"
                onClick={() => remove(i)}
                className="p-1 rounded-sm text-red-500 hover:bg-red-500/10 transition-colors"
                title="Remove figure"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
          <div className="border-t border-theme-border/40 pt-2.5">
            <ItemIdBadge id={figure.id} />
            <ObjectFields schema={schemaForKind(figure.kind)} value={figure} path={[...path, i]} onUpdate={onUpdate} excludeKeys={['id']} />
          </div>
        </div>
      ))}
      <div className="flex items-center gap-2 pt-1">
        <select
          value={addKind}
          onChange={(e) => setAddKind(e.target.value as FigureKind)}
          className="p-2 text-[10px] rounded-lg border border-theme-border bg-theme-bg text-theme-main"
        >
          {FIGURE_KINDS.map((k) => (
            <option key={k.value} value={k.value}>
              {k.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={add}
          className="flex-1 py-1.5 border border-dashed border-theme-accent/40 rounded-lg text-theme-accent hover:bg-theme-accent/5 text-[10px] font-bold transition-all text-center"
        >
          + Add Figure
        </button>
      </div>
    </div>
  );
};
