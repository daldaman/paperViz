/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Immutable nested-path updater, replacing the old flat
 * `updatePaperField(key, value)` now that customizer edits target arbitrary
 * paths inside the nested PaperContent tree (e.g. sections[4].quote.author,
 * figures[2].props.series[1].values.d5).
 */

export type PathSegment = string | number;

export function updateAtPath<T>(obj: T, path: PathSegment[], value: unknown): T {
  if (path.length === 0) {
    return value as T;
  }

  const [key, ...rest] = path;

  if (Array.isArray(obj)) {
    const index = key as number;
    const next = obj.slice();
    next[index] = updateAtPath(obj[index], rest, value);
    return next as unknown as T;
  }

  const record = (obj ?? {}) as Record<string, unknown>;
  return {
    ...record,
    [key]: updateAtPath(record[key as string], rest, value),
  } as unknown as T;
}
