/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Cpu, BarChart2 } from 'lucide-react';

// --- SURFACE CODE DIAGRAM ---
interface SurfaceCodeDiagramProps {
  title?: string;
  description?: string;
  dataLabel: string;
  stabilizerLabel: string;
}

export const SurfaceCodeDiagram: React.FC<SurfaceCodeDiagramProps> = ({ title, dataLabel, stabilizerLabel }) => {
  // 3x3 grid of data qubits (9 total)
  // Interspersed with 4 stabilizers (checkers)
  const [errors, setErrors] = useState<number[]>([]);

  // Map data qubit indices (0-8) to affected stabilizers (0-3)
  // Adjacency list: DataQubit Index -> Stabilizer Indices
  const adjacency: Record<number, number[]> = {
    0: [0, 1],
    1: [0, 2],
    2: [1, 3],
    3: [2, 3],
    4: [0, 1, 2, 3], // Center affects all in this simplified tightly packed model
  };

  const toggleError = (id: number) => {
    setErrors(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);
  };

  // Calculate active stabilizers based on parity (even errors = off, odd errors = on)
  const activeStabilizers = [0, 1, 2, 3].filter(stabId => {
    let errorCount = 0;
    Object.entries(adjacency).forEach(([dataId, stabs]) => {
        if (errors.includes(parseInt(dataId)) && stabs.includes(stabId)) {
            errorCount++;
        }
    });
    return errorCount % 2 !== 0;
  });

  return (
    <div className="flex flex-col items-center p-8 bg-theme-card rounded-xl shadow-xs border border-theme-border my-8">
      <h3 className="font-serif text-xl mb-4 text-theme-main">{title}</h3>
      <p className="text-sm text-theme-muted mb-6 text-center max-w-md">
        Click the grey <strong>{dataLabel}</strong> to inject errors. Watch the colored <strong>{stabilizerLabel}</strong> light up when they detect an odd number of errors.
      </p>

      <div className="relative w-64 h-64 bg-theme-bg rounded-lg border border-theme-border p-4 flex flex-wrap justify-between content-between">
         {/* Grid Lines */}
         <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-20">
            <div className="w-2/3 h-2/3 border border-stone-400"></div>
            <div className="absolute w-full h-[1px] bg-stone-400"></div>
            <div className="absolute h-full w-[1px] bg-stone-400"></div>
         </div>

         {/* Stabilizers (Z=Blue, X=Red) - positioned absolutely for control */}
         {[
             {id: 0, x: '50%', y: '20%', type: 'Z', color: 'bg-blue-500'},
             {id: 1, x: '20%', y: '50%', type: 'X', color: 'bg-red-500'},
             {id: 2, x: '80%', y: '50%', type: 'X', color: 'bg-red-500'},
             {id: 3, x: '50%', y: '80%', type: 'Z', color: 'bg-blue-500'},
         ].map(stab => (
             <motion.div
                key={`stab-${stab.id}`}
                className={`absolute w-10 h-10 -ml-5 -mt-5 flex items-center justify-center text-white text-xs font-bold rounded-xs shadow-xs transition-all duration-300 ${activeStabilizers.includes(stab.id) ? stab.color + ' opacity-100 scale-110 ring-4 ring-offset-2 ring-stone-200' : 'bg-stone-300 opacity-40'}`}
                style={{ left: stab.x, top: stab.y }}
             >
                 {stab.type}
             </motion.div>
         ))}

         {/* Data Qubits */}
         {[
             {id: 0, x: '20%', y: '20%'}, {id: 1, x: '80%', y: '20%'},
             {id: 4, x: '50%', y: '50%'}, // Center
             {id: 2, x: '20%', y: '80%'}, {id: 3, x: '80%', y: '80%'},
         ].map(q => (
             <button
                key={`data-${q.id}`}
                onClick={() => toggleError(q.id)}
                className={`absolute w-8 h-8 -ml-4 -mt-4 rounded-full border-2 flex items-center justify-center transition-all duration-200 z-10 ${errors.includes(q.id) ? 'bg-theme-main border-theme-main text-theme-accent' : 'bg-theme-card border-theme-border hover:border-theme-accent'}`}
                style={{ left: q.x, top: q.y }}
             >
                {errors.includes(q.id) && <Activity size={14} />}
             </button>
         ))}
      </div>

      <div className="mt-6 flex items-center gap-4 text-xs font-mono text-theme-muted">
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-theme-main"></div> Error</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-xs bg-blue-500"></div> Z-Check</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-xs bg-red-500"></div> X-Check</div>
      </div>

      <div className="mt-4 h-6 text-sm font-serif italic text-theme-body">
        {errors.length === 0 ? "System is stable." : `Detected ${activeStabilizers.length} parity violations.`}
      </div>
    </div>
  );
};

