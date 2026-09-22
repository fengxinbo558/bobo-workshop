import { Check, ChevronDown, Sparkles } from 'lucide-react';
import React, { type KeyboardEvent } from 'react';

import type { NoobiPackId } from '../../shared/contracts';
import classicAvatar from '../assets/bobo/planner.png';
import classicScene from '../assets/bobo/studio.png';
import helloKittyAvatar from '../assets/bobo/engineer.png';
import helloKittyScene from '../assets/bobo/studio.png';
import mosslightAvatar from '../assets/bobo/artist.png';
import mosslightScene from '../assets/bobo/studio.png';
import starforgeAvatar from '../assets/bobo/tester.png';
import starforgeScene from '../assets/bobo/studio.png';
import twilightAvatar from '../assets/bobo/artist.png';
import twilightScene from '../assets/bobo/studio.png';

export interface NoobiPackOption {
  id: NoobiPackId;
  name: string;
  eyebrow: string;
  description: string;
  avatarLabel: string;
  avatarDescription: string;
  sceneDescription: string;
  sceneImage: string;
  avatarImage: string;
}

export const NOOBI_PACK_OPTIONS: readonly NoobiPackOption[] = [
  {
    id: 'classic',
    name: '奶油工坊',
    eyebrow: 'CLASSIC STUDIO',
    description: '暖木工作室与策划波波，适合大多数游戏制作任务。',
    avatarLabel: '波波策划师',
    avatarDescription: '热情、可靠的全能制作伙伴，适合陪你完成第一款游戏。',
    sceneDescription: '奶油色创作工作室，包含需求桌、装配台与试玩区。',
    sceneImage: classicScene,
    avatarImage: classicAvatar,
  },
  {
    id: 'mosslight',
    name: '橘子画室',
    eyebrow: 'BOBO ATELIER',
    description: '拿起画笔的波波，把想法变成有趣的画面。',
    avatarLabel: '波波画师',
    avatarDescription: '安静敏锐的自然系伙伴，擅长探索、地图与冒险题材。',
    sceneDescription: '奶油色共享工坊，陪你完善游戏画面。',
    sceneImage: mosslightScene,
    avatarImage: mosslightAvatar,
  },
  {
    id: 'starforge',
    name: '试玩工坊',
    eyebrow: 'BOBO PLAYTEST',
    description: '拿起手柄试玩，关注操作、反馈与游戏体验。',
    avatarLabel: '波波测试员',
    avatarDescription: '拿起手柄认真试玩，检查操作与游戏反馈。',
    sceneDescription: '奶油色共享工坊，为试玩与检查留出空间。',
    sceneImage: starforgeScene,
    avatarImage: starforgeAvatar,
  },
  {
    id: 'twilight',
    name: '灵感工坊',
    eyebrow: 'BOBO IDEAS',
    description: '与波波一起发想，探索不同的游戏主题。',
    avatarLabel: '波波创意师',
    avatarDescription: '和画师共享形象，陪你发想题材与视觉创意。',
    sceneDescription: '奶油色工坊与创意道具，为奇幻制作提供安静舞台。',
    sceneImage: twilightScene,
    avatarImage: twilightAvatar,
  },
  {
    id: 'hellokitty',
    name: '工程工坊',
    eyebrow: 'BOBO ENGINEERING',
    description: '打开电脑的波波，将玩法做成可以运行的游戏。',
    avatarLabel: '波波工程师',
    avatarDescription: '专注实现游戏逻辑，完成构建和问题修复。',
    sceneDescription: '明亮的温暖创作室，适合轻松、可爱和生活化的项目。',
    sceneImage: helloKittyScene,
    avatarImage: helloKittyAvatar,
  },
] as const;

export function noobiPackGridColumnCount(container: HTMLElement | null): number {
  if (!container) return 1;
  const tracks = getComputedStyle(container).gridTemplateColumns
    .split(/\s+/)
    .filter((track) => track && track !== 'none');
  return Math.max(1, tracks.length);
}

export function noobiPackLabel(id: NoobiPackId): string {
  return NOOBI_PACK_OPTIONS.find((option) => option.id === id)?.name ?? '奶油工坊';
}

interface NoobiPackPickerProps {
  value: NoobiPackId | null;
  globalValue?: NoobiPackId;
  mode: 'global' | 'project';
  variant?: 'cards' | 'compact';
  presentation?: 'bundle' | 'character';
  disabled?: boolean;
  busy?: boolean;
  onChange: (value: NoobiPackId | null) => void;
}

