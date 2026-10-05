import React, { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';

import type { ProductionAssistantPose } from '../productionAssistantState';
import {
  advanceBoboFrame,
  boboManifestSources,
  boboRestFrameIndex,
  normalizedBoboFrameDuration,
  type BoboSpriteManifest,
} from '../boboAnimation';

interface BoboAnimatedSpriteProps {
  pose: ProductionAssistantPose;
  manifest: BoboSpriteManifest;
  playbackKey?: string;
  mini?: boolean;
  paused?: boolean;
  reducedMotion?: boolean;
}

const preloadedSources = new Set<string>();

export function BoboAnimatedSprite({
  pose,
  manifest,
  playbackKey = pose,
  mini = false,
  paused = false,
  reducedMotion = false,
}: BoboAnimatedSpriteProps) {
  const animation = manifest.animations[pose];
  const [frameIndex, setFrameIndex] = useState(() => (
    reducedMotion ? boboRestFrameIndex(animation) : 0
  ));
  const [finished, setFinished] = useState(false);
  const safeFrameIndex = Math.min(Math.max(0, frameIndex), Math.max(0, animation.frames.length - 1));
  const pivotStyle = useMemo(() => ({
    '--bobo-pivot-x': `${(manifest.canvas.pivot.x / manifest.canvas.width) * 100}%`,
    '--bobo-pivot-y': `${(manifest.canvas.pivot.y / manifest.canvas.height) * 100}%`,
  } as CSSProperties), [manifest.canvas]);

  useEffect(() => {
    if (typeof Image === 'undefined') return;
    for (const src of boboManifestSources(manifest)) {
      if (preloadedSources.has(src)) continue;
      const image = new Image();
      image.decoding = 'async';
      image.src = src;
      preloadedSources.add(src);
    }
  }, [manifest]);

  useEffect(() => {
    setFrameIndex(reducedMotion ? boboRestFrameIndex(animation) : 0);
    setFinished(false);
  }, [animation, manifest.id, playbackKey, reducedMotion]);

  useEffect(() => {
    if (paused || reducedMotion || finished || animation.frames.length <= 1) return undefined;
    const activeFrame = animation.frames[safeFrameIndex];
    if (!activeFrame) return undefined;

    const timer = window.setTimeout(() => {
      const next = advanceBoboFrame(animation, safeFrameIndex);
      setFrameIndex(next.frameIndex);
      setFinished(next.finished);
    }, normalizedBoboFrameDuration(activeFrame));
    return () => window.clearTimeout(timer);
  }, [animation, finished, paused, reducedMotion, safeFrameIndex]);

  return (
    <span
      className={`bobo-pixel-sprite${mini ? ' is-mini' : ''}`}
      data-manifest={manifest.id}
      data-pose={pose}
      data-frame-index={safeFrameIndex}
      data-frame-count={animation.frames.length}
      style={pivotStyle}
      role="presentation"
    >
      {animation.frames.map((frameItem, index) => (
        <img
          key={`${animation.id}:${index}:${frameItem.src}`}
          className="bobo-sprite-frame"
          data-active={index === safeFrameIndex ? 'true' : 'false'}
          src={frameItem.src}
          alt=""
          draggable={false}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}
