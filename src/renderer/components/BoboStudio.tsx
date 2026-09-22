import type { NoobiCrewMember, NoobiCrewRole, NoobiPackId, NoobiSceneId, NoobiStageMode, PipelineStage, ProjectStatus } from '../../shared/contracts';
import { BOBO_ROLES, BOBO_PACK_IMAGES, boboStudio, boboHero } from '../boboAssets';
import { productionAssistantScene, productionCrewMembers } from '../productionAssistantState';

interface Props {
  stage: PipelineStage;
  status: ProjectStatus;
  crew?: readonly NoobiCrewMember[];
  stageMode?: NoobiStageMode;
  packId?: NoobiPackId;
  soloSceneId?: NoobiPackId;
  sceneId?: NoobiSceneId;
}

export function BoboStudio({stage, status, crew, stageMode = 'crew', packId = 'classic', soloSceneId = 'classic', sceneId = 'collaboration'}: Props) {
  const scene = productionAssistantScene(stage, status);
  const all = productionCrewMembers(stage, status, 4);
  const selected = stageMode === 'solo' ? [all.find(m => m.active) ?? all[0]!] : all.filter(m => !crew?.length || crew.some(c => c.role === m.role));
  const active = selected.find(m => m.active)?.role ?? selected[0]?.role;
  const running = status === 'running';
  const retreat = stageMode === 'crew' && sceneId === 'fishing';
  const stateLabel = status === 'completed' ? '制作完成' : status === 'failed' ? '需要处理' : status === 'waiting' ? '等待你的确认' : status === 'stopped' ? '已暂停' : running ? scene.headline : '伙伴已就位';
  return <section className={`bobo-studio production-diorama status-${status}`} data-stage={stage} data-stage-mode={stageMode} data-scene-mode={stageMode === 'solo' ? 'solo' : 'collaboration'} data-runtime-scene={stageMode === 'solo' ? soloSceneId : sceneId} data-noobi-pack={packId} aria-label="波波的制作工坊">
    <header className="bobo-studio-heading"><strong>波波的制作工坊</strong><span role="status">{stateLabel}</span></header>
    <div className="bobo-stage">
      <div className="workshop-map"><img src={retreat ? boboHero : boboStudio} alt={retreat ? '波波的休憩小屋' : '奶油色创作工坊'} /></div>
      {!retreat && selected.map((member, index) => {
        const role = member.role as NoobiCrewRole;
        const identity = stageMode === 'solo' ? packId : crew?.find(c => c.role === role)?.packId;
        const slot = stageMode === 'solo' ? 1 : all.findIndex(m => m.role === role);
        return <div key={role} className={`bobo-station${running && active === role ? ' is-working' : ''}`} data-crew-role={role} data-noobi-member-pack={identity ?? role} data-active={running && active === role} style={{left: `${3 + slot * 24}%`, animationDelay: `${index * 220}ms`}}>
          <img src={identity ? BOBO_PACK_IMAGES[identity] : BOBO_ROLES[role].image} alt={`${BOBO_ROLES[role].label}波波`} draggable={false} />
        </div>;
      })}
      {!retreat && <img className="bobo-desk-front" src={boboStudio} alt="" aria-hidden="true" />}
      {!retreat && <div className="bobo-station-labels">{selected.map(m => <span key={m.role} style={{left: `${14 + (stageMode === 'solo' ? 1 : all.findIndex(a => a.role === m.role)) * 24}%`}} data-active={running && active === m.role}>{BOBO_ROLES[m.role].label}<small>{running && active === m.role ? '进行中' : status === 'completed' ? '已完成' : '待命'}</small></span>)}</div>}
    </div>
    <p className="bobo-studio-caption">{scene.detail}</p>
  </section>;
}
