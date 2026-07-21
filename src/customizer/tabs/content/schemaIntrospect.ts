/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Runtime zod-schema introspection for the generic ContentTab form. Nothing
 * here knows about any specific paper field — it only knows how to peel
 * ZodOptional/ZodDefault wrappers, read `.describe()` metadata, and build a
 * safe placeholder value for a schema (used for "+ Add item" templates).
 *
 * zod v4 note: `.refine()`/`.min()`/`.url()` etc. attach checks internally
 * and do NOT change the schema's class (verified against the installed
 * zod@4.4.3 at design time), so `instanceof z.ZodString` etc. still matches
 * fields like `StaticFigureSchema.src` that carry a `.refine()`. Only
 * `.optional()`/`.nullable()` (ZodOptional/ZodNullable, unwrap via
 * `.unwrap()`) and `.default()` (ZodDefault, unwrap via `.removeDefault()`)
 * wrap the schema in a different class.
 */
import { z } from 'zod';

export interface UnwrappedSchema {
  /** The innermost schema after peeling optional/nullable/default wrappers. */
  core: z.ZodType;
  /** First `.describe()` text found, outermost wrapper wins. */
  description?: string;
}

export function unwrapSchema(schema: z.ZodType): UnwrappedSchema {
  let current: z.ZodType = schema;
  let description: string | undefined = current.description;

  while (true) {
    if (current instanceof z.ZodOptional || current instanceof z.ZodNullable) {
      // `.unwrap()`'s declared return type defaults to zod's loose internal
      // `core.$ZodType`, not the classic `z.ZodType` this module works in —
      // both describe the same runtime object, so the cast is safe.
      current = current.unwrap() as z.ZodType;
    } else if (current instanceof z.ZodDefault) {
      current = current.removeDefault() as z.ZodType;
    } else {
      break;
    }
    if (description === undefined) description = current.description;
  }

  return { core: current, description };
}

/** "publishDate" -> "Publish Date", "inNav" -> "In Nav". Fallback label when a field has no `.describe()`. */
export function prettifyKey(key: string): string {
  const spaced = key.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/**
 * Builds a minimal placeholder value for a schema — used as the "+ Add
 * item" template for generic arrays (meta.links, authors.list, and any
 * nested arrays like a concept-map's nodes[]/edges[]). Deliberately
 * produces empty/zero placeholders rather than schema-valid ones (e.g. an
 * empty string for a `.url()` field) — matches the plan's explicit
 * `{label:'',url:''}` / `{name:'',role:''}` templates. Sections and figures
 * use their own "minimal VALID" templates instead (SectionsGroup /
 * FiguresGroup) because those need working non-empty ids/titles/bodies to
 * render and navigate correctly the instant they're added.
 */
export function buildPlaceholderValue(schema: z.ZodType): unknown {
  const { core } = unwrapSchema(schema);

  if (core instanceof z.ZodString) return '';
  if (core instanceof z.ZodNumber) return 0;
  if (core instanceof z.ZodBoolean) return false;
  if (core instanceof z.ZodEnum) return core.options[0];
  if (core instanceof z.ZodLiteral) return core.value;
  if (core instanceof z.ZodArray) return [];
  if (core instanceof z.ZodRecord) return {};
  if (core instanceof z.ZodObject) {
    const shape = core.shape as Record<string, z.ZodType>;
    const obj: Record<string, unknown> = {};
    for (const [key, fieldSchema] of Object.entries(shape)) {
      obj[key] = buildPlaceholderValue(fieldSchema);
    }
    return obj;
  }
  return undefined;
}

/** True if an object schema has a plain string `id` field — our convention for "this is a referential key, don't offer it as an editable text field, show it read-only instead." */
export function hasEditableIdField(schema: z.ZodObject): boolean {
  const shape = schema.shape as Record<string, z.ZodType>;
  if (!('id' in shape)) return false;
  const { core } = unwrapSchema(shape.id);
  return core instanceof z.ZodString;
}
