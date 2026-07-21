/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Publication-grade event-study / local-projections chart. New in Phase 4 —
 * registered as 'event-study-explorer' in src/figures/registry.ts.
 *
 * Dataviz-skill decisions specific to this chart (see Phase 4 report for the
 * full rationale):
 *  - This is a single series (one coefficient path), so no legend box is
 *    drawn — the figure title/y-axis label already say what is plotted
 *    (marks-and-anatomy.md: "a single series needs no legend box").
 *  - "Above/below a baseline" is normally a diverging (two-hue) color job,
 *    but this project has exactly one themeable accent — so polarity is
 *    read from POSITION relative to the dashed zero line, not from a second
 *    hue. The CI band is the accent at low opacity (a wash, never a
 *    saturated block, per marks-and-anatomy.md).
 *  - The reference period is a *shape* distinction (hollow vs filled
 *    marker), not a color distinction — composite/secondary encoding is the
 *    right tool when a palette has only one hue to spend.
 *  - Every point's hit target is a transparent circle well past the visible
 *    marker radius (interaction.md's ~24px minimum hit target), reachable
 *    by both pointer and keyboard focus, and the tooltip only ever
 *    *supplements* the axis (nothing here is tooltip-only data).
 *  - Zero line is dashed to read as a *threshold*, not a gridline — the y
 *    gridlines themselves are solid hairlines per marks-and-anatomy.md
 *    (anti-patterns.md's "no dashed gridlines" rule is about the decorative
 *    grid, not a semantic reference line).
 */
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { z } from 'zod';

export const EventStudyPointSchema = z.object({
  t: z.number().describe('Event time (e.g. years/quarters relative to treatment; 0 or -1 is typically the reference period)'),
  label: z.string().optional().describe('Optional tick label override (defaults to "t")'),
  coef: z.number().describe('Point estimate'),
  lo: z.number().describe('Lower bound of the confidence interval'),
  hi: z.number().describe('Upper bound of the confidence interval'),
  isReference: z.boolean().optional().describe('Marks the omitted reference period — rendered as a hollow marker pinned at 0'),
});

export const EventStudyExplorerPropsSchema = z.object({
  xLabel: z.string().optional().describe('X-axis label (e.g. "Event time (years)")'),
  yLabel: z.string().min(1).describe('Y-axis label (e.g. "Coefficient")'),
  referenceLabel: z.string().optional().describe('Override text for the reference-period annotation'),
  unit: z.string().optional().describe('Unit suffix for values (e.g. "pp", "%")'),
  points: z.array(EventStudyPointSchema).min(1).describe('Leads/lags coefficients with confidence intervals, ordered by t'),
  note: z.string().optional().describe('Footnote rendered under the chart (e.g. data caveats)'),
});

export type EventStudyPoint = z.infer<typeof EventStudyPointSchema>;

interface EventStudyExplorerProps {
  title?: string;
  description?: string;
  xLabel?: string;
  yLabel: string;
  referenceLabel?: string;
  unit?: string;
  points: EventStudyPoint[];
  note?: string;
}

const WIDTH = 640;
const HEIGHT = 360;
const MARGIN = { top: 20, right: 24, bottom: 46, left: 56 };
const PLOT_W = WIDTH - MARGIN.left - MARGIN.right;
const PLOT_H = HEIGHT - MARGIN.top - MARGIN.bottom;
const MARKER_R = 5;
const HIT_R = 14;

function niceTicks(min: number, max: number, targetCount = 4): number[] {
  if (min === max) {
    return [min - 1, min, min + 1];
  }
  const range = max - min;
  const rawStep = range / targetCount;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const normalized = rawStep / magnitude;
  let step: number;
  if (normalized < 1.5) step = magnitude;
  else if (normalized < 3) step = 2 * magnitude;
  else if (normalized < 7) step = 5 * magnitude;
  else step = 10 * magnitude;

  const niceMin = Math.floor(min / step) * step;
  const niceMax = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = niceMin; v <= niceMax + step * 0.5; v += step) {
    ticks.push(Math.round(v / step) * step);
  }
  return ticks;
}

function formatNumber(v: number): string {
  const rounded = Math.round(v * 1000) / 1000;
  return Object.is(rounded, -0) ? '0' : rounded.toString();
}

function formatValue(v: number, unit?: string): string {
  const num = v.toFixed(2);
  if (!unit) return num;
  return unit === '%' ? `${num}%` : `${num} ${unit}`;
}

