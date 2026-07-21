/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * The generic recursive form: given a zod object schema and a value, render
 * one control per field, dispatched by the field's (unwrapped) zod type —
 * strings/numbers/booleans/enums get native controls, nested objects/arrays
 * recurse, and `z.record(...)` fields (currently only figures[].props) get
 * a raw JSON sub-editor. Every control writes back through the same
 * `onUpdate(path, value)` callback App.tsx already wires to
 * `updateAtPath` + the localStorage overlay — this module has no state of
 * its own beyond the JSON sub-editor's own draft text.
 */
import React, { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import { Trash2 } from 'lucide-react';
import type { PathSegment } from '../../updateAtPath';
import { unwrapSchema, buildPlaceholderValue, prettifyKey, hasEditableIdField } from './schemaIntrospect';

export type UpdateFn = (path: PathSegment[], value: unknown) => void;

// --- Shared styling (verbatim classes carried over from the pre-Phase-5 hand-wired form) ---
export const inputClass = 'w-full p-2 text-xs rounded-lg border border-theme-border bg-theme-bg text-theme-main';
export const textareaClass = `${inputClass} resize-none`;
const labelClass = 'block text-[10px] text-theme-muted mb-1 font-semibold uppercase';
const removeButtonClass = 'p-1.5 text-red-500 hover:bg-red-500/10 rounded-sm transition-colors self-stretch flex items-center justify-center';
const addButtonClass = 'w-full py-1.5 mt-1 border border-dashed border-theme-accent/40 rounded-lg text-theme-accent hover:bg-theme-accent/5 text-[10px] font-bold transition-all text-center';

export const FieldLabel: React.FC<{ text: string }> = ({ text }) => <label className={labelClass}>{text}</label>;

export const ItemIdBadge: React.FC<{ id: unknown }> = ({ id }) =>
  typeof id === 'string' && id.length > 0 ? <p className="text-[9px] text-theme-muted font-mono mb-2 truncate">id: {id}</p> : null;

// --- Scalar controls -------------------------------------------------------

const StringControl: React.FC<{ value: unknown; multiline?: boolean; onChange: (v: string) => void }> = ({ value, multiline, onChange }) => {
  const str = typeof value === 'string' ? value : '';
  const useTextarea = multiline || str.length > 80;
  return useTextarea ? (
    <textarea rows={multiline ? 2 : 3} value={str} onChange={(e) => onChange(e.target.value)} className={textareaClass} />
  ) : (
    <input type="text" value={str} onChange={(e) => onChange(e.target.value)} className={inputClass} />
  );
};

const NumberControl: React.FC<{ value: unknown; onChange: (v: number | undefined) => void }> = ({ value, onChange }) => {
  const num = typeof value === 'number' && Number.isFinite(value) ? value : '';
  return (
    <input
      type="number"
      value={num}
      onChange={(e) => {
        const raw = e.target.value;
        onChange(raw === '' ? undefined : Number(raw));
      }}
      className={inputClass}
    />
  );
};

const BooleanToggle: React.FC<{ value: unknown; onChange: (v: boolean) => void }> = ({ value, onChange }) => {
  const bool = Boolean(value);
  return (
    <button
      type="button"
      onClick={() => onChange(!bool)}
      className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${bool ? 'bg-theme-accent' : 'bg-theme-border'}`}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${bool ? 'translate-x-5.5' : 'translate-x-1'}`} />
    </button>
  );
};

