import boboCarrySprite from './assets/bobo-sprite-carry.png';
import boboCelebrateSprite from './assets/bobo-sprite-celebrate.png';
import boboIdleSprite from './assets/bobo-sprite-idle.png';
import boboPaintSprite from './assets/bobo-sprite-paint.png';
import boboPlaySprite from './assets/bobo-sprite-play.png';
import boboRepairSprite from './assets/bobo-sprite-repair.png';
import boboSleepSprite from './assets/bobo-sprite-sleep.png';
import boboWalkASprite from './assets/bobo-sprite-walk-a.png';
import boboWalkBSprite from './assets/bobo-sprite-walk-b.png';
import boboWorkSprite from './assets/bobo-sprite-work.png';
import boboCoffeeASprite from './assets/bobo-packs/classic/frames/sprite-coffee-a.png';
import boboCoffeeBSprite from './assets/bobo-packs/classic/frames/sprite-coffee-b.png';
import boboInspectASprite from './assets/bobo-packs/classic/frames/sprite-inspect-a.png';
import boboInspectBSprite from './assets/bobo-packs/classic/frames/sprite-inspect-b.png';
import boboStretchASprite from './assets/bobo-packs/classic/frames/sprite-stretch-a.png';
import boboStretchBSprite from './assets/bobo-packs/classic/frames/sprite-stretch-b.png';
import boboSweepASprite from './assets/bobo-packs/classic/frames/sprite-sweep-a.png';
import boboSweepBSprite from './assets/bobo-packs/classic/frames/sprite-sweep-b.png';
import boboTypeASprite from './assets/bobo-packs/classic/frames/sprite-type-a.png';
import boboTypeBSprite from './assets/bobo-packs/classic/frames/sprite-type-b.png';
import type {
  BoboAnimation,
  BoboAnimationFrame,
  BoboSpriteManifest,
} from './boboAnimation';

const frame = (src: string, durationMs: number): BoboAnimationFrame => ({ src, durationMs });

const singleFrame = (
  id: string,
  src: string,
  durationMs = 800,
): BoboAnimation => ({
  id,
  frames: [frame(src, durationMs)],
  loop: true,
  restFrame: 0,
});

const alternatingFrames = (
  id: string,
  frameA: string,
  frameB: string,
  durationMs = 220,
): BoboAnimation => ({
  id,
  frames: [
    frame(frameA, durationMs),
    frame(frameB, durationMs),
    frame(frameA, durationMs),
    frame(frameB, durationMs + 80),
  ],
  loop: true,
  restFrame: 0,
});

/**
 * Compatibility manifest for the original 波波 sprite set.
 *
 * New character packs can replace this object with any number of authored
 * frames per pose. Keeping animation data outside the component means a pack
 * never needs pose-specific rendering code.
 */
export const CLASSIC_BOBO_SPRITE_MANIFEST: BoboSpriteManifest = {
  schemaVersion: 1,
  id: 'classic-bobo-v1',
  canvas: {
    width: 252,
    height: 336,
    pivot: { x: 126, y: 320 },
  },
  animations: {
    idle: singleFrame('classic-idle', boboIdleSprite),
    think: singleFrame('classic-think', boboIdleSprite),
    wait: singleFrame('classic-wait', boboIdleSprite),
    walk: {
      id: 'classic-walk',
      frames: [
        frame(boboWalkASprite, 150),
        frame(boboWalkBSprite, 150),
        frame(boboWalkASprite, 150),
        frame(boboWalkBSprite, 150),
      ],
      loop: true,
      restFrame: 0,
    },
    work: singleFrame('classic-work', boboWorkSprite),
    carry: singleFrame('classic-carry', boboCarrySprite),
    paint: singleFrame('classic-paint', boboPaintSprite),
    sleep: singleFrame('classic-sleep', boboSleepSprite, 1_200),
    play: singleFrame('classic-play', boboPlaySprite),
    repair: singleFrame('classic-repair', boboRepairSprite),
    coffee: alternatingFrames('classic-coffee', boboCoffeeASprite, boboCoffeeBSprite, 360),
    stretch: alternatingFrames('classic-stretch', boboStretchASprite, boboStretchBSprite, 340),
    type: alternatingFrames('classic-type', boboTypeASprite, boboTypeBSprite, 150),
    inspect: alternatingFrames('classic-inspect', boboInspectASprite, boboInspectBSprite, 320),
    sweep: alternatingFrames('classic-sweep', boboSweepASprite, boboSweepBSprite, 240),
    celebrate: singleFrame('classic-celebrate', boboCelebrateSprite),
  },
};
