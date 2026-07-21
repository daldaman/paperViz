/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Renders a ConceptMapSpec (src/content/schema.ts) as a column-based
 * node/edge diagram. New in Phase 4 — registered for figure kind 'diagram'
 * in src/figures/registry.ts.
 *
 * Dataviz-skill decisions specific to this diagram (see Phase 4 report for
 * the full rationale):
 *  - Node `type` (driver/mechanism/outcome/moderator/neutral) is a
 *    *categorical* distinction, but this project has exactly one themeable
 *    accent — so identity is carried by fill/border weight/dash/size
 *    (composite encoding), never by a second hue, and stays legible with
 *    zero color vision at all.
 *  - Edge `sign` is the same problem in miniature: positive reads as the
 *    accent (the "primary" relationship, matching how accent is used
 *    elsewhere on the site), negative reads as a receded muted tone PLUS an
 *    always-on "⊖" chip (icon + label, never color alone — the same rule
 *    the skill applies to status colors) and a hollow arrowhead, neutral is
 *    the most recessive treatment. `style: 'dashed'` is a fully separate,
 *    author-controlled channel (e.g. "this moderating link is more
 *    tentative") — it is never overloaded to also carry sign, since a
 *    dashed + negative edge needs its own differentiator too.
 *  - A legend is always shown for both categorical channels (node type,
 *    edge sign) — never make the reader decode a 5-way/3-way visual
 *    encoding from memory.
 *  - Node labels render in a foreignObject <div> (ordinary HTML block flow)
 *    rather than manual SVG tspan wrapping, so long labels like "Cost
 *    Efficiency ↑ (delayed ~1yr)" wrap the same way any HTML text does.
 */
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { ConceptMapSpec, ConceptNode, ConceptEdge } from '../content/schema';

interface ConceptMapDiagramProps {
  title?: string;
  description?: string;
  spec: ConceptMapSpec;
}

type NodeType = ConceptNode['type'];
type EdgeSign = ConceptEdge['sign'];

const NODE_W = 176;
const NODE_H = 76;
const NODE_W_SMALL = 148;
const NODE_H_SMALL = 60;
const COL_PITCH = NODE_W + 88;
const ROW_PITCH = NODE_H + 32;
const MARGIN = 28;

// --- Literal lookup tables (never derive class names from JSON values —
// Tailwind's scanner cannot see a `` `border-${x}` `` string). ---------------
const NODE_STYLE: Record<NodeType, { box: string; text: string; small: boolean }> = {
  driver: { box: 'bg-theme-accent border-theme-accent border-2', text: 'text-white font-semibold text-[13px]', small: false },
  mechanism: { box: 'bg-theme-accent-muted border-theme-accent border-[1.5px]', text: 'text-theme-main font-medium text-[13px]', small: false },
  outcome: { box: 'bg-theme-card border-theme-main border-[2.5px]', text: 'text-theme-main font-semibold text-[13px]', small: false },
  moderator: { box: 'bg-theme-card border-theme-border border-dashed border-[1.5px]', text: 'text-theme-muted font-medium text-[11px]', small: true },
  neutral: { box: 'bg-theme-card border-theme-border border', text: 'text-theme-body text-[13px]', small: false },
};

const NODE_TYPE_ORDER: NodeType[] = ['driver', 'mechanism', 'outcome', 'moderator', 'neutral'];
const NODE_TYPE_LEGEND_LABEL: Record<NodeType, string> = {
  driver: 'Driver',
  mechanism: 'Mechanism',
  outcome: 'Outcome',
  moderator: 'Moderator',
  neutral: 'Neutral',
};

// Chip backgrounds are deliberately OPAQUE (bg-theme-card): a chip sits on
// top of line work, and a translucent background lets edges bleed through
// the label text — the exact legibility bug this table once had.
const EDGE_STYLE: Record<EdgeSign, { stroke: string; markerId: string; chipClass: string; alwaysChip: boolean; icon: string }> = {
  positive: { stroke: 'stroke-theme-accent', markerId: 'cm-arrow-positive', chipClass: 'bg-theme-card border-theme-accent/50 text-theme-accent', alwaysChip: false, icon: '' },
  negative: { stroke: 'stroke-theme-muted', markerId: 'cm-arrow-negative', chipClass: 'bg-theme-card border-theme-muted text-theme-muted', alwaysChip: true, icon: '⊖ ' }, // ⊖
  neutral: { stroke: 'stroke-theme-border', markerId: 'cm-arrow-neutral', chipClass: 'bg-theme-card border-theme-border text-theme-muted', alwaysChip: false, icon: '' },
};

// --- Edge-label (chip) placement ---------------------------------------
//
// Chips are placed ON their own Bézier curve (not at the straight-line
// midpoint, which drifts off the curve for diagonal edges), then nudged by a
// small deterministic candidate search so they avoid node boxes and chips
// placed before them. Candidates: a few positions along the curve × a
// perpendicular offset; scored by rectangle overlaps with a mild penalty for
// straying from the canonical on-curve midpoint.

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

function rectsOverlap(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function cubicPoint(t: number, p0: number, p1: number, p2: number, p3: number): number {
  const u = 1 - t;
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
}

function cubicTangent(t: number, p0: number, p1: number, p2: number, p3: number): number {
  const u = 1 - t;
  return 3 * u * u * (p1 - p0) + 6 * u * t * (p2 - p1) + 3 * t * t * (p3 - p2);
}

const CHIP_T_CANDIDATES = [0.5, 0.4, 0.6, 0.3, 0.7, 0.22, 0.78];
const CHIP_NORMAL_OFFSETS = [0, -16, 16, -26, 26];
// A single-line chip wider than this wraps to two lines — column corridors
// are only ~88px wide, so a long label can never fit between nodes on one line.
const CHIP_WRAP_THRESHOLD = 120;

/** Rough text width at the chip's 9px semibold font + padding + border. */
function estimateChipWidth(text: string): number {
  return Math.ceil(text.length * 5.4) + 20;
}

/** Chip box dimensions, wrapping long labels onto two lines. */
function chipDims(text: string): { w: number; h: number; wrap: boolean } {
  const w1 = estimateChipWidth(text);
  if (w1 <= CHIP_WRAP_THRESHOLD) return { w: w1, h: 18, wrap: false };
  return { w: Math.max(84, Math.ceil(w1 * 0.6)), h: 30, wrap: true };
}

function placeChip(
  bezier: { sx: number; sy: number; c1x: number; c1y: number; c2x: number; c2y: number; tx: number; ty: number },
  chipW: number,
  chipH: number,
  obstacles: Rect[],
  bounds: { width: number; height: number },
): Rect {
  const { sx, sy, c1x, c1y, c2x, c2y, tx, ty } = bezier;
  let best: Rect | null = null;
  let bestScore = Infinity;

  for (const t of CHIP_T_CANDIDATES) {
    const px = cubicPoint(t, sx, c1x, c2x, tx);
    const py = cubicPoint(t, sy, c1y, c2y, ty);
    const dxT = cubicTangent(t, sx, c1x, c2x, tx);
    const dyT = cubicTangent(t, sy, c1y, c2y, ty);
    const len = Math.hypot(dxT, dyT) || 1;
    const nx = -dyT / len;
    const ny = dxT / len;

    for (const off of CHIP_NORMAL_OFFSETS) {
      const cx = px + nx * off;
      const cy = py + ny * off;
      const rect: Rect = { x: cx - chipW / 2, y: cy - chipH / 2, w: chipW, h: chipH };

      let score = 0;
      for (const ob of obstacles) {
        if (rectsOverlap(rect, ob)) score += 10;
      }
      // Stay inside the drawing.
      if (rect.x < 2 || rect.y < 2 || rect.x + rect.w > bounds.width - 2 || rect.y + rect.h > bounds.height - 2) score += 6;
      // Prefer the canonical on-curve midpoint.
      score += Math.abs(t - 0.5) * 2 + Math.abs(off) * 0.05;

      if (score < bestScore) {
        bestScore = score;
        best = rect;
        if (score === 0) return rect;
      }
    }
  }
  return best!;
}

// --- Column/row layout -------------------------------------------------

function computeColumns(nodes: ConceptNode[], edges: ConceptEdge[]): Map<string, number> {
  const preds = new Map<string, string[]>();
  nodes.forEach((n) => preds.set(n.id, []));
  edges.forEach((e) => {
    if (preds.has(e.to) && preds.has(e.from)) preds.get(e.to)!.push(e.from);
  });

  const resolved = new Map<string, number>();
  nodes.forEach((n) => {
    if (n.column != null) resolved.set(n.id, n.column);
  });

  const visiting = new Set<string>();
  function resolve(id: string): number {
    if (resolved.has(id)) return resolved.get(id)!;
    if (visiting.has(id)) return 0; // cycle guard
    visiting.add(id);
    const ps = preds.get(id) ?? [];
    const col = ps.length === 0 ? 0 : 1 + Math.max(...ps.map(resolve));
    visiting.delete(id);
    resolved.set(id, col);
    return col;
  }
  nodes.forEach((n) => resolve(n.id));
  return resolved;
}

interface LaidOutNode extends ConceptNode {
  x: number;
  y: number;
  w: number;
  h: number;
  column: number;
}

function layoutNodes(nodes: ConceptNode[], edges: ConceptEdge[]) {
  const columns = computeColumns(nodes, edges);
  const byColumn = new Map<number, ConceptNode[]>();
  nodes.forEach((n) => {
    const col = columns.get(n.id) ?? 0;
    if (!byColumn.has(col)) byColumn.set(col, []);
    byColumn.get(col)!.push(n);
  });

  const laidOut: LaidOutNode[] = [];
  let maxRows = 1;

  byColumn.forEach((colNodes) => {
    const ordered = [...colNodes].sort((a, b) => (a.row ?? 0) - (b.row ?? 0) || 0);
    maxRows = Math.max(maxRows, ordered.length);
  });

  byColumn.forEach((colNodes, col) => {
    const hasExplicitRow = colNodes.some((n) => n.row != null);
    const ordered = hasExplicitRow
      ? [...colNodes].sort((a, b) => (a.row ?? 0) - (b.row ?? 0))
      : colNodes;

    ordered.forEach((n, rowIndex) => {
      const style = NODE_STYLE[n.type];
      const w = style.small ? NODE_W_SMALL : NODE_W;
      const h = style.small ? NODE_H_SMALL : NODE_H;
      const rowSlotY = MARGIN + rowIndex * ROW_PITCH;
      laidOut.push({
        ...n,
        column: col,
        x: MARGIN + col * COL_PITCH + (NODE_W - w) / 2,
        y: rowSlotY + (NODE_H - h) / 2,
        w,
        h,
      });
    });
  });

  const maxColumn = Math.max(0, ...Array.from(byColumn.keys()));
  const width = MARGIN * 2 + (maxColumn + 1) * COL_PITCH - (COL_PITCH - NODE_W);
  const height = MARGIN * 2 + maxRows * ROW_PITCH - (ROW_PITCH - NODE_H);

  return { nodes: laidOut, width, height };
}

function anchorPoints(source: LaidOutNode, target: LaidOutNode) {
  if (source.column === target.column) {
    // Same-column relationship (rare): connect bottom-to-top.
    const sx = source.x + source.w / 2;
    const sy = source.y + source.h;
    const tx = target.x + target.w / 2;
    const ty = target.y;
    return { sx, sy, tx, ty };
  }
  const sx = source.x + source.w;
  const sy = source.y + source.h / 2;
  const tx = target.x;
  const ty = target.y + target.h / 2;
  return { sx, sy, tx, ty };
}

export const ConceptMapDiagram: React.FC<ConceptMapDiagramProps> = ({ title, description, spec }) => {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const { nodes, edges } = spec;

  const { nodes: laidOutNodes, width, height } = useMemo(() => layoutNodes(nodes, edges), [nodes, edges]);

  const nodeById = useMemo(() => new Map(laidOutNodes.map((n) => [n.id, n])), [laidOutNodes]);

  const validEdges = useMemo(
    () =>
      edges.filter((e) => {
        const ok = nodeById.has(e.from) && nodeById.has(e.to);
        if (!ok) {
          console.error(`[paperViz] ConceptMapDiagram: edge "${e.id}" references an unknown node ("${e.from}" -> "${e.to}") — skipping.`);
        }
        return ok;
      }),
    [edges, nodeById],
  );

  const hoveredNode = hoveredNodeId ? nodeById.get(hoveredNodeId) : undefined;

  // Chip placement runs over edges in render order: node boxes (slightly
  // inflated) are obstacles, and each placed chip becomes an obstacle for
  // the chips after it — so two labels in the same corridor spread apart
  // instead of stacking.
  const chipRectByEdgeId = useMemo(() => {
    const obstacles: Rect[] = laidOutNodes.map((n) => ({ x: n.x - 4, y: n.y - 4, w: n.w + 8, h: n.h + 8 }));
    const rects = new Map<string, Rect & { wrap: boolean }>();
    validEdges.forEach((edge) => {
      const source = nodeById.get(edge.from)!;
      const target = nodeById.get(edge.to)!;
      const { sx, sy, tx, ty } = anchorPoints(source, target);
      const dx = (tx - sx) * 0.5;
      const style = EDGE_STYLE[edge.sign];
      const showChip = style.alwaysChip || Boolean(edge.label);
      if (!showChip) return;
      const chipText = edge.label ? `${style.icon}${edge.label}` : style.icon.trim();
      const dims = chipDims(chipText);
      const rect = placeChip(
        { sx, sy, c1x: sx + dx, c1y: sy, c2x: tx - dx, c2y: ty, tx, ty },
        dims.w,
        dims.h,
        obstacles,
        { width, height },
      );
      obstacles.push(rect);
      rects.set(edge.id, { ...rect, wrap: dims.wrap });
    });
    return rects;
  }, [validEdges, nodeById, laidOutNodes, width, height]);

  return (
    <div className="p-6 md:p-8 bg-theme-card rounded-xl border border-theme-border my-8">
      {title && <h3 className="font-serif text-xl mb-1 text-theme-main">{title}</h3>}
      {description && <p className="text-sm text-theme-muted mb-5 leading-relaxed">{description}</p>}

      {/*
       * Shrink-to-fit is the default (viewBox scaling handles it, including
       * the foreignObject text) — the min-width floor only kicks in overflow
       * scroll once the diagram would otherwise get uncomfortably small
       * (narrow figure-left card slots, small phones), not at this
       * diagram's full natural width.
       */}
      <div className="w-full overflow-x-auto">
        <div style={{ minWidth: Math.min(width, 420) }} className="relative">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            width="100%"
            height={height}
            style={{ maxWidth: '100%' }}
            role="img"
            aria-label={title ? `${title} concept map` : 'Concept map'}
          >
            <defs>
              <marker id="cm-arrow-positive" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 Z" className="fill-theme-accent" />
              </marker>
              <marker id="cm-arrow-negative" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M1,1.5 L9,5 L1,8.5 Z" fill="none" className="stroke-theme-muted" strokeWidth={1.4} strokeLinejoin="round" />
              </marker>
              <marker id="cm-arrow-neutral" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 Z" className="fill-theme-border" />
              </marker>
            </defs>

            {/* Edges */}
            {validEdges.map((edge, i) => {
              const source = nodeById.get(edge.from)!;
              const target = nodeById.get(edge.to)!;
              const { sx, sy, tx, ty } = anchorPoints(source, target);
              const dx = (tx - sx) * 0.5;
              const path = `M ${sx} ${sy} C ${sx + dx} ${sy}, ${tx - dx} ${ty}, ${tx} ${ty}`;
              const style = EDGE_STYLE[edge.sign];
              const chipRect = chipRectByEdgeId.get(edge.id);
              const chipText = edge.label ? `${style.icon}${edge.label}` : style.icon.trim();

              return (
                <g key={edge.id}>
                  <motion.path
                    d={path}
                    fill="none"
                    className={style.stroke}
                    strokeWidth={1.75}
                    strokeDasharray={edge.style === 'dashed' ? '6 4' : undefined}
                    markerEnd={`url(#${style.markerId})`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 + laidOutNodes.length * 0.05 + i * 0.06, duration: 0.4 }}
                  />
                  {chipRect && (
                    <foreignObject x={chipRect.x} y={chipRect.y} width={chipRect.w} height={chipRect.h} style={{ overflow: 'visible' }}>
                      <motion.div
                        className="w-full h-full flex items-center justify-center pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.45 + laidOutNodes.length * 0.05 + i * 0.06, duration: 0.3 }}
                      >
                        <span
                          className={`px-2 py-0.5 border text-[9px] font-semibold shadow-xs ${
                            chipRect.wrap ? 'rounded-lg leading-tight text-center' : 'rounded-full leading-none whitespace-nowrap'
                          } ${style.chipClass}`}
                        >
                          {chipText}
                        </span>
                      </motion.div>
                    </foreignObject>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {laidOutNodes.map((node, i) => {
              const style = NODE_STYLE[node.type];
              return (
                <foreignObject key={node.id} x={node.x} y={node.y} width={node.w} height={node.h} style={{ overflow: 'visible' }}>
                  <motion.div
                    className="w-full h-full"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07, duration: 0.4, ease: 'easeOut' }}
                  >
                    <div
                      className={`w-full h-full rounded-lg flex items-center justify-center text-center px-3 py-2 leading-snug transition-shadow ${style.box}`}
                      tabIndex={node.note ? 0 : undefined}
                      role={node.note ? 'button' : undefined}
                      aria-label={node.note ? `${node.label}: ${node.note}` : undefined}
                      onMouseEnter={() => node.note && setHoveredNodeId(node.id)}
                      onMouseLeave={() => setHoveredNodeId((cur) => (cur === node.id ? null : cur))}
                      onFocus={() => node.note && setHoveredNodeId(node.id)}
                      onBlur={() => setHoveredNodeId((cur) => (cur === node.id ? null : cur))}
                      style={{ outline: 'none', cursor: node.note ? 'help' : 'default' }}
                    >
                      <span className={style.text}>
                        {node.label}
                        {node.note && <span className="ml-1 opacity-60">*</span>}
                      </span>
                    </div>
                  </motion.div>
                </foreignObject>
              );
            })}
          </svg>

          {hoveredNode?.note && (
            <div
              className="absolute pointer-events-none bg-theme-bg border border-theme-border rounded-lg shadow-lg px-3 py-2 text-xs text-theme-body max-w-[220px] z-10"
              style={{
                left: `${((hoveredNode.x + hoveredNode.w / 2) / width) * 100}%`,
                top: `${(hoveredNode.y / height) * 100}%`,
                transform: 'translate(-50%, -110%)',
              }}
            >
              {hoveredNode.note}
            </div>
          )}
        </div>
      </div>

      {/* Legend — never make the reader decode a multi-way visual encoding from memory */}
      <div className="mt-6 pt-4 border-t border-theme-border/60 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-theme-muted">
        {NODE_TYPE_ORDER.map((type) => (
          <span key={type} className="flex items-center gap-1.5">
            <span className={`inline-block w-3.5 h-3.5 rounded-sm ${NODE_STYLE[type].box}`} />
            {NODE_TYPE_LEGEND_LABEL[type]}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <svg width="18" height="10" viewBox="0 0 18 10" aria-hidden="true">
            <line x1="0" y1="5" x2="18" y2="5" className="stroke-theme-accent" strokeWidth={2} />
          </svg>
          Positive
        </span>
        <span className="flex items-center gap-1.5">
          <svg width="18" height="10" viewBox="0 0 18 10" aria-hidden="true">
            <line x1="0" y1="5" x2="18" y2="5" className="stroke-theme-muted" strokeWidth={2} />
          </svg>
          Negative (⊖)
        </span>
        <span className="flex items-center gap-1.5">
          <svg width="18" height="10" viewBox="0 0 18 10" aria-hidden="true">
            <line x1="0" y1="5" x2="18" y2="5" className="stroke-theme-border" strokeWidth={2} strokeDasharray="4 3" />
          </svg>
          Dashed = tentative link
        </span>
      </div>

      {/*
       * Table-view twin — dataviz skill (components.md, Tier 0): "the
       * table-view toggle (the accessibility twin of every chart)". A
       * screen-reader user gets the same node/edge information here as a
       * sighted reader gets from position + composite styling in the SVG.
       */}
      <details className="mt-4 group">
        <summary className="cursor-pointer text-xs font-semibold text-theme-muted hover:text-theme-main transition-colors select-none list-none flex items-center gap-1.5 w-fit">
          <span className="inline-block transition-transform group-open:rotate-90" aria-hidden="true">▸</span>
          View as table
        </summary>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <caption className="sr-only">Concept map nodes</caption>
              <thead>
                <tr className="border-b border-theme-border text-theme-muted">
                  <th scope="col" className="text-left font-semibold py-1.5 pr-3">Node</th>
                  <th scope="col" className="text-left font-semibold py-1.5 pl-3">Type</th>
                </tr>
              </thead>
              <tbody>
                {nodes.map((n) => (
                  <tr key={n.id} className="border-b border-theme-border/50 text-theme-body">
                    <td className="text-left py-1.5 pr-3">
                      {n.label}
                      {n.note && <span className="block text-theme-muted italic text-[10px]">{n.note}</span>}
                    </td>
                    <td className="text-left py-1.5 pl-3 text-theme-muted">{NODE_TYPE_LEGEND_LABEL[n.type]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <caption className="sr-only">Concept map relationships</caption>
              <thead>
                <tr className="border-b border-theme-border text-theme-muted">
                  <th scope="col" className="text-left font-semibold py-1.5 pr-3">From → to</th>
                  <th scope="col" className="text-left font-semibold py-1.5 pl-3">Sign</th>
                </tr>
              </thead>
              <tbody>
                {validEdges.map((e) => {
                  const from = nodeById.get(e.from);
                  const to = nodeById.get(e.to);
                  return (
                    <tr key={e.id} className="border-b border-theme-border/50 text-theme-body">
                      <td className="text-left py-1.5 pr-3">
                        {from?.label ?? e.from} → {to?.label ?? e.to}
                        {e.label && <span className="block text-theme-muted italic text-[10px]">{e.label}</span>}
                      </td>
                      <td className="text-left py-1.5 pl-3 text-theme-muted capitalize">
                        {e.sign}
                        {e.style === 'dashed' && ' (tentative)'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </details>
    </div>
  );
};
