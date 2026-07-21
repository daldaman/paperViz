/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Diverging grouped bar chart for signed regression coefficients — new in
 * this pass, registered as 'coefficient-bar' in src/figures/registry.ts.
 * First real use: panel-regression tables where categories = outcome
 * variables (e.g. Cost/Revenue/Profit efficiency) and series = horizons
 * (e.g. 1q ahead / 4q ahead).
 *
 * Dataviz-skill decisions specific to this chart:
 *  - Form: "above/below a baseline" is a diverging job (choosing-a-form.md).
 *    Bars are drawn from a real zero baseline, not truncated at the domain
 *    min — the whole point is that some estimates are negative.
 *  - Color: the site exposes exactly one themeable accent (see
 *    src/theme/themes.ts) plus text-muted/border tokens — there is no 8-hue
 *    categorical ramp to spend (same constraint EventStudyExplorer notes).
 *    So series identity is a literal, index-keyed lookup (never a
 *    dynamically-built class name, per this repo's CLAUDE.md): series 1 =
 *    solid theme-accent fill; series 2 = muted fill + outline stroke;
 *    series 3 = a 45°-hatched pattern (the opt-in texture channel from
 *    marks-and-anatomy.md) + outline stroke. Capped at 3 series in the
 *    props schema because a 4th slot has no defined treatment — more
 *    series would need faceting, not a 4th visual trick.
 *  - Zero line is SOLID here (unlike EventStudyExplorer's dashed zero,
 *    which is only a reference threshold there). In this chart zero is the
 *    literal anchor every bar grows from, so it reads as an axis, not a
 *    threshold annotation — dashing it would misstate what it is.
 *  - Marks: bars are SVG <path>s (not <rect>) so only the *data end* (the
 *    end away from the baseline) gets the 4px rounded corners while the
 *    baseline end stays square, per marks-and-anatomy.md. Bar thickness is
 *    capped at 24px and never force-fills its slot.
 *  - Entrance: each bar's visible path is masked by a <clipPath> whose
 *    backing <motion.rect> animates y+height from a zero-height rect
 *    pinned at the baseline to the bar's full bounding box. Because both
 *    properties tween with the same easing/duration, the edge at the
 *    baseline stays pinned throughout (y(t)+height(t) is constant) — bars
 *    grow from the zero line without relying on SVG transform-origin,
 *    which has known cross-browser quirks for scale transforms.
 *  - Significance: conventional stars (p<0.01 ***, <0.05 **, <0.10 *)
 *    ride the value label; the exact p rides the tooltip — the star
 *    legend line is also always rendered as plain text so the encoding is
 *    self-documenting without hovering (nothing here is tooltip-only).
 *  - Tier 0: the same <details> table-view twin pattern as
 *    InteractiveGroupedBar/EventStudyExplorer, showing est (p) per
 *    category × series cell.
 */
import React, { useId, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { z } from 'zod';

export const CoefficientBarCategorySchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
});

export const CoefficientBarValueSchema = z.object({
  est: z.number().describe('Point estimate (may be negative)'),
  p: z.number().min(0).max(1).optional().describe('p-value, used for significance stars + tooltip'),
});

export const CoefficientBarSeriesSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  values: z.record(z.string(), CoefficientBarValueSchema).describe('Estimate (+ optional p-value) keyed by category id'),
});

export const CoefficientBarPropsSchema = z.object({
  metricLabel: z.string().optional().describe('Y-axis label (e.g. "Effect on efficiency percentile rank")'),
  note: z.string().optional().describe('Footnote rendered under the chart (e.g. specification/source note)'),
  categories: z.array(CoefficientBarCategorySchema).min(1).describe('X-axis groups (e.g. outcome variables)'),
  series: z
    .array(CoefficientBarSeriesSchema)
    .min(1)
    .max(3, 'coefficient-bar supports at most 3 series — the visual encoding (accent / muted-outline / hatch) has no 4th slot')
    .describe('Bar series within each group (e.g. horizons); max 3'),
});

export type CoefficientBarCategory = z.infer<typeof CoefficientBarCategorySchema>;
export type CoefficientBarSeriesValue = z.infer<typeof CoefficientBarValueSchema>;
export type CoefficientBarSeries = z.infer<typeof CoefficientBarSeriesSchema>;

interface CoefficientBarProps {
  title?: string;
  description?: string;
  metricLabel?: string;
  note?: string;
  categories: CoefficientBarCategory[];
  series: CoefficientBarSeries[];
}

