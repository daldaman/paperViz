/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Central figure registry. Maps:
 *  - figure.kind ('static' | 'diagram' | 'interactive') to its renderer
 *  - for 'interactive', figure.component (a string from the JSON content)
 *    to a React component + an optional zod props schema
 *
 * Replaces ProseSection.tsx's Phase-3 "temporary literal switch" on
 * figure.component. An unknown component name renders nothing and logs a
 * loud console.error rather than crashing the page — a malformed/future
 * component name in one paper's JSON should never take down the whole site.
 *
 * src/content/loader.ts imports getInteractivePropsSchema() to validate
 * figure.props against the registered schema right after the main
 * PaperContentSchema parse; an interactive figure with a registered schema
 * that fails that validation is excluded from the paper (loud console.error
 * with the zod issues), not rendered with unvalidated props.
 */
import React from 'react';
import { z } from 'zod';
import type { Figure, InteractiveFigure } from '../content/schema';
import { SurfaceCodeDiagram } from './quantum/SurfaceCodeDiagram';
import { TransformerDecoderDiagram } from './quantum/TransformerDecoderDiagram';
import { QuantumComputerScene } from './quantum/QuantumScene';
import { InteractiveGroupedBar, InteractiveGroupedBarPropsSchema } from './InteractiveGroupedBar';
import { EventStudyExplorer, EventStudyExplorerPropsSchema } from './EventStudyExplorer';
import { CoefficientBar, CoefficientBarPropsSchema } from './CoefficientBar';
import { StaticFigure } from './StaticFigure';
import { ConceptMapDiagram } from './ConceptMapDiagram';

interface InteractiveRegistryEntry {
  component: React.ComponentType<Record<string, unknown>>;
  propsSchema?: z.ZodType;
}

/**
 * QuantumComputerScene renders no title/caption of its own (unlike the
 * other interactive components) — this is the aspect-square frame + caption
 * overlay that used to live directly in ProseSection.tsx's switch,
 * reproduced verbatim so the AlphaQubit "impact" section stays pixel-
 * identical to Phase 3.
 */
const QuantumComputerSceneFigure: React.FC<{ description?: string }> = ({ description }) =>
  React.createElement(
    'div',
    { className: 'aspect-square bg-theme-bg/60 rounded-xl overflow-hidden relative border border-theme-border shadow-inner' },
    React.createElement(QuantumComputerScene),
    description
      ? React.createElement(
          'div',
          {
            className:
              'absolute bottom-4 left-0 right-0 text-center text-xs text-theme-muted font-serif italic z-10 px-4 bg-theme-card/75 backdrop-blur-xs py-1 border-t border-theme-border',
          },
          description,
        )
      : null,
  );

// Each figure component has its own specific (non-index-signature) props
// type, so plugging it into a homogeneous registry needs an `unknown`
// double-cast — the registered propsSchema (where present) is what actually
// guarantees the shape at runtime; see src/content/loader.ts.
function toRegistryComponent<P extends object>(component: React.ComponentType<P>): React.ComponentType<Record<string, unknown>> {
  return component as unknown as React.ComponentType<Record<string, unknown>>;
}

export const INTERACTIVE_FIGURE_REGISTRY: Record<string, InteractiveRegistryEntry> = {
  'surface-code': { component: toRegistryComponent(SurfaceCodeDiagram) },
  'transformer-decoder': { component: toRegistryComponent(TransformerDecoderDiagram) },
  'grouped-bar': {
    component: toRegistryComponent(InteractiveGroupedBar),
    propsSchema: InteractiveGroupedBarPropsSchema,
  },
  'event-study-explorer': {
    component: toRegistryComponent(EventStudyExplorer),
    propsSchema: EventStudyExplorerPropsSchema,
  },
  'coefficient-bar': {
    component: toRegistryComponent(CoefficientBar),
    propsSchema: CoefficientBarPropsSchema,
  },
  'quantum-computer-scene': { component: toRegistryComponent(QuantumComputerSceneFigure) },
};

export function getInteractivePropsSchema(component: string): z.ZodType | undefined {
  return INTERACTIVE_FIGURE_REGISTRY[component]?.propsSchema;
}

function renderInteractiveFigure(figure: InteractiveFigure): React.ReactNode {
  const entry = INTERACTIVE_FIGURE_REGISTRY[figure.component];
  if (!entry) {
    console.error(
      `[paperViz] Unknown interactive figure component "${figure.component}" (figure id "${figure.id}") — rendering nothing. Register it in src/figures/registry.ts.`,
    );
    return null;
  }
  const Component = entry.component;
  return React.createElement(Component, { title: figure.title, description: figure.description, ...figure.props });
}

/**
 * Renders any figure from PaperContent.figures[] by kind, dispatching to the
 * per-component registry above for 'interactive'. StaticFigure resolves its
 * own image path from the ambient FigureRenderProvider slug context rather
 * than a prop here, so this function stays kind-dispatch-only.
 */
export function renderFigure(figure: Figure): React.ReactNode {
  switch (figure.kind) {
    case 'static':
      return React.createElement(StaticFigure, { figure });
    case 'diagram':
      return React.createElement(ConceptMapDiagram, {
        title: figure.title,
        description: figure.description,
        spec: figure.spec,
      });
    case 'interactive':
      return renderInteractiveFigure(figure);
    default:
      return null;
  }
}