// --- TRANSFORMER DECODER DIAGRAM ---
interface TransformerDecoderDiagramProps {
  title?: string;
  description?: string;
  inputLabel: string;
  modelLabel: string;
  outputLabel: string;
}

export const TransformerDecoderDiagram: React.FC<TransformerDecoderDiagramProps> = ({ title, description, inputLabel, modelLabel, outputLabel }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
        setStep(s => (s + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center p-8 bg-theme-bg rounded-xl border border-theme-border my-8">
      <h3 className="font-serif text-xl mb-4 text-theme-main">{title}</h3>
      <p className="text-sm text-theme-body mb-6 text-center max-w-md">
        {description}
      </p>

      <div className="relative w-full max-w-lg h-56 bg-theme-card rounded-lg shadow-inner overflow-hidden mb-6 border border-theme-border flex items-center justify-center gap-8 p-4">

        {/* Input Stage */}
        <div className="flex flex-col items-center gap-2">
            <div className={`w-16 h-16 rounded-lg border-2 flex flex-col items-center justify-center transition-colors duration-500 ${step === 0 ? 'border-theme-accent bg-theme-accent/10' : 'border-theme-border bg-theme-bg/50'}`}>
                <div className="grid grid-cols-3 gap-1">
                    {[...Array(9)].map((_, i) => <div key={i} className={`w-2 h-2 rounded-full ${Math.random() > 0.7 ? 'bg-theme-main' : 'bg-theme-border'}`}></div>)}
                </div>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-theme-muted text-center max-w-[80px] truncate">{inputLabel}</span>
        </div>

        {/* Arrows */}
        <motion.div animate={{ opacity: step >= 1 ? 1 : 0.3, x: step >= 1 ? 0 : -5 }}>→</motion.div>

        {/* Transformer Stage */}
        <div className="flex flex-col items-center gap-2">
             <div className={`w-24 h-24 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-colors duration-500 relative overflow-hidden relative ${step === 1 || step === 2 ? 'border-theme-accent bg-theme-main text-theme-bg' : 'border-theme-border bg-theme-bg/50 text-theme-muted'}`}>
                <Cpu size={24} className={step === 1 || step === 2 ? 'text-theme-accent animate-pulse' : 'text-theme-muted'} />
                {step === 1 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-[1px] bg-theme-accent absolute top-1/3 animate-ping"></div>
                        <div className="w-full h-[1px] bg-theme-accent absolute top-2/3 animate-ping delay-75"></div>
                    </div>
                )}
             </div>
             <span className="text-[10px] uppercase font-bold tracking-wider text-theme-muted text-center max-w-[100px] truncate">{modelLabel}</span>
        </div>

        {/* Arrows */}
        <motion.div animate={{ opacity: step >= 3 ? 1 : 0.3, x: step >= 3 ? 0 : -5 }}>→</motion.div>

        {/* Output Stage */}
        <div className="flex flex-col items-center gap-2">
            <div className={`w-16 h-16 rounded-lg border-2 flex flex-col items-center justify-center transition-colors duration-500 ${step === 3 ? 'border-green-500 bg-green-500/10' : 'border-theme-border bg-theme-bg/50'}`}>
                {step === 3 ? (
                    <span className="text-2xl font-serif text-green-600">✓</span>
                ) : (
                    <span className="text-2xl font-serif text-theme-muted">?</span>
                )}
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-theme-muted text-center max-w-[80px] truncate">{outputLabel}</span>
        </div>

      </div>

      <div className="flex gap-2">
          {[0, 1, 2, 3].map(s => (
              <div key={s} className={`h-1 rounded-full transition-all duration-300 ${step === s ? 'w-8 bg-theme-accent' : 'w-2 bg-theme-border'}`}></div>
          ))}
      </div>
    </div>
  );
};

// --- PERFORMANCE CHART ---
export interface PerformanceMetricCategory {
  id: string;
  label: string;
}

export interface PerformanceMetricSeries {
  id: string;
  label: string;
  values: Record<string, number>;
}

interface PerformanceMetricDiagramProps {
  title?: string;
  description?: string;
  metricLabel: string;
  categories: PerformanceMetricCategory[];
  series: PerformanceMetricSeries[];
  valueFormat?: string;
  lowerIsBetter?: boolean;
}

export const PerformanceMetricDiagram: React.FC<PerformanceMetricDiagramProps> = ({ title, description, metricLabel, categories, series }) => {
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
        <div className="flex flex-col md:flex-row gap-8 items-center p-8 bg-stone-900 text-stone-100 rounded-xl my-8 border border-stone-800 shadow-lg">
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
                            className="w-full bg-theme-accent rounded-t-md shadow-[0_0_20px_rgba(197,160,89,0.25)] relative overflow-hidden"
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
    );
};
