import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { BOBO_SCENE_IDS } from '../../shared/contracts';
import {
  BOBO_SCENE_OPTIONS,
  BOBO_SOLO_SCENE_OPTIONS,
  BoboScenePicker,
  BoboSoloScenePicker,
} from './BoboScenePicker';

describe('BoboScenePicker', () => {
  it('offers exactly every supported running background', () => {
    expect(BOBO_SCENE_OPTIONS.map((option) => option.id)).toEqual([...BOBO_SCENE_IDS]);
  });

  it('offers the implemented shared studio independently of the character', () => {
    expect(BOBO_SOLO_SCENE_OPTIONS.map((option) => option.id)).toEqual(['classic']);
    expect(BOBO_SOLO_SCENE_OPTIONS.every((option) => (
      option.badges.includes('单人工作室') && option.badges.includes('角色独立选择')
    ))).toBe(true);

    const markup = renderToStaticMarkup(createElement(BoboSoloScenePicker, {
      value: 'starforge',
      onChange: vi.fn(),
    }));

    expect(markup).toContain('aria-label="选择单人工作室"');
    expect(markup).toContain('data-scene-kind="solo"');
    expect(markup).toMatch(
      /<button[^>]*aria-checked="true"[^>]*data-scene-id="classic"[^>]*data-scene-kind="solo"/u,
    );
    expect(markup).not.toContain('data-scene-id="fishing"');
  });

  it('maps the legacy fishing id to the Bobo retreat', () => {
    const markup = renderToStaticMarkup(createElement(BoboScenePicker, {
      value: 'fishing',
      onChange: vi.fn(),
    }));

    expect(markup).toContain('aria-label="选择多人运行背景"');
    expect(markup).toContain('data-scene-id="fishing"');
    expect(markup).toContain('data-motion="static"');
    expect(markup).toMatch(
      /<button[^>]*aria-checked="true"[^>]*data-scene-id="fishing"[^>]*data-motion="static"/u,
    );
    expect(markup).toContain('BOBO RETREAT');
    expect(markup).toContain('休憩小屋');
    expect(markup).toContain('温暖场景');
    expect(markup).toContain('波波陪伴');
  });

  it('keeps the collaboration scene available as the static crew-aware option', () => {
    const markup = renderToStaticMarkup(createElement(BoboScenePicker, {
      value: 'collaboration',
      busy: true,
      onChange: vi.fn(),
    }));

    expect(markup).toContain('data-scene-id="collaboration"');
    expect(markup).toContain('data-motion="static"');
    expect(markup).toContain('按编队渲染');
    expect(markup).toContain('aria-busy="true"');
    expect(markup.match(/disabled=""/gu)).toHaveLength(BOBO_SCENE_OPTIONS.length);
  });

  it('keeps multiplayer scenes unselected but keyboard reachable while solo is active', () => {
    const markup = renderToStaticMarkup(createElement(BoboScenePicker, {
      value: null,
      onChange: vi.fn(),
    }));

    expect(markup).toContain('aria-label="选择多人运行背景"');
    expect(markup).not.toContain('aria-checked="true"');
    expect(markup.match(/tabindex="0"/gu)).toHaveLength(1);
  });
});
