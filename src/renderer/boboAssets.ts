import planner from './assets/bobo/planner.png';
import artist from './assets/bobo/artist.png';
import engineer from './assets/bobo/engineer.png';
import tester from './assets/bobo/tester.png';
import studio from './assets/bobo/studio.png';
import hero from './assets/bobo/home-hero.png';
import icon from './assets/bobo/icon.png';
import type { NoobiCrewRole, NoobiPackId } from '../shared/contracts';

export const BOBO_ROLES: Record<NoobiCrewRole, { image: string; label: string; detail: string }> = {
  planner: { image: planner, label: '策划', detail: '帮你构思世界观和玩法' },
  artist: { image: artist, label: '画师', detail: '把想法变成好看的画面' },
  engineer: { image: engineer, label: '工程师', detail: '实现游戏逻辑与构建' },
  tester: { image: tester, label: '测试员', detail: '试玩、检查与反馈' },
};
// Retain persisted IDs so existing projects and upstream settings remain compatible.
export const BOBO_PACK_IMAGES: Record<NoobiPackId, string> = {
  classic: planner, mosslight: artist, starforge: tester, twilight: artist, hellokitty: engineer,
};
export { studio as boboStudio, hero as boboHero, icon as boboIcon };
