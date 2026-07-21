/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Demo-only, flat-props diagram (AlphaQubit-specific, not reusable for other
 * papers) — moved verbatim from components/Diagrams.tsx in Phase 4, split
 * one-component-per-file. Registered in src/figures/registry.ts as
 * 'surface-code'.
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

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
