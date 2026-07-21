/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Renamed + moved from components/Diagrams.tsx's `PerformanceMetricDiagram`
 * in Phase 4 — it was already data-driven (categories[]/series[]) since
 * Phase 3, so this is a move+rename plus a registered props schema
 * (src/figures/registry.ts). Not quantum-specific despite the AlphaQubit
 * styling (dark stone card, single accent "ours" bar) — kept as-is because
 * it is still the only paper using it; a future paper that wants a
 * differently-styled grouped bar gets a new component rather than an
 * options prop explosion here.
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart2 } from 'lucide-react';
import { z } from 'zod';

export const GroupedBarCategorySchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
});

export const GroupedBarSeriesSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  values: z.record(z.string(), z.number()).describe('Value keyed by category id'),
});

export const InteractiveGroupedBarPropsSchema = z.object({
  metricLabel: z.string().optional(),
  valueFormat: z.string().optional(),
  lowerIsBetter: z.boolean().optional(),
  categories: z.array(GroupedBarCategorySchema).min(1),
  series: z.array(GroupedBarSeriesSchema).min(1),
});

export type GroupedBarCategory = z.infer<typeof GroupedBarCategorySchema>;
export type GroupedBarSeries = z.infer<typeof GroupedBarSeriesSchema>;

interface InteractiveGroupedBarProps {
  title?: string;
  description?: string;
  metricLabel?: string;
  categories: GroupedBarCategory[];
  series: GroupedBarSeries[];
  valueFormat?: string;
  lowerIsBetter?: boolean;
}

