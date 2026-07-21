/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * A subtle, tasteful hero background for non-quantum papers: a slowly
 * drifting node-and-edge network (a "constellation"), matching the site's
 * single-accent aesthetic. New in Phase 4 — registered as 'abstract-network'
 * in src/figures/hero/HeroSceneRegistry.tsx.
 *
 * Performance-light by construction: ≤40 nodes, no per-frame node updates
 * (the whole group drifts via one drei <Float>, not N individual
 * useFrame subscriptions), meshBasicMaterial/plain lines so no scene
 * lighting is needed at all.
 *
 * Colors: three.js materials take a raw color prop, not a CSS class, so
 * this is the one figure that legitimately needs the *resolved* accent hex
 * rather than a CSS var — pulled live from useTheme()/THEMES so it still
 * re-themes across all 4 presets.
 */
import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Float, Line } from '@react-three/drei';
import { useTheme } from '../../theme/useTheme';
import { THEMES } from '../../theme/themes';

const NODE_COUNT = 28;
const MAX_EDGE_DISTANCE = 3.2;

type Vec3 = [number, number, number];

// Deterministic pseudo-random (mulberry32) so the network's shape is stable
// across re-renders and theme swaps — only the accent color prop changes.
function mulberry32(seed: number) {
  return function random() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function distance(a: Vec3, b: Vec3): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

function generateNetwork(count: number) {
  const random = mulberry32(20260720);
  const positions: Vec3[] = Array.from({ length: count }, () => [
    (random() - 0.5) * 9,
    (random() - 0.5) * 5.5,
    (random() - 0.5) * 3.5,
  ]);

  // Connect each node to its 1-2 nearest neighbours for a sparse
  // constellation look rather than a dense mesh (keeps draw calls low).
  const edges: Array<[number, number]> = [];
  positions.forEach((node, i) => {
    const ranked = positions
      .map((other, j) => ({ j, d: i === j ? Infinity : distance(node, other) }))
      .sort((a, b) => a.d - b.d);
    const neighborCount = random() > 0.6 ? 2 : 1;
    for (let k = 0; k < neighborCount; k++) {
      const { j, d } = ranked[k];
      const alreadyLinked = edges.some(([a, b]) => (a === i && b === j) || (a === j && b === i));
      if (d < MAX_EDGE_DISTANCE && !alreadyLinked) {
        edges.push([i, j]);
      }
    }
  });

  return { positions, edges };
}

export const AbstractNetworkScene: React.FC = () => {
  const { activeThemeKey } = useTheme();
  const accentHex = THEMES[activeThemeKey].accent;
  const { positions, edges } = useMemo(() => generateNetwork(NODE_COUNT), []);

  return (
    <div className="absolute inset-0 z-0 opacity-60 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <Float speed={0.6} rotationIntensity={0.15} floatIntensity={0.5}>
          <group>
            {edges.map(([a, b], i) => (
              <Line
                key={`edge-${i}`}
                points={[positions[a], positions[b]]}
                color={accentHex}
                transparent
                opacity={0.25}
                lineWidth={1}
              />
            ))}
            {positions.map((position, i) => (
              <mesh key={`node-${i}`} position={position}>
                <sphereGeometry args={[0.045, 8, 8]} />
                <meshBasicMaterial color={accentHex} transparent opacity={0.8} />
              </mesh>
            ))}
          </group>
        </Float>
      </Canvas>
    </div>
  );
};
