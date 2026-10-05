import cozyWorkshopGif from '../assets/bobo/studio.png';
import crystalLabGif from '../assets/bobo/studio.png';
import forestCampGif from '../assets/bobo/studio.png';
import potionGardenGif from '../assets/bobo/studio.png';
import rooftopStudioGif from '../assets/bobo/studio.png';
import seasideArcadeGif from '../assets/bobo/studio.png';
import skyDockGif from '../assets/bobo/studio.png';
import snowCabinGif from '../assets/bobo/studio.png';
import starObservatoryGif from '../assets/bobo/studio.png';

export const BOBO_TRANSITION_SCENES = [
  cozyWorkshopGif,
  crystalLabGif,
  forestCampGif,
  skyDockGif,
  seasideArcadeGif,
  snowCabinGif,
  starObservatoryGif,
  potionGardenGif,
  rooftopStudioGif,
] as const;

export const BOBO_TRANSITION_SCENE_COUNT = BOBO_TRANSITION_SCENES.length;

export function boboTransitionSceneIndex(runId: number): number {
  if (!Number.isFinite(runId) || runId <= 1) return 0;
  return (Math.floor(runId) - 1) % BOBO_TRANSITION_SCENE_COUNT;
}

export function boboTransitionSceneForRun(runId: number): string {
  return BOBO_TRANSITION_SCENES[boboTransitionSceneIndex(runId)];
}
