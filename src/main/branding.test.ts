import { mkdtemp, mkdir, readFile, writeFile, rm, symlink, rename } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { afterEach, expect, it } from 'vitest';
import { auditGeneratedBranding, rebrandHostText } from './branding.js';
import { createWorkspaceTemplate, synchronizeWorkspaceHostPolicy, synchronizeBoboStarterBranding, synchronizeGodotPresentationPolicy } from './workspaceTemplate.js';
const roots: string[] = [];
async function root() { const p = await mkdtemp(join(tmpdir(), 'bobo-brand-')); roots.push(p); return p; }
afterEach(async () => { await Promise.all(roots.splice(0).map(p => rm(p, {recursive:true,force:true}))); });
const project = {id:'brand-test', name:'我的游戏', idea:'A short game', createdAt:'2026-09-23T00:00:00Z', model:null, targetFrameRate:60 as const};

it('creates both engine templates with the approved BoBo icon and clean public branding', async () => {
 for (const engine of ['web','godot'] as const) {
  const p=await root(); await createWorkspaceTemplate(p,{...project,engine});
  expect(await auditGeneratedBranding(p)).toEqual([]);
  expect((await readFile(join(p,'resources/bobo-runtime-icon.png'))).equals(await readFile(new URL('../../build/icon.png',import.meta.url)))).toBe(true);
  const instructions=await readFile(join(p,'AGENTS.md'),'utf8');
  expect(instructions).toContain('BoBo / 波波工坊');
  expect(instructions).toContain('bobo_image_generate');
  expect(instructions).not.toMatch(/Noobi|NOOBI|noobi-game-builder|noobi_image_generate/);
 }
});
it('finds old names in exported HTML and SVG but ignores immutable historical evidence', async () => {
 const p=await root();await mkdir(join(p,'dist'));await mkdir(join(p,'artifacts'));
 await writeFile(join(p,'dist/index.html'),'<title>NOOBI.AI</title>');
 await writeFile(join(p,'dist/icon.svg'),'<svg><text>Noobi</text></svg>');
 await writeFile(join(p,'artifacts/old.json'),'"Noobi.ai"');
 expect((await auditGeneratedBranding(p)).sort()).toEqual(['dist/icon.svg','dist/index.html']);
});
it('refuses to traverse symlinks while auditing public output', async () => {
 const p=await root();await symlink(await root(),join(p,'outside'));
 await expect(auditGeneratedBranding(p)).rejects.toThrow('symlink');
});
it('refreshes legacy policy, starter and icon without replacing gameplay or game title', async () => {
 const p=await root();await createWorkspaceTemplate(p,{...project,engine:'godot'});
 await rename(join(p,'.codex/skills/bobo-game-builder'),join(p,'.codex/skills/noobi-game-builder'));
 const agents=join(p,'AGENTS.md');await writeFile(agents,(await readFile(agents,'utf8')).replaceAll('BOBO:','NOOBI:').replaceAll('BoBo','Noobi.ai'));
 const gd=join(p,'scripts/main.gd');await writeFile(gd,'extends Node2D\n# my custom gameplay\nconst CREDIT="NOOBI.AI"\n');
 const cfg=join(p,'project.godot');await writeFile(cfg,(await readFile(cfg,'utf8')).replaceAll('bobo-runtime-icon.png','noobi-runtime-icon.svg'));
 await writeFile(join(p,'resources/noobi-runtime-icon.svg'),'<svg>legacy mascot</svg>');
 await synchronizeWorkspaceHostPolicy(p,project);await synchronizeBoboStarterBranding(p);await synchronizeGodotPresentationPolicy(p);
 expect(await readFile(join(p,'.codex/skills/bobo-game-builder/SKILL.md'),'utf8')).toContain('name: bobo-game-builder');
 expect(await readFile(gd,'utf8')).toContain('# my custom gameplay');
 expect(await readFile(gd,'utf8')).toContain('CREDIT="BoBo"');
 expect(await readFile(cfg,'utf8')).toContain('config/name="我的游戏"');
 expect(await auditGeneratedBranding(p)).toEqual([]);
 await synchronizeWorkspaceHostPolicy(p,project);await synchronizeBoboStarterBranding(p);
 expect(await auditGeneratedBranding(p)).toEqual([]);
});
it('preserves private compatibility paths while updating emitted tool and skill names',()=>{
 expect(rebrandHostText('Noobi.ai .noobi/project.json noobi_image_generate noobi-game-builder')).toBe('BoBo .noobi/project.json bobo_image_generate bobo-game-builder');
});
