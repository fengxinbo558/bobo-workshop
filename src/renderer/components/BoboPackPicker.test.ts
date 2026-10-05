import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { BOBO_PACK_IDS } from '../../shared/contracts';
import {
  BOBO_PACK_OPTIONS,
  BoboPackPicker,
  boboPackGridColumnCount,
} from './BoboPackPicker';

describe('BoboPackPicker', () => {
  it('offers exactly every supported 波波 production pack', () => {
    expect(BOBO_PACK_OPTIONS.map((option) => option.id)).toEqual([...BOBO_PACK_IDS]);
  });

  it('derives keyboard navigation columns from the rendered grid', () => {
    vi.stubGlobal('getComputedStyle', vi.fn(() => ({
      gridTemplateColumns: '280px 280px',
    } as CSSStyleDeclaration)));

    expect(boboPackGridColumnCount({} as HTMLElement)).toBe(2);
    vi.unstubAllGlobals();
  });

  it('falls back to one navigation column before the grid is mounted', () => {
    expect(boboPackGridColumnCount(null)).toBe(1);
  });

  it('renders exactly one selected character without binding it to a scene preview', () => {
    const markup = renderToStaticMarkup(createElement(BoboPackPicker, {
      value: 'twilight',
      mode: 'global',
      presentation: 'character',
      onChange: vi.fn(),
    }));

    expect(markup).toContain('aria-label="选择默认 波波 角色"');
    expect(markup.match(/data-pack-kind="character"/gu)).toHaveLength(BOBO_PACK_IDS.length);
    expect(markup.match(/aria-checked="true"/gu)).toHaveLength(1);
    expect(markup).toContain('波波创意师');
    expect(markup).not.toContain('bobo-pack-scene-image');
  });
});
