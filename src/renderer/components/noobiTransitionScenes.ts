import cozyWorkshopGif from '../assets/bobo/studio.png';
import crystalLabGif from '../assets/bobo/studio.png';
import forestCampGif from '../assets/bobo/studio.png';
import potionGardenGif from '../assets/bobo/studio.png';
import rooftopStudioGif from '../assets/bobo/studio.png';
import seasideArcadeGif from '../assets/bobo/studio.png';
import skyDockGif from '../assets/bobo/studio.png';
import snowCabinGif from '../assets/bobo/studio.png';
import starObservatoryGif from '../assets/bobo/studio.png';

export const NOOBI_TRANSITION_SCENES = [
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

export const NOOBI_TRANSITION_SCENE_COUNT = NOOBI_TRANSITION_SCENES.length;

export function noobiTransitionSceneIndex(runId: number): number {
  if (!Number.isFinite(runId) || runId <= 1) return 0;
  return (Math.floor(runId) - 1) % NOOBI_TRANSITION_SCENE_COUNT;
}

export function noobiTransitionSceneForRun(runId: number): string {
  return NOOBI_TRANSITION_SCENES[noobiTransitionSceneIndex(runId)];
}