export function NoobiPackPicker({
  value,
  globalValue = 'classic',
  mode,
  variant = 'cards',
  presentation = 'bundle',
  disabled = false,
  busy = false,
  onChange,
}: NoobiPackPickerProps) {
  const resolvedValue = value ?? globalValue;
  const resolvedOption = NOOBI_PACK_OPTIONS.find((option) => option.id === resolvedValue)
    ?? NOOBI_PACK_OPTIONS[0];

  if (variant === 'compact') {
    return (
      <label
        className={`noobi-pack-compact is-${resolvedValue}${value === null ? ' is-inherited' : ''}`}
        title={disabled ? 'Agent 运行期间不能切换制作场景' : '选择这个项目的 波波 形象与制作场景'}
      >
        <span
          className="noobi-pack-compact-swatch"
          aria-hidden="true"
          style={{ backgroundImage: `url(${resolvedOption.sceneImage})` }}
        >
          <img src={resolvedOption.avatarImage} alt="" draggable={false} />
        </span>
        <span className="noobi-pack-compact-copy" aria-hidden="true">
          <small>{mode === 'global' ? '默认场景' : value === null ? '跟随全局' : '项目场景'}</small>
          <strong>{busy ? '保存中…' : noobiPackLabel(resolvedValue)}</strong>
        </span>
        <select
          aria-label="项目 波波 形象与制作场景"
          value={value ?? 'inherit'}
          disabled={disabled || busy}
          onChange={(event) => {
            const nextValue = event.target.value;
            onChange(nextValue === 'inherit' ? null : nextValue as NoobiPackId);
          }}
        >
          {mode === 'project' ? (
            <option value="inherit">跟随全局（当前：{noobiPackLabel(globalValue)}）</option>
          ) : null}
          {NOOBI_PACK_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>{option.name} · {option.avatarLabel}</option>
          ))}
        </select>
        <ChevronDown size={12} aria-hidden="true" />
      </label>
    );
  }

  const options: Array<NoobiPackOption & { inherited?: boolean }> = mode === 'project'
    ? [{
        ...NOOBI_PACK_OPTIONS.find((option) => option.id === globalValue)!,
        id: globalValue,
        name: `跟随全局 · ${noobiPackLabel(globalValue)}`,
        eyebrow: 'FOLLOW GLOBAL',
        description: '项目会自动使用设置中的全局默认主题包。',
        inherited: true,
      }, ...NOOBI_PACK_OPTIONS]
    : [...NOOBI_PACK_OPTIONS];

  function selectAt(index: number) {
    const option = options[index];
    if (!option) return;
    onChange(option.inherited ? null : option.id);
  }

  function handleArrowKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const container = event.currentTarget.parentElement;
    const columnCount = noobiPackGridColumnCount(container);
    let nextIndex = index;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = options.length - 1;
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + options.length) % options.length;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % options.length;
    if (event.key === 'ArrowUp') nextIndex = Math.max(0, index - columnCount);
    if (event.key === 'ArrowDown') nextIndex = Math.min(options.length - 1, index + columnCount);
    const nextButton = container?.querySelector<HTMLButtonElement>(`button[data-pack-index="${nextIndex}"]`);
    nextButton?.focus();
    selectAt(nextIndex);
  }

  return (
    <div
      className={`noobi-pack-picker mode-${mode} presentation-${presentation}`}
      role="radiogroup"
      aria-label={presentation === 'character'
        ? '选择默认 波波 角色'
        : mode === 'global' ? '默认 波波 形象与制作场景' : '项目 波波 形象与制作场景'}
      aria-busy={busy}
    >
      {options.map((option, index) => {
        const selected = option.inherited ? value === null : value === option.id;
        return (
          <button
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={presentation === 'character'
              ? `${option.avatarLabel}：${option.avatarDescription}`
              : `${option.name}：${option.description}`}
            data-pack-kind={presentation}
            data-pack-index={index}
            className={`noobi-pack-card pack-${option.id}${selected ? ' is-selected' : ''}${option.inherited ? ' is-inherited' : ''}`}
            key={option.inherited ? 'inherit' : option.id}
            disabled={disabled || busy}
            tabIndex={selected || (!options.some((item) => item.inherited ? value === null : value === item.id) && index === 0) ? 0 : -1}
            onKeyDown={(event) => handleArrowKey(event, index)}
            onClick={() => selectAt(index)}
          >
            <span
              className={`noobi-pack-preview${presentation === 'character' ? ' noobi-character-preview' : ''}`}
              aria-hidden="true"
            >
              {presentation === 'bundle' ? (
                <img
                  className="noobi-pack-scene-image"
                  src={option.sceneImage}
                  alt=""
                  draggable={false}
                />
              ) : <span className="noobi-character-pixel-grid" />}
              <img
                className={`noobi-pack-avatar-image${presentation === 'character' ? ' noobi-character-avatar-image' : ''}`}
                src={option.avatarImage}
                alt=""
                draggable={false}
              />
              {option.inherited ? <Sparkles className="noobi-pack-follow-icon" size={17} /> : null}
            </span>
            <span className="noobi-pack-card-copy">
              <small>{presentation === 'character' ? 'BOBO CHARACTER' : option.eyebrow}</small>
              <strong>{presentation === 'character' ? option.avatarLabel : option.name}</strong>
              <span>{presentation === 'character' ? option.avatarDescription : option.description}</span>
            </span>
            <span className="noobi-pack-check" aria-hidden="true"><Check size={13} /></span>
          </button>
        );
      })}
    </div>
  );
}