export const InteractiveGroupedBar: React.FC<InteractiveGroupedBarProps> = ({ title, description, metricLabel, categories, series }) => {
    const safeCategories = categories ?? [];
    const safeSeries = series ?? [];
    const defaultCategoryId = safeCategories[Math.min(1, safeCategories.length - 1)]?.id ?? safeCategories[0]?.id;
    const [categoryId, setCategoryId] = useState<string | undefined>(defaultCategoryId);

    // The original design renders exactly two bars: a muted "standard" bar
    // (series[0]) and an accent "ours" bar (series[1]). Guard defensively
    // against a shorter/missing series array now that values come from JSON.
    const standardSeries = safeSeries[0];
    const oursSeries = safeSeries[1];
    const activeCategoryId = categoryId ?? safeCategories[0]?.id;
    const standardValue = (activeCategoryId && standardSeries?.values?.[activeCategoryId]) || 0;
    const oursValue = (activeCategoryId && oursSeries?.values?.[activeCategoryId]) || 0;

    // Normalize to max value of current set to visually fill the chart, with some headroom
    const maxVal = Math.max(standardValue, oursValue, 0) * 1.25 || 1;

    const formatValue = (val: number) => {
        if (val < 0.01) return val.toFixed(4) + '%';
        return val.toFixed(2) + '%';
    }

    return (
        <div className="p-8 bg-stone-900 text-stone-100 rounded-xl my-8 border border-stone-800 shadow-lg">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1 min-w-[240px]">
                <h3 className="font-serif text-xl mb-2 text-theme-accent">{title}</h3>
                <p className="text-stone-400 text-sm mb-4 leading-relaxed">
                    {description}
                </p>
                <div className="flex gap-2 mt-6">
                    {safeCategories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setCategoryId(cat.id)}
                            className={`px-3 py-1.5 rounded-sm text-sm font-medium transition-all duration-200 border ${activeCategoryId === cat.id ? 'bg-theme-accent text-stone-900 border-theme-accent' : 'bg-transparent text-stone-400 border-stone-700 hover:border-stone-500 hover:text-stone-200'}`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
                <div className="mt-6 font-mono text-xs text-stone-500 flex items-center gap-2">
                    <BarChart2 size={14} className="text-theme-accent" />
                    <span>{(metricLabel ?? '').toUpperCase()}</span>
                </div>
            </div>

            <div className="relative w-64 h-72 bg-stone-800/50 rounded-xl border border-stone-700/50 p-6 flex justify-around items-end">
                {/* Background Grid Lines */}
                <div className="absolute inset-0 p-6 flex flex-col justify-between pointer-events-none opacity-10">
                   <div className="w-full h-[1px] bg-stone-400"></div>
                   <div className="w-full h-[1px] bg-stone-400"></div>
                   <div className="w-full h-[1px] bg-stone-400"></div>
                   <div className="w-full h-[1px] bg-stone-400"></div>
                </div>

                {/* Standard Bar */}
                <div className="w-20 flex flex-col justify-end items-center h-full z-10">
                    <div className="flex-1 w-full flex items-end justify-center relative mb-3">
                        <div className="absolute -top-5 w-full text-center text-sm font-mono text-stone-400 font-bold bg-stone-900/90 py-1 px-2 rounded-sm backdrop-blur-xs border border-stone-700/50 shadow-xs">{formatValue(standardValue)}</div>
                        <motion.div
                            className="w-full bg-stone-600 rounded-t-md border-t border-x border-stone-500/30"
                            initial={{ height: 0 }}
                            animate={{ height: `${(standardValue / maxVal) * 100}%` }}
                            transition={{ type: "spring", stiffness: 80, damping: 15 }}
                        />
                    </div>
                    <div className="h-6 flex items-center text-xs font-bold text-stone-500 uppercase tracking-wider text-center truncate max-w-[80px]" title={standardSeries?.label}>{standardSeries?.label}</div>
                </div>

                {/* Ours Bar */}
                <div className="w-20 flex flex-col justify-end items-center h-full z-10">
                     <div className="flex-1 w-full flex items-end justify-center relative mb-3">
                        <div className="absolute -top-5 w-full text-center text-sm font-mono text-theme-accent font-bold bg-stone-900/90 py-1 px-2 rounded-sm backdrop-blur-xs border border-theme-accent/30 shadow-xs">{formatValue(oursValue)}</div>
                        <motion.div
                            className="w-full bg-theme-accent rounded-t-md shadow-[0_0_20px_color-mix(in_srgb,var(--color-accent)_25%,transparent)] relative overflow-hidden"
                            initial={{ height: 0 }}
                            animate={{ height: Math.max(1, (oursValue / maxVal) * 100) + '%' }}
                            transition={{ type: "spring", stiffness: 80, damping: 15, delay: 0.1 }}
                        >
                           {/* Shine effect */}
                           <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/20"></div>
                        </motion.div>
                    </div>
                     <div className="h-6 flex items-center text-xs font-bold text-theme-accent uppercase tracking-wider text-center truncate max-w-[80px]" title={oursSeries?.label}>{oursSeries?.label}</div>
                </div>
            </div>
          </div>

          {/*
           * Table-view twin — dataviz skill (components.md, Tier 0): "the
           * table-view toggle (the accessibility twin of every chart)".
           */}
          <details className="mt-6 pt-6 border-t border-stone-800 group">
            <summary className="cursor-pointer text-xs font-semibold text-stone-400 hover:text-stone-200 transition-colors select-none list-none flex items-center gap-1.5 w-fit">
              <span className="inline-block transition-transform group-open:rotate-90" aria-hidden="true">▸</span>
              View data as table
            </summary>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <caption className="sr-only">{title ? `${title} — tabular data` : 'Grouped bar — tabular data'}</caption>
                <thead>
                  <tr className="border-b border-stone-800 text-stone-400">
                    <th scope="col" className="text-left font-semibold py-1.5 pr-3">Category</th>
                    {safeSeries.map((s) => (
                      <th key={s.id} scope="col" className="text-right font-semibold py-1.5 px-3">{s.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {safeCategories.map((cat) => (
                    <tr key={cat.id} className="border-b border-stone-800/60 text-stone-300">
                      <td className="text-left py-1.5 pr-3">{cat.label}</td>
                      {safeSeries.map((s) => (
                        <td key={s.id} className="text-right py-1.5 px-3 font-mono">{formatValue(s.values?.[cat.id] ?? 0)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </div>
    );
};
