import type { BoboPackId } from '../shared/contracts';
import classicScene from './assets/bobo-packs/classic/scene.png';
import helloKittyScene from './assets/bobo-packs/hellokitty/scene.png';
import mosslightScene from './assets/bobo-packs/mosslight/scene.png';
import starforgeScene from './assets/bobo-packs/starforge/scene.png';
import twilightScene from './assets/bobo-packs/twilight/scene.png';
import type {
  BoboAnimation,
  BoboAnimationFrame,
  BoboSpriteManifest,
} from './boboAnimation';

export interface BoboProductionPack {
  id: BoboPackId;
  sceneImage: string;
  spriteManifest: BoboSpriteManifest;
}

const frameAssets = import.meta.glob(
  [
    './assets/bobo-packs/*/frames/sprite-*.png',
    '!./assets/bobo-packs/*/frames/sprite-sheet-*.png',
  ],
  { eager: true, import: 'default', query: '?url' },
) as Record<string, string>;

function frameSource(packId: BoboPackId, filename: string): string {
  const key = `./assets/bobo-packs/${packId}/frames/${filename}`;
  const source = frameAssets[key];
  if (!source) throw new Error(`Missing 波波 animation frame: ${key}`);
  return source;
}

function frames(
  packId: BoboPackId,
  names: readonly string[],
  durations: readonly number[],
): BoboAnimationFrame[] {
  return names.map((name, index) => ({
    src: frameSource(packId, `sprite-${name}.png`),
    durationMs: durations[index] ?? durations.at(-1) ?? 160,
  }));
}

function clip(
  packId: BoboPackId,
  id: string,
  names: readonly string[],
  durations: readonly number[],
  restFrame = 0,
): BoboAnimation {
  return {
    id: `${packId}-${id}`,
    frames: frames(packId, names, durations),
    loop: true,
    restFrame,
  };
}

function manifest(packId: BoboPackId): BoboSpriteManifest {
  return {
    schemaVersion: 1,
    id: `${packId}-bobo-v2`,
    canvas: {
      width: 252,
      height: 336,
      pivot: { x: 126, y: 320 },
    },
    animations: {
      idle: clip(packId, 'idle',
        ['idle-a', 'idle-b', 'idle-a'],
        [620, 140, 760]),
      think: clip(packId, 'think',
        ['idle-a', 'idle-b', 'idle-a'],
        [420, 260, 520]),
      wait: clip(packId, 'wait',
        ['idle-a', 'idle-b', 'idle-a', 'idle-b'],
        [680, 220, 820, 220]),
      walk: clip(packId, 'walk',
        ['walk-a-a', 'walk-a-b', 'walk-b-a', 'walk-b-b'],
        [130, 130, 130, 130]),
      work: clip(packId, 'work',
        ['work-a', 'work-b', 'work-a', 'work-b'],
        [240, 180, 260, 180]),
      carry: clip(packId, 'carry',
        ['carry-a', 'carry-b', 'carry-a', 'carry-b'],
        [200, 170, 200, 170]),
      paint: clip(packId, 'paint',
        ['paint-a', 'paint-b', 'paint-a', 'paint-b', 'paint-a'],
        [180, 150, 180, 150, 300]),
      sleep: clip(packId, 'sleep',
        ['sleep-a', 'sleep-b', 'sleep-a'],
        [720, 420, 820]),
      play: clip(packId, 'play',
        ['play-a', 'play-b', 'play-a', 'play-b'],
        [190, 150, 210, 150]),
      repair: clip(packId, 'repair',
        ['repair-a', 'repair-b', 'repair-a', 'repair-b', 'repair-a'],
        [170, 120, 190, 120, 280]),
      coffee: clip(packId, 'coffee',
        ['coffee-a', 'coffee-b', 'coffee-a', 'coffee-b'],
        [460, 320, 560, 320]),
      stretch: clip(packId, 'stretch',
        ['stretch-a', 'stretch-b', 'stretch-a'],
        [300, 440, 520]),
      type: clip(packId, 'type',
        ['type-a', 'type-b', 'type-a', 'type-b'],
        [150, 150, 170, 220]),
      inspect: clip(packId, 'inspect',
        ['inspect-a', 'inspect-b', 'inspect-a'],
        [380, 280, 540]),
      sweep: clip(packId, 'sweep',
        ['sweep-a', 'sweep-b', 'sweep-a', 'sweep-b'],
        [240, 240, 280, 320]),
      celebrate: clip(packId, 'celebrate',
        ['celebrate-a', 'celebrate-b', 'celebrate-a', 'celebrate-b', 'celebrate-a', 'celebrate-b'],
        [140, 140, 140, 140, 160, 240]),
    },
  };
}

export const BOBO_PRODUCTION_PACKS: Readonly<Record<BoboPackId, BoboProductionPack>> = {
  classic: {
    id: 'classic',
    sceneImage: classicScene,
    spriteManifest: manifest('classic'),
  },
  mosslight: {
    id: 'mosslight',
    sceneImage: mosslightScene,
    spriteManifest: manifest('mosslight'),
  },
  starforge: {
    id: 'starforge',
    sceneImage: starforgeScene,
    spriteManifest: manifest('starforge'),
  },
  twilight: {
    id: 'twilight',
    sceneImage: twilightScene,
    spriteManifest: manifest('twilight'),
  },
  hellokitty: {
    id: 'hellokitty',
    sceneImage: helloKittyScene,
    spriteManifest: manifest('hellokitty'),
  },
};

export function boboProductionPack(packId: BoboPackId): BoboProductionPack {
  return BOBO_PRODUCTION_PACKS[packId];
}