const WIDTH = 640;
const HEIGHT = 400;
const MARGIN = { top: 32, right: 24, bottom: 44, left: 60 };
const PLOT_W = WIDTH - MARGIN.left - MARGIN.right;
const PLOT_H = HEIGHT - MARGIN.top - MARGIN.bottom;
const BAR_RADIUS = 4;
const MAX_BAR_WIDTH = 24;
const MIN_BAR_WIDTH = 8;
const BAR_GAP = 3;
const HATCH_SERIES_INDEX = 2;
const LABEL_BAR_GAP = 8;
const LABEL_ZERO_CLEARANCE = 16;
const LABEL_CHAR_WIDTH = 6.2; // approx monospace glyph advance at fontSize 10
const LABEL_PADDING = 6;

function niceTicks(min: number, max: number, targetCount = 4): number[] {
  if (min === max) return [min - 1, min, min + 1];
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

function formatTick(v: number): string {
  const rounded = Math.round(v * 1000) / 1000;
  return Object.is(rounded, -0) ? '0' : rounded.toString();
}

/** Signed, 3-decimal value label — e.g. "+0.101" / "−0.095" (typographic minus). */
function formatSigned(v: number): string {
  const rounded = Math.round(v * 1000) / 1000;
  const safe = Object.is(rounded, -0) ? 0 : rounded;
  if (safe > 0) return `+${safe.toFixed(3)}`;
  if (safe < 0) return `−${Math.abs(safe).toFixed(3)}`;
  return safe.toFixed(3);
}

function starsForP(p?: number): string {
  if (p == null) return '';
  if (p < 0.01) return '***';
  if (p < 0.05) return '**';
  if (p < 0.1) return '*';
  return '';
}

/** Rounded-at-data-end, square-at-baseline bar path (marks-and-anatomy.md). */
function barPath(x: number, width: number, yTop: number, yBottom: number, roundedEnd: 'top' | 'bottom'): string {
  const h = Math.max(0, yBottom - yTop);
  const r = Math.max(0, Math.min(BAR_RADIUS, width / 2, h));
  if (roundedEnd === 'top') {
    return `M ${x} ${yBottom} L ${x} ${yTop + r} Q ${x} ${yTop} ${x + r} ${yTop} L ${x + width - r} ${yTop} Q ${x + width} ${yTop} ${x + width} ${yTop + r} L ${x + width} ${yBottom} Z`;
  }
  return `M ${x} ${yTop} L ${x + width} ${yTop} L ${x + width} ${yBottom - r} Q ${x + width} ${yBottom} ${x + width - r} ${yBottom} L ${x + r} ${yBottom} Q ${x} ${yBottom} ${x} ${yBottom - r} Z`;
}

/** Literal, index-keyed series styling — never built from a data value. */
const SERIES_FILL_CLASS = ['fill-theme-accent', 'fill-theme-muted', undefined] as const;
const SERIES_FILL_OPACITY = [1, 0.32, 1] as const;
const SERIES_STROKE_CLASS = [undefined, 'stroke-theme-muted', 'stroke-theme-muted'] as const;
const SERIES_STROKE_WIDTH = [0, 1.5, 1.5] as const;

export const CoefficientBar: React.FC<CoefficientBarProps> = ({ title, description, metricLabel, note, categories, series }) => {
  const uid = useId().replace(/[:]/g, '');
  const safeCategories = categories ?? [];
  const safeSeries = (series ?? []).slice(0, 3);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const hasAnyP = useMemo(
    () => safeSeries.some((s) => safeCategories.some((c) => s.values?.[c.id]?.p != null)),
    [safeSeries, safeCategories],
  );

  const layout = useMemo(() => {
    if (safeCategories.length === 0 || safeSeries.length === 0) return null;

    const estimates = safeSeries.flatMap((s) =>
      safeCategories.map((c) => s.values?.[c.id]?.est).filter((v): v is number => typeof v === 'number'),
    );
    if (estimates.length === 0) return null;

    const rawMin = Math.min(0, ...estimates);
    const rawMax = Math.max(0, ...estimates);
    const span = rawMax - rawMin || 1;
    const pad = span * 0.15;
    const domainMin = rawMin - pad;
    const domainMax = rawMax + pad;
    const domainSpan = domainMax - domainMin || 1;

    const yScale = (v: number) => PLOT_H - ((v - domainMin) / domainSpan) * PLOT_H;
    const yZero = yScale(0);

    const catBandWidth = PLOT_W / safeCategories.length;
    const groupWidthBudget = catBandWidth * 0.82; // leave ~18% air between category groups
    const seriesCount = safeSeries.length;
    const rawBarWidth = (catBandWidth * 0.7 - (seriesCount - 1) * BAR_GAP) / seriesCount;
    const barWidth = Math.min(MAX_BAR_WIDTH, Math.max(MIN_BAR_WIDTH, rawBarWidth));

    // Value labels are centered on their own bar (text-anchor middle), so two
    // adjacent bars in a group need their CENTERS at least a label-width apart
    // or the labels overlap each other / spill onto the neighbor's bar — a
    // fixed BAR_GAP is fine for the bars themselves but not for the wider
    // text riding on top of them. Estimate the widest label actually in the
    // data and use that (clamped to the group's available width) as the
    // center-to-center spacing.
    const allLabelTexts = safeCategories.flatMap((cat) =>
      safeSeries.map((s) => {
        const cell = s.values?.[cat.id];
        return cell && typeof cell.est === 'number' ? `${formatSigned(cell.est)}${starsForP(cell.p)}` : '';
      }),
    );
    const maxLabelWidth = Math.max(0, ...allLabelTexts.map((t) => t.length * LABEL_CHAR_WIDTH + LABEL_PADDING));

    let centerSpacing = Math.max(barWidth + BAR_GAP, maxLabelWidth);
    if (seriesCount > 1) {
      const desiredGroupWidth = barWidth + (seriesCount - 1) * centerSpacing;
      if (desiredGroupWidth > groupWidthBudget) {
        centerSpacing = Math.max(barWidth + BAR_GAP, (groupWidthBudget - barWidth) / (seriesCount - 1));
      }
    }
    const actualGroupWidth = barWidth + (seriesCount - 1) * centerSpacing;

    const yTicks = niceTicks(domainMin + pad, domainMax - pad, 4).map((t) => ({ value: t, y: yScale(t) }));

    const bars = safeCategories.flatMap((cat, catIdx) => {
      const catCenterX = catIdx * catBandWidth + catBandWidth / 2;
      const groupStartX = catCenterX - actualGroupWidth / 2;

      return safeSeries.map((s, sIdx) => {
        const cell = s.values?.[cat.id];
        if (!cell || typeof cell.est !== 'number') return null;

        const x = groupStartX + sIdx * centerSpacing;
        const yEst = yScale(cell.est);
        const isPositive = cell.est >= 0;
        const yTop = Math.min(yZero, yEst);
        const yBottom = Math.max(yZero, yEst);
        const d = barPath(x, barWidth, yTop, yBottom, isPositive ? 'top' : 'bottom');
        const key = `${cat.id}::${s.id}`;
        const stars = starsForP(cell.p);

        return {
          key,
          catIdx,
          sIdx,
          catLabel: cat.label,
          seriesLabel: s.label,
          x,
          width: barWidth,
          yTop,
          yBottom,
          yZero,
          d,
          est: cell.est,
          p: cell.p,
          stars,
          isPositive,
          labelX: x + barWidth / 2,
          // Clear the bar end by LABEL_BAR_GAP *and* clear the zero baseline
          // by LABEL_ZERO_CLEARANCE — for a near-zero estimate the bar itself
          // is only a few px tall, so "just above the bar" alone would land
          // the label right on top of the solid zero line.
          labelY: isPositive
            ? Math.min(yTop - LABEL_BAR_GAP, yZero - LABEL_ZERO_CLEARANCE)
            : Math.max(yBottom + LABEL_BAR_GAP, yZero + LABEL_ZERO_CLEARANCE),
        };
      });
    });

    return { yTicks, yZero, bars: bars.filter((b): b is NonNullable<typeof b> => b != null), catBandWidth };
  }, [safeCategories, safeSeries]);

  if (!layout) return null;

  const { yTicks, yZero, bars, catBandWidth } = layout;
  const active = activeKey ? bars.find((b) => b.key === activeKey) ?? null : null;
  const yAxisLabel = metricLabel;

  return (
    <div className="p-6 md:p-8 bg-theme-card rounded-xl border border-theme-border my-8">
      {title && <h3 className="font-serif text-xl mb-1 text-theme-main">{title}</h3>}
      {description && <p className="text-sm text-theme-muted mb-4 leading-relaxed">{description}</p>}

      {/* Legend — chips, only when there is more than one series to identify (marks-and-anatomy.md). */}
      {safeSeries.length > 1 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-4">
          {safeSeries.map((s, i) => (
            <div key={s.id} className="flex items-center gap-1.5 text-xs text-theme-muted font-medium">
              <svg width={12} height={12} className="flex-shrink-0" aria-hidden="true">
                {i === HATCH_SERIES_INDEX ? (
                  <rect x={0} y={0} width={12} height={12} rx={2} fill={`url(#coefbar-hatch-${uid})`} className="stroke-theme-muted" strokeWidth={1.25} />
                ) : (
                  <rect
                    x={0}
                    y={0}
                    width={12}
                    height={12}
                    rx={2}
                    className={`${SERIES_FILL_CLASS[i] ?? 'fill-theme-muted'} ${SERIES_STROKE_CLASS[i] ?? ''}`.trim()}
                    fillOpacity={SERIES_FILL_OPACITY[i]}
                    strokeWidth={SERIES_STROKE_WIDTH[i]}
                  />
                )}
              </svg>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      )}

      <div className="relative w-full" style={{ minHeight: 360 }}>
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-auto"
          style={{ minHeight: 360 }}
          role="img"
          aria-label={title ? `${title} — diverging bar chart of signed coefficients` : 'Diverging bar chart of signed coefficients'}
        >
          <defs>
            {/* 45° hatch for the 3rd series slot — an opt-in texture channel (marks-and-anatomy.md), tone-on-tone against the card surface so it tracks theme changes automatically. */}
            <pattern id={`coefbar-hatch-${uid}`} width={6} height={6} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width={6} height={6} className="fill-theme-card" />
              <line x1={0} y1={0} x2={0} y2={6} className="stroke-theme-muted" strokeWidth={2} />
            </pattern>
          </defs>

          <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
            {/* Y gridlines + tick labels — recessive hairlines, muted mono ticks */}
            {yTicks.map(({ value, y }) => (
              <g key={`ytick-${value}`}>
                <line x1={0} x2={PLOT_W} y1={y} y2={y} className="stroke-theme-border" strokeWidth={1} opacity={0.6} />
                <text x={-10} y={y} textAnchor="end" dominantBaseline="middle" className="fill-theme-muted font-mono" fontSize={10}>
                  {formatTick(value)}
                </text>
              </g>
            ))}

            {/* Zero baseline — SOLID (bars physically anchor here; see file header for why this differs from EventStudyExplorer's dashed zero). */}
            <line x1={0} x2={PLOT_W} y1={yZero} y2={yZero} className="stroke-theme-muted" strokeWidth={1.5} />

            {/* Category (x) ticks + labels, centered under each group */}
            {safeCategories.map((cat, i) => (
              <text
                key={`xtick-${cat.id}`}
                x={i * catBandWidth + catBandWidth / 2}
                y={PLOT_H + 22}
                textAnchor="middle"
                className="fill-theme-muted"
                fontSize={11}
                fontWeight={600}
              >
                {cat.label}
              </text>
            ))}

            {/* Bars */}
            {bars.map((b, i) => {
              const isActive = activeKey === b.key;
              const clipId = `${uid}-clip-${i}`;
              const fillClass = SERIES_FILL_CLASS[b.sIdx];
              const strokeClass = SERIES_STROKE_CLASS[b.sIdx];
              const useHatch = b.sIdx === HATCH_SERIES_INDEX;
              const hitX = b.x - BAR_GAP / 2;
              const hitWidth = b.width + BAR_GAP; // hit target padded slightly past the visible bar (interaction.md)
              const ariaValue = `est = ${formatSigned(b.est)}${b.p != null ? `, p = ${b.p.toFixed(3)}` : ''}`;

              return (
                <g
                  key={b.key}
                  tabIndex={0}
                  role="img"
                  aria-label={`${b.catLabel}, ${b.seriesLabel}: ${ariaValue}`}
                  onMouseEnter={() => setActiveKey(b.key)}
                  onMouseLeave={() => setActiveKey((cur) => (cur === b.key ? null : cur))}
                  onFocus={() => setActiveKey(b.key)}
                  onBlur={() => setActiveKey((cur) => (cur === b.key ? null : cur))}
                  style={{ cursor: 'pointer', outline: 'none' }}
                >
                  {/* Hit target: full plot height, at least the mark's own footprint plus padding (interaction.md). */}
                  <rect x={hitX} y={0} width={hitWidth} height={PLOT_H} fill="transparent" />

                  <clipPath id={clipId}>
                    <motion.rect
                      x={b.x - 2}
                      width={b.width + 4}
                      initial={{ y: b.yZero, height: 0 }}
                      animate={{ y: Math.min(b.yZero, b.yTop), height: Math.abs(b.yBottom - b.yTop) }}
                      transition={{ duration: 0.55, delay: 0.05 * i, ease: 'easeOut' }}
                    />
                  </clipPath>

                  <path
                    d={b.d}
                    clipPath={`url(#${clipId})`}
                    className={useHatch ? strokeClass : `${fillClass ?? ''} ${strokeClass ?? ''}`.trim()}
                    fill={useHatch ? `url(#coefbar-hatch-${uid})` : undefined}
                    fillOpacity={useHatch ? 1 : SERIES_FILL_OPACITY[b.sIdx]}
                    strokeWidth={SERIES_STROKE_WIDTH[b.sIdx]}
                  />

                  {isActive && (
                    <path d={b.d} fill="none" stroke="var(--color-theme-accent)" strokeWidth={2} opacity={0.7} className="pointer-events-none" />
                  )}

                  {/* Value label — signed, 3 decimals, significance stars */}
                  <text
                    x={b.labelX}
                    y={b.labelY}
                    textAnchor="middle"
                    dominantBaseline={b.isPositive ? 'auto' : 'hanging'}
                    className="fill-theme-body font-mono"
                    fontSize={10}
                    fontWeight={600}
                  >
                    {formatSigned(b.est)}
                    {b.stars}
                  </text>
                </g>
              );
            })}

            {/* Y axis label */}
            {yAxisLabel && (
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
            )}
          </g>
        </svg>

        {active && (
          <div
            className="absolute pointer-events-none bg-theme-bg border border-theme-border rounded-lg shadow-lg px-3 py-2 text-xs z-10"
            style={{
              left: `${((active.labelX + MARGIN.left) / WIDTH) * 100}%`,
              top: `${((active.isPositive ? active.yTop : active.yBottom) + MARGIN.top) / HEIGHT * 100}%`,
              transform: `translate(-50%, ${active.isPositive ? '-120%' : '20%'})`,
              minWidth: 150,
            }}
          >
            <div className="font-bold text-theme-main mb-0.5">
              {active.catLabel}
              {safeSeries.length > 1 && <span className="text-theme-muted font-normal"> — {active.seriesLabel}</span>}
            </div>
            <div className="text-theme-accent font-semibold font-mono">
              est = {formatSigned(active.est)}
              {active.stars}
            </div>
            {active.p != null && <div className="text-theme-muted font-mono">p = {active.p.toFixed(3)}</div>}
          </div>
        )}
      </div>

      {hasAnyP && (
        <p className="mt-3 text-[11px] text-theme-muted font-mono text-center">* p &lt; 0.10&nbsp;&nbsp;&nbsp;** p &lt; 0.05&nbsp;&nbsp;&nbsp;*** p &lt; 0.01</p>
      )}

      {note && <p className="mt-3 text-xs text-theme-muted italic text-center">{note}</p>}

      {/*
       * Table-view twin — dataviz skill (components.md, Tier 0): "the
       * table-view toggle (the accessibility twin of every chart)". Every
       * value the tooltip/labels show is reachable here without
       * hovering/focusing a bar.
       */}
      <details className="mt-5 group">
        <summary className="cursor-pointer text-xs font-semibold text-theme-muted hover:text-theme-main transition-colors select-none list-none flex items-center gap-1.5 w-fit">
          <span className="inline-block transition-transform group-open:rotate-90" aria-hidden="true">▸</span>
          View data as table
        </summary>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <caption className="sr-only">{title ? `${title} — tabular data` : 'Coefficient bar — tabular data'}</caption>
            <thead>
              <tr className="border-b border-theme-border text-theme-muted">
                <th scope="col" className="text-left font-semibold py-1.5 pr-3">Category</th>
                {safeSeries.map((s) => (
                  <th key={s.id} scope="col" className="text-right font-semibold py-1.5 px-3">{s.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {safeCategories.map((cat) => (
                <tr key={cat.id} className="border-b border-theme-border/50 text-theme-body">
                  <td className="text-left py-1.5 pr-3">{cat.label}</td>
                  {safeSeries.map((s) => {
                    const cell = s.values?.[cat.id];
                    return (
                      <td key={s.id} className="text-right py-1.5 px-3 font-mono">
                        {cell ? (
                          <>
                            {formatSigned(cell.est)}
                            {starsForP(cell.p)}
                            {cell.p != null && <span className="text-theme-muted"> ({cell.p.toFixed(3)})</span>}
                          </>
                        ) : (
                          '—'
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
};
