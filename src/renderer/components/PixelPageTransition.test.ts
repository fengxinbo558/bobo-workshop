import { describe, expect, it } from 'vitest';

import {
  PIXEL_TRANSITION_COLUMNS,
  PIXEL_TRANSITION_MAX_CELL_DELAY_MS,
  PIXEL_TRANSITION_ROWS,
  pixelTransitionCellDelay,
} from './PixelPageTransition';
import {
  BOBO_TRANSITION_SCENE_COUNT,
  boboTransitionSceneIndex,
} from './boboTransitionScenes';

describe('pixel page transition wave', () => {
  it('moves forward from the top-left toward the bottom-right', () => {
    const last = PIXEL_TRANSITION_COLUMNS * PIXEL_TRANSITION_ROWS - 1;

    expect(pixelTransitionCellDelay(0, 'forward')).toBe(0);
    expect(pixelTransitionCellDelay(last, 'forward')).toBe(
      PIXEL_TRANSITION_MAX_CELL_DELAY_MS,
    );
  });

  it('mirrors its delay field for backward navigation', () => {
    const count = PIXEL_TRANSITION_COLUMNS * PIXEL_TRANSITION_ROWS;

    for (let index = 0; index < count; index += 1) {
      expect(pixelTransitionCellDelay(index, 'forward')).toBe(
        pixelTransitionCellDelay(count - index - 1, 'backward'),
      );
    }
  });
});

describe('BoBo transition scene rotation', () => {
  it('ships nine scenes and advances one scene per transition run', () => {
    expect(BOBO_TRANSITION_SCENE_COUNT).toBe(9);
    expect(boboTransitionSceneIndex(1)).toBe(0);
    expect(boboTransitionSceneIndex(9)).toBe(8);
    expect(boboTransitionSceneIndex(10)).toBe(0);
  });

  it('uses the first scene for an initial or invalid run id', () => {
    expect(boboTransitionSceneIndex(0)).toBe(0);
    expect(boboTransitionSceneIndex(Number.NaN)).toBe(0);
  });
});
