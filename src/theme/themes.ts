/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Theme Presets Definition
export const THEMES = {
  'gold-cream': {
    name: 'Sand & Gold (Classic)',
    isDark: false,
    bg: '#F9F8F4',
    cardBg: '#FFFFFF',
    textMain: '#1C1917', // stone-900
    textBody: '#44403C', // stone-700
    textMuted: '#78716C', // stone-500
    border: '#E7E5E4', // stone-200
    accent: '#C5A059', // nobel-gold
    accentMuted: 'rgba(197, 160, 89, 0.1)',
  },
  'cosmic-slate': {
    name: 'Cosmic Slate (Dark)',
    isDark: true,
    bg: '#0F172A', // slate-900
    cardBg: '#1E293B', // slate-800
    textMain: '#F8FAFC', // slate-50
    textBody: '#CBD5E1', // slate-300
    textMuted: '#94A3B8', // slate-400
    border: '#334155', // slate-700
    accent: '#06B6D4', // cyan-500
    accentMuted: 'rgba(6, 182, 212, 0.1)',
  },
  'academic-indigo': {
    name: 'Academic Indigo (Light)',
    isDark: false,
    bg: '#F8FAFC', // slate-50
    cardBg: '#FFFFFF',
    textMain: '#0F172A', // slate-900
    textBody: '#334155', // slate-700
    textMuted: '#64748B', // slate-500
    border: '#E2E8F0', // slate-200
    accent: '#1D4ED8', // royal blue
    accentMuted: 'rgba(29, 78, 216, 0.1)',
  },
  'forest-emerald': {
    name: 'Forest Emerald (Dark)',
    isDark: true,
    bg: '#0A0F0D', // dark forest
    cardBg: '#141F1A', // forest card
    textMain: '#ECFDF5', // emerald-50
    textBody: '#D1FAE5', // emerald-100
    textMuted: '#34D399', // emerald-400
    border: '#1F2F28', // dark forest border
    accent: '#10B981', // emerald-500
    accentMuted: 'rgba(16, 185, 129, 0.1)',
  }
};

// Font Presets Definition
export const FONTS_HEADING = {
  'Playfair Display': '"Playfair Display", serif',
  'Space Grotesk': '"Space Grotesk", sans-serif',
  'JetBrains Mono': '"JetBrains Mono", monospace',
  'Lora': '"Lora", serif',
  'Inter': '"Inter", sans-serif'
};

export const FONTS_BODY = {
  'Inter': '"Inter", sans-serif',
  'Lora': '"Lora", serif',
  'JetBrains Mono': '"JetBrains Mono", monospace'
};
