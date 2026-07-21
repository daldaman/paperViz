/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Maps meta.heroScene -> the 3D background component Hero.tsx mounts behind
 * the title. New in Phase 4.
 */
import React from 'react';
import type { Meta } from '../../content/schema';
import { HeroScene } from '../quantum/QuantumScene';
import { AbstractNetworkScene } from './AbstractNetworkScene';

type HeroSceneKey = Meta['heroScene'];

const HERO_SCENE_REGISTRY: Partial<Record<HeroSceneKey, React.ComponentType>> = {
  quantum: HeroScene,
  'abstract-network': AbstractNetworkScene,
};

interface HeroSceneRendererProps {
  heroScene: HeroSceneKey;
}

export const HeroSceneRenderer: React.FC<HeroSceneRendererProps> = ({ heroScene }) => {
  if (heroScene === 'none') return null;

  const Component = HERO_SCENE_REGISTRY[heroScene];
  if (!Component) {
    console.error(
      `[paperViz] Unknown heroScene "${heroScene}" — rendering nothing. Register it in src/figures/hero/HeroSceneRegistry.tsx.`,
    );
    return null;
  }

  return <Component />;
};