const EnumSelect: React.FC<{ options: string[]; value: unknown; onChange: (v: string) => void }> = ({ options, value, onChange }) => {
  const current = typeof value === 'string' && options.includes(value) ? value : options[0];
  return (
    <select value={current} onChange={(e) => onChange(e.target.value)} className={inputClass}>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
};

/**
 * Raw JSON sub-editor for `z.record(...)` fields (figures[].props). Parses
 * on blur, not on every keystroke, so mid-edit invalid JSON doesn't nuke the
 * field. Re-syncs its draft text from the incoming `value` only when that
 * value changed for a reason *other* than this editor's own last commit
 * (e.g. Reset Content, a JSON import, or switching which figure is being
 * edited) — otherwise a successful commit's own re-render would stomp the
 * canonical (re-indented) text back over itself, which is harmless but also
 * checked here so the component is provably not fighting its own state.
 */
const JsonSubEditor: React.FC<{ label: string; value: unknown; onChange: (v: unknown) => void }> = ({ label, value, onChange }) => {
  const serialized = JSON.stringify(value ?? {}, null, 2);
  const [text, setText] = useState(serialized);
  const [error, setError] = useState<string | null>(null);
  const lastCommitted = useRef(serialized);

  // Resync the draft only when `value` changed for a reason other than our
  // own last commit below (e.g. Reset Content, a JSON import, or switching
  // which figure is open) — an effect, not a render-time setState, so this
  // never fights React's render purity rules.
  useEffect(() => {
    if (serialized !== lastCommitted.current) {
      lastCommitted.current = serialized;
      setText(serialized);
      setError(null);
    }
  }, [serialized]);

  const commit = () => {
    try {
      const parsed = JSON.parse(text);
      const canonical = JSON.stringify(parsed, null, 2);
      setError(null);
      setText(canonical);
      lastCommitted.current = canonical;
      onChange(parsed);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
    }
  };

  return (
    <div>
      <FieldLabel text={label} />
      <textarea
        rows={6}
        value={text}
        spellCheck={false}
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
        className={`${textareaClass} font-mono text-[10px] ${error ? 'border-red-500' : ''}`}
      />
      {error && <p className="text-[10px] text-red-500 mt-1">Invalid JSON: {error}</p>}
    </div>
  );
};

// --- Object / array recursion ----------------------------------------------

interface ObjectFieldsProps {
  schema: z.ZodObject;
  value: unknown;
  path: PathSegment[];
  onUpdate: UpdateFn;
  /** Field keys to skip entirely (used to hide referential `id` fields — see FieldRow's array-item handling). */
  excludeKeys?: string[];
}

/** Renders one FieldRow per key of a zod object's shape. No wrapping card — callers (group components, array item cards) own the surrounding box/border. */
export const ObjectFields: React.FC<ObjectFieldsProps> = ({ schema, value, path, onUpdate, excludeKeys = [] }) => {
  const shape = schema.shape as Record<string, z.ZodType>;
  const record = (value ?? {}) as Record<string, unknown>;
  return (
    <div className="space-y-2.5">
      {Object.entries(shape).map(([key, fieldSchema]) => {
        if (excludeKeys.includes(key)) return null;
        const { core } = unwrapSchema(fieldSchema);
        if (core instanceof z.ZodLiteral) return null; // discriminator fields (figures[].kind) aren't user-editable
        return <FieldRow key={key} schema={fieldSchema} value={record[key]} path={[...path, key]} keyName={key} onUpdate={onUpdate} />;
      })}
    </div>
  );
};

interface FieldRowProps {
  schema: z.ZodType;
  value: unknown;
  path: PathSegment[];
  keyName: string;
  onUpdate: UpdateFn;
}

/** One labeled field inside an ObjectFields block. Dispatches on the unwrapped zod type. */
export const FieldRow: React.FC<FieldRowProps> = ({ schema, value, path, keyName, onUpdate }) => {
  const { core, description } = unwrapSchema(schema);
  const label = description ?? prettifyKey(keyName);
  const set = (v: unknown) => onUpdate(path, v);

  if (core instanceof z.ZodBoolean) {
    return (
      <div className="flex items-center justify-between py-1">
        <span className="text-[10px] text-theme-muted font-semibold uppercase">{label}</span>
        <BooleanToggle value={value} onChange={set} />
      </div>
    );
  }

  if (core instanceof z.ZodEnum) {
    return (
      <div>
        <FieldLabel text={label} />
        <EnumSelect options={core.options as string[]} value={value} onChange={set} />
      </div>
    );
  }

  if (core instanceof z.ZodNumber) {
    return (
      <div>
        <FieldLabel text={label} />
        <NumberControl value={value} onChange={set} />
      </div>
    );
  }

  if (core instanceof z.ZodRecord) {
    return <JsonSubEditor label={label} value={value} onChange={set} />;
  }

  if (core instanceof z.ZodObject) {
    return (
      <div>
        <FieldLabel text={label} />
        <div className="pl-2.5 border-l-2 border-theme-border/40 space-y-2.5 mt-1">
          <ObjectFields schema={core} value={value} path={path} onUpdate={onUpdate} />
        </div>
      </div>
    );
  }

  if (core instanceof z.ZodArray) {
    // `.element`'s declared type defaults to zod's loose internal
    // `core.$ZodType`, not the classic `z.ZodType` used throughout this
    // module — same runtime object, safe cast (see schemaIntrospect.ts).
    return (
      <GenericArrayField
        elementSchema={core.element as z.ZodType}
        value={Array.isArray(value) ? value : []}
        path={path}
        keyName={keyName}
        label={label}
        onUpdate={onUpdate}
      />
    );
  }

  if (core instanceof z.ZodString) {
    return (
      <div>
        <FieldLabel text={label} />
        <StringControl value={value} multiline={keyName === 'body'} onChange={set} />
      </div>
    );
  }

  return null; // unhandled/unrecognized type (shouldn't happen for this content schema) — fail quiet, not crash
};

interface GenericArrayFieldProps {
  elementSchema: z.ZodType;
  value: unknown[];
  path: PathSegment[];
  keyName: string;
  label: string;
  onUpdate: UpdateFn;
}

/**
 * Generic array editor: add/remove only (no reordering — sections[] and
 * figures[] get bespoke move-up/down handling in SectionsGroup/
 * FiguresGroup because the plan scopes reordering to just those two).
 * Object-item arrays (authors.list, meta.links, a concept-map's
 * nodes[]/edges[]) render each item as a small card via ObjectFields, with
 * an `id` field (if present) shown read-only via ItemIdBadge rather than
 * editable — ids here are cross-referenced elsewhere (edge.from/to ->
 * node.id) so letting the generic form rename them out from under those
 * references would silently break things. Primitive-item arrays (only
 * sections[].body today) render each item as a bare textarea.
 */
const GenericArrayField: React.FC<GenericArrayFieldProps> = ({ elementSchema, value, path, keyName, label, onUpdate }) => {
  const items = value ?? [];
  const { core: elCore } = unwrapSchema(elementSchema);
  const isObjectItem = elCore instanceof z.ZodObject;
  const excludeId = isObjectItem && hasEditableIdField(elCore as z.ZodObject);

  const setItems = (next: unknown[]) => onUpdate(path, next);
  const addItem = () => setItems([...items, buildPlaceholderValue(elementSchema)]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));

  return (
    <div>
      <FieldLabel text={label} />
      <div className="space-y-2">
        {items.map((item, i) => (
          <div
            key={i}
            className={isObjectItem ? 'p-2.5 bg-theme-bg/40 rounded-lg border border-theme-border/50' : 'flex gap-1.5 items-start'}
          >
            <div className="flex-1 min-w-0">
              {isObjectItem ? (
                <>
                  {excludeId && <ItemIdBadge id={(item as Record<string, unknown>)?.id} />}
                  <ObjectFields
                    schema={elCore as z.ZodObject}
                    value={item}
                    path={[...path, i]}
                    onUpdate={onUpdate}
                    excludeKeys={excludeId ? ['id'] : []}
                  />
                </>
              ) : (
                <StringControl value={item} multiline={keyName === 'body'} onChange={(v) => onUpdate([...path, i], v)} />
              )}
            </div>
            <button type="button" onClick={() => removeItem(i)} className={removeButtonClass} title={`Remove ${label.replace(/s$/, '')}`}>
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={addItem} className={addButtonClass}>
        + Add {label.replace(/s$/, '')}
      </button>
    </div>
  );
};
