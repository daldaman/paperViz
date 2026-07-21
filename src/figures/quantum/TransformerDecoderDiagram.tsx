/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Demo-only, flat-props diagram (AlphaQubit-specific, not reusable for other
 * papers) — moved verbatim from components/Diagrams.tsx in Phase 4, split
 * one-component-per-file. Registered in src/figures/registry.ts as
 * 'transformer-decoder'.
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cpu } from 'lucide-react';

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