export const EventStudyExplorer: React.FC<EventStudyExplorerProps> = ({
  title,
  description,
  xLabel,
  yLabel,
  referenceLabel,
  unit,
  points,
  note,
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const sortedPoints = useMemo(() => [...(points ?? [])].sort((a, b) => a.t - b.t), [points]);

  const layout = useMemo(() => {
    if (sortedPoints.length === 0) return null;

    const tValues = sortedPoints.map((p) => p.t);
    const tMin = Math.min(...tValues);
    const tMax = Math.max(...tValues);
    const tSpan = tMax - tMin || 1;

    const loValues = sortedPoints.map((p) => p.lo);
    const hiValues = sortedPoints.map((p) => p.hi);
    const rawMin = Math.min(0, ...loValues);
    const rawMax = Math.max(0, ...hiValues);
    const pad = (rawMax - rawMin || 1) * 0.15;
    const domainMin = rawMin - pad;
    const domainMax = rawMax + pad;
    const domainSpan = domainMax - domainMin || 1;

    const xScale = (t: number) => ((t - tMin) / tSpan) * PLOT_W;
    const yScale = (v: number) => PLOT_H - ((v - domainMin) / domainSpan) * PLOT_H;

    const pixelPoints = sortedPoints.map((p) => ({
      ...p,
      x: xScale(p.t),
      yCoef: p.isReference ? yScale(0) : yScale(p.coef),
      yLo: yScale(p.lo),
      yHi: yScale(p.hi),
    }));

    const linePath = pixelPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.yCoef}`).join(' ');
    const bandPath =
      pixelPoints.length > 1
        ? [
            ...pixelPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.yHi}`),
            ...[...pixelPoints].reverse().map((p) => `L ${p.x} ${p.yLo}`),
            'Z',
          ].join(' ')
        : '';

    const yTicks = niceTicks(domainMin + pad, domainMax - pad, 4).map((t) => ({
      value: t,
      y: yScale(t),
    }));
    const yZero = yScale(0);

    return { pixelPoints, linePath, bandPath, yTicks, yZero };
  }, [sortedPoints]);

  if (!layout) return null;

  const { pixelPoints, linePath, bandPath, yTicks, yZero } = layout;
  const active = activeIndex != null ? pixelPoints[activeIndex] : null;
  const yAxisLabel = unit ? `${yLabel} (${unit})` : yLabel;

  return (
    <div className="p-6 md:p-8 bg-theme-card rounded-xl border border-theme-border my-8">
      {title && <h3 className="font-serif text-xl mb-1 text-theme-main">{title}</h3>}
      {description && <p className="text-sm text-theme-muted mb-5 leading-relaxed">{description}</p>}

      <div className="relative w-full" style={{ minHeight: 320 }}>
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-auto"
          style={{ minHeight: 320 }}
          role="img"
          aria-label={title ? `${title} event-study chart` : 'Event-study chart'}
        >
          <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
            {/* Y gridlines + tick labels */}
            {yTicks.map(({ value, y }) => (
              <g key={`ytick-${value}`}>
                <line x1={0} x2={PLOT_W} y1={y} y2={y} className="stroke-theme-border" strokeWidth={1} opacity={0.6} />
                <text x={-10} y={y} textAnchor="end" dominantBaseline="middle" className="fill-theme-muted" fontSize={11}>
                  {formatNumber(value)}
                </text>
              </g>
            ))}

            {/* Zero threshold line (dashed — a reference, not a gridline) */}
            <line
              x1={0}
              x2={PLOT_W}
              y1={yZero}
              y2={yZero}
              className="stroke-theme-muted"
              strokeWidth={1.25}
              strokeDasharray="5 4"
            />

            {/* X axis line */}
            <line x1={0} x2={PLOT_W} y1={PLOT_H} y2={PLOT_H} className="stroke-theme-border" strokeWidth={1} />

            {/* X ticks + labels */}
            {pixelPoints.map((p) => (
              <g key={`xtick-${p.t}`}>
                <line x1={p.x} x2={p.x} y1={PLOT_H} y2={PLOT_H + 5} className="stroke-theme-border" strokeWidth={1} />
                <text x={p.x} y={PLOT_H + 19} textAnchor="middle" className="fill-theme-muted" fontSize={11}>
                  {p.label ?? formatNumber(p.t)}
                </text>
              </g>
            ))}

            {/* CI band */}
            <motion.path
              d={bandPath}
              className="fill-theme-accent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.14 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            />

            {/* Coefficient line */}
            <motion.path
              d={linePath}
              fill="none"
              className="stroke-theme-accent"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: 'easeInOut' }}
            />

            {/* Hover guide line */}
            {active && (
              <line
                x1={active.x}
                x2={active.x}
                y1={0}
                y2={PLOT_H}
                className="stroke-theme-muted"
                strokeWidth={1}
                strokeDasharray="3 3"
                opacity={0.5}
              />
            )}

            {/* Points */}
            {pixelPoints.map((p, i) => {
              const isRef = Boolean(p.isReference);
              return (
                <g
                  key={`pt-${p.t}-${i}`}
                  tabIndex={0}
                  role="img"
                  aria-label={`${p.label ?? `t = ${formatNumber(p.t)}`}: ${formatValue(p.coef, unit)}, 95% CI [${formatValue(p.lo, unit)}, ${formatValue(p.hi, unit)}]${isRef ? ' (reference period)' : ''}`}
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseLeave={() => setActiveIndex((cur) => (cur === i ? null : cur))}
                  onFocus={() => setActiveIndex(i)}
                  onBlur={() => setActiveIndex((cur) => (cur === i ? null : cur))}
                  style={{ cursor: 'pointer', outline: 'none' }}
                >
                  <circle cx={p.x} cy={p.yCoef} r={HIT_R} fill="transparent" />
                  <motion.circle
                    cx={p.x}
                    cy={p.yCoef}
                    initial={{ r: 0, opacity: 0 }}
                    animate={{ r: activeIndex === i ? MARKER_R + 2 : MARKER_R, opacity: 1 }}
                    transition={{ delay: 0.8 + i * 0.03, type: 'spring', stiffness: 320, damping: 20 }}
                    className={isRef ? 'fill-theme-card stroke-theme-accent' : 'fill-theme-accent stroke-theme-card'}
                    strokeWidth={2}
                  />
                  {isRef && (
                    <text
                      x={p.x}
                      y={p.yCoef - MARKER_R - 8}
                      textAnchor="middle"
                      className="fill-theme-muted"
                      fontSize={10}
                      fontStyle="italic"
                    >
                      {referenceLabel ?? p.label ?? `t = ${formatNumber(p.t)}`} (ref.)
                    </text>
                  )}
                </g>
              );
            })}

            {/* Axis labels */}
            {xLabel && (
              <text
                x={PLOT_W / 2}
                y={PLOT_H + 38}
                textAnchor="middle"
                className="fill-theme-muted"
                fontSize={11}
                fontWeight={600}
                letterSpacing={0.4}
              >
                {xLabel.toUpperCase()}
              </text>
            )}
            <text
              x={-PLOT_H / 2}
              y={-42}
              transform="rotate(-90)"
              textAnchor="middle"
              className="fill-theme-muted"
              fontSize={11}
              fontWeight={600}
              letterSpacing={0.4}
            >
              {yAxisLabel.toUpperCase()}
            </text>
          </g>
        </svg>

        {active && (
          <div
            className="absolute pointer-events-none bg-theme-bg border border-theme-border rounded-lg shadow-lg px-3 py-2 text-xs z-10"
            style={{
              left: `${((active.x + MARGIN.left) / WIDTH) * 100}%`,
              top: `${((active.yCoef + MARGIN.top) / HEIGHT) * 100}%`,
              transform: 'translate(-50%, -120%)',
              minWidth: 140,
            }}
          >
            <div className="font-bold text-theme-main mb-0.5">
              {active.label ?? `t = ${formatNumber(active.t)}`}
              {active.isReference && <span className="text-theme-muted font-normal italic"> (ref.)</span>}
            </div>
            <div className="text-theme-accent font-semibold font-mono">{formatValue(active.coef, unit)}</div>
            <div className="text-theme-muted font-mono">
              [{formatValue(active.lo, unit)}, {formatValue(active.hi, unit)}]
            </div>
          </div>
        )}
      </div>

      {note && <p className="mt-4 text-xs text-theme-muted italic text-center">{note}</p>}

      {/*
       * Table-view twin — dataviz skill (components.md, Tier 0): "the
       * table-view toggle (the accessibility twin of every chart)". Every
       * value the tooltip shows is reachable here without hovering/focusing
       * a point, and it's the WCAG-clean fallback to color/position-only
       * reading of the CI band.
       */}
      <details className="mt-5 group">
        <summary className="cursor-pointer text-xs font-semibold text-theme-muted hover:text-theme-main transition-colors select-none list-none flex items-center gap-1.5 w-fit">
          <span className="inline-block transition-transform group-open:rotate-90" aria-hidden="true">▸</span>
          View data as table
        </summary>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <caption className="sr-only">{title ? `${title} — tabular data` : 'Event-study coefficients — tabular data'}</caption>
            <thead>
              <tr className="border-b border-theme-border text-theme-muted">
                <th scope="col" className="text-left font-semibold py-1.5 pr-3">{xLabel ?? 'Period'}</th>
                <th scope="col" className="text-right font-semibold py-1.5 px-3">Coefficient{unit ? ` (${unit})` : ''}</th>
                <th scope="col" className="text-right font-semibold py-1.5 pl-3">95% CI</th>
              </tr>
            </thead>
            <tbody>
              {sortedPoints.map((p, i) => (
                <tr key={`row-${p.t}-${i}`} className="border-b border-theme-border/50 text-theme-body">
                  <td className="text-left py-1.5 pr-3">
                    {p.label ?? formatNumber(p.t)}
                    {p.isReference && <span className="text-theme-muted italic"> (ref.)</span>}
                  </td>
                  <td className="text-right py-1.5 px-3 font-mono">{formatValue(p.coef, unit)}</td>
                  <td className="text-right py-1.5 pl-3 font-mono text-theme-muted">
                    [{formatValue(p.lo, unit)}, {formatValue(p.hi, unit)}]
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
};
