/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Joins path segments onto Vite's configured base URL. Bare `/papers/...`
 * paths resolve fine in dev (base "/") but 404 once deployed under GitHub
 * Pages' subpath (base "/paperViz/", set in Phase 8) — every reference to a
 * public asset must go through this helper instead. See CLAUDE.md.
 */
export function withBase(...segments: string[]): string {
  const base = import.meta.env.BASE_URL ?? '/';
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const cleanSegments = segments
    .flatMap((segment) => segment.split('/'))
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);

  const joined = [cleanBase, ...cleanSegments].join('/');
  return joined.startsWith('/') ? joined : `/${joined}`;
}
