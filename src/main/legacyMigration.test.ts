import { lstat, mkdir, mkdtemp, readFile, rename, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { ProjectStore } from './projectStore';
import type { BoboCrewMember } from '../shared/contracts';
import {
  LegacyMigrationError,
  migrateLegacyProjectDirectory,
  migrateLegacyProjectStore,
} from './legacyMigration';

const roots: string[] = [];
afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});
async function workspace(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'bobo-migration-'));
  roots.push(root);
  return root;
}
async function metadata(root: string, directory = '.noobi', fields: Record<string, unknown> = {}) {
  await mkdir(join(root, directory), { recursive: true });
  const value = { id: 'project-1', custom: { keep: true }, ...fields };
  await writeFile(join(root, directory, 'project.json'), JSON.stringify(value));
  return value;
}

describe('legacy project catalog migration', () => {
  it('retains personal settings, overrides, icons and unknown data without mutating input', () => {
    const value = {
      version: 1,
      projects: [{
        id: 'project-1',
        root: '/missing/moved-project',
        noobiPackOverrideId: 'twilight',
        noobiCrewOverride: [{ packId: 'classic', role: 'planner' }],
        icon: { path: '.noobi/icon.png', updatedAt: 'yesterday' },
        idea: 'Keep the string Noobi in my original user text.',
        custom: { preserved: 9 },
      }],
      settings: {
        defaultNoobiStageMode: 'solo',
        defaultNoobiSoloSceneId: 'starforge',
        defaultNoobiSceneId: 'fishing',
        defaultNoobiPackId: 'classic',
        defaultNoobiCrew: [{ packId: 'classic', role: 'engineer' }],
        theme: 'dark',
      },
      custom: ['untouched'],
    };
    const before = structuredClone(value);
    const migrated = migrateLegacyProjectStore(value);
    expect(migrated.changed).toBe(true);
    expect(value).toEqual(before);
    expect(migrated.value).toEqual({
      ...before,
      projects: [{
        id: 'project-1', root: '/missing/moved-project',
        boboPackOverrideId: 'twilight',
        boboCrewOverride: [{ packId: 'classic', role: 'planner' }],
        icon: { path: '.bobo/icon.png', updatedAt: 'yesterday' },
        idea: before.projects[0]!.idea, custom: { preserved: 9 },
      }],
      settings: {
        defaultBoboStageMode: 'solo', defaultBoboSoloSceneId: 'starforge',
        defaultBoboSceneId: 'fishing', defaultBoboPackId: 'classic',
        defaultBoboCrew: [{ packId: 'classic', role: 'engineer' }], theme: 'dark',
      },
    });
    expect(migrateLegacyProjectStore(migrated.value)).toEqual({ value: migrated.value, changed: false });
  });

  it('does not hide conflicting new and old values or silently choose one', () => {
    const value = { settings: { defaultNoobiPackId: 'classic', defaultBoboPackId: 'twilight' } };
    expect(() => migrateLegacyProjectStore(value)).toThrow(LegacyMigrationError);
    expect(value.settings).toEqual({ defaultNoobiPackId: 'classic', defaultBoboPackId: 'twilight' });
  });

  it('removes redundant legacy aliases when their values agree', () => {
    const value = { projects: [{ noobiCrewOverride: null, boboCrewOverride: null }] };
    expect(migrateLegacyProjectStore(value)).toEqual({
      value: { projects: [{ boboCrewOverride: null }] }, changed: true,
    });
  });

  it('leaves invalid schemas available for the catalog validator to reject', () => {
    for (const value of [null, [], 'invalid', { projects: 'invalid', settings: null }]) {
      expect(migrateLegacyProjectStore(value)).toEqual({ value, changed: false });
    }
  });
});

describe('legacy project directory migration', () => {
  it('moves all metadata files and upgrades structured fields; repeated calls are harmless', async () => {
    const root = await workspace();
    await metadata(root, '.noobi', {
      noobiPackOverrideId: 'classic', noobiCrewOverride: null,
      icon: { path: '.noobi/icon.png' },
    });
    await mkdir(join(root, '.noobi', 'playtests'));
    const bytes = Buffer.from([0, 255, 3, 120]);
    await writeFile(join(root, '.noobi', 'icon.png'), bytes);
    await writeFile(join(root, '.noobi', 'playtests', 'result.json'), '{"score":8}');
    await writeFile(join(root, 'game.js'), 'untouched game code');
    expect(await migrateLegacyProjectDirectory(root, 'project-1')).toEqual({ changed: true, status: 'migrated' });
    await expect(lstat(join(root, '.noobi'))).rejects.toMatchObject({ code: 'ENOENT' });
    expect(await readFile(join(root, '.bobo', 'icon.png'))).toEqual(bytes);
    expect(await readFile(join(root, '.bobo', 'playtests', 'result.json'), 'utf8')).toBe('{"score":8}');
    expect(await readFile(join(root, 'game.js'), 'utf8')).toBe('untouched game code');
    expect(JSON.parse(await readFile(join(root, '.bobo', 'project.json'), 'utf8'))).toEqual({
      id: 'project-1', custom: { keep: true }, boboPackOverrideId: 'classic',
      boboCrewOverride: null, icon: { path: '.bobo/icon.png' },
    });
    expect(await migrateLegacyProjectDirectory(root, 'project-1')).toEqual({ changed: false, status: 'current' });
  });

  it('keeps metadata bytes unchanged when only the directory needs renaming', async () => {
    const root = await workspace();
    await metadata(root);
    const before = await readFile(join(root, '.noobi', 'project.json'));
    await migrateLegacyProjectDirectory(root, 'project-1');
    expect(await readFile(join(root, '.bobo', 'project.json'))).toEqual(before);
  });

  it('can finish JSON migration after the directory was already renamed', async () => {
    const root = await workspace();
    await metadata(root, '.bobo', { noobiPackOverrideId: 'mosslight' });
    expect(await migrateLegacyProjectDirectory(root, 'project-1')).toEqual({ changed: true, status: 'current' });
    expect(JSON.parse(await readFile(join(root, '.bobo', 'project.json'), 'utf8'))).toHaveProperty('boboPackOverrideId', 'mosslight');
  });

  it('returns missing for moved workspaces or folders without metadata', async () => {
    const root = await workspace();
    expect(await migrateLegacyProjectDirectory(join(root, 'moved'), 'project-1')).toEqual({ changed: false, status: 'missing' });
    expect(await migrateLegacyProjectDirectory(root, 'project-1')).toEqual({ changed: false, status: 'missing' });
  });

  it('refuses both existing directories without overwriting any data', async () => {
    const root = await workspace();
    await metadata(root, '.noobi', { preserved: 'old' });
    await metadata(root, '.bobo', { preserved: 'new' });
    await expect(migrateLegacyProjectDirectory(root, 'project-1')).rejects.toThrow('两套元数据');
    expect(JSON.parse(await readFile(join(root, '.noobi', 'project.json'), 'utf8')).preserved).toBe('old');
    expect(JSON.parse(await readFile(join(root, '.bobo', 'project.json'), 'utf8')).preserved).toBe('new');
  });

  it('validates identity before moving or editing a workspace', async () => {
    const root = await workspace();
    await metadata(root);
    const before = await readFile(join(root, '.noobi', 'project.json'));
    await expect(migrateLegacyProjectDirectory(root, 'another-project')).rejects.toThrow('ID 不匹配');
    expect(await readFile(join(root, '.noobi', 'project.json'))).toEqual(before);
    await expect(lstat(join(root, '.bobo'))).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('does not move metadata when its structured values conflict', async () => {
    const root = await workspace();
    await metadata(root, '.noobi', { noobiPackOverrideId: 'classic', boboPackOverrideId: 'twilight' });
    await expect(migrateLegacyProjectDirectory(root, 'project-1')).rejects.toThrow(LegacyMigrationError);
    expect((await lstat(join(root, '.noobi'))).isDirectory()).toBe(true);
    await expect(lstat(join(root, '.bobo'))).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('rejects root, metadata and nested symlinks without following them', async () => {
    const root = await workspace();
    const actual = join(root, 'actual');
    await mkdir(actual);
    await metadata(actual);
    const rootLink = join(root, 'linked');
    await symlink(actual, rootLink);
    await expect(migrateLegacyProjectDirectory(rootLink, 'project-1')).rejects.toThrow('符号链接');
    const other = join(root, 'other');
    await mkdir(other);
    await symlink(join(actual, '.noobi'), join(other, '.noobi'));
    await expect(migrateLegacyProjectDirectory(other, 'project-1')).rejects.toThrow('符号链接');
    await symlink(join(root, 'nonexistent'), join(actual, '.noobi', 'dangerous-link'));
    await expect(migrateLegacyProjectDirectory(actual, 'project-1')).rejects.toThrow('符号链接');
    expect((await lstat(join(actual, '.noobi'))).isDirectory()).toBe(true);
  });

  it('wraps absent or corrupt metadata so ENOENT never resets the catalog', async () => {
    const root = await workspace();
    await mkdir(join(root, '.noobi'));
    try {
      await migrateLegacyProjectDirectory(root, 'project-1');
      expect.fail('migration should reject');
    } catch (error) {
      expect(error).toBeInstanceOf(LegacyMigrationError);
      expect(error).not.toHaveProperty('code', 'ENOENT');
    }
    await writeFile(join(root, '.noobi', 'project.json'), '{broken');
    await expect(migrateLegacyProjectDirectory(root, 'project-1')).rejects.toThrow('无法解析');
    expect(await readFile(join(root, '.noobi', 'project.json'), 'utf8')).toBe('{broken');
  });
});


describe('ProjectStore legacy migration integration', () => {
  it('restores a real legacy catalog and workspace with crew, settings, icon and files intact', async () => {
    const root = await workspace();
    const storageFile = join(root, 'catalog.json');
    const games = join(root, 'games');
    const original = new ProjectStore(storageFile, games);
    const created = await original.create({
      name: '保留我的游戏', idea: '保留现有玩法和美术资源', parentDirectory: games, engine: 'web',
    });
    const crew: BoboCrewMember[] = [
      { packId: 'classic', role: 'engineer' },
      { packId: 'twilight', role: 'tester' },
    ];
    const settings = await original.saveSettings({
      defaultBoboStageMode: 'solo', defaultBoboSoloSceneId: 'mosslight',
      defaultBoboSceneId: 'fishing', defaultBoboPackId: 'starforge',
      defaultBoboCrew: crew, theme: 'dark',
    });
    const icon = { path: '.bobo/icon.png', source: 'ai' as const, updatedAt: new Date().toISOString() };
    const expected = await original.update(created.id, {
      boboPackOverrideId: 'twilight', boboCrewOverride: crew, icon,
    });
    const iconBytes = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    await writeFile(join(created.root, '.bobo', 'icon.png'), iconBytes);
    await mkdir(join(created.root, '.bobo', 'playtests'));
    await writeFile(join(created.root, '.bobo', 'playtests', 'evidence.json'), '{"keep":true}');
    await writeFile(join(created.root, 'my-game.js'), 'const myGame = "keep all gameplay";');

    const catalog = JSON.parse(await readFile(storageFile, 'utf8')) as {
      projects: Array<Record<string, unknown>>; settings: Record<string, unknown>;
    };
    const record = catalog.projects[0]!;
    for (const [current, legacy] of [
      ['boboPackOverrideId', 'noobiPackOverrideId'],
      ['boboCrewOverride', 'noobiCrewOverride'],
    ]) {
      record[legacy!] = record[current!];
      delete record[current!];
    }
    (record.icon as Record<string, unknown>).path = '.noobi/icon.png';
    for (const key of Object.keys(catalog.settings)) {
      if (!key.startsWith('defaultBobo')) continue;
      catalog.settings[key.replace('defaultBobo', 'defaultNoobi')] = catalog.settings[key];
      delete catalog.settings[key];
    }
    await writeFile(storageFile, JSON.stringify(catalog));
    const metadataFile = join(created.root, '.bobo', 'project.json');
    const metadataValue = JSON.parse(await readFile(metadataFile, 'utf8'));
    await writeFile(metadataFile, JSON.stringify({
      ...metadataValue, noobiPackOverrideId: 'twilight', noobiCrewOverride: crew,
      icon: { ...icon, path: '.noobi/icon.png' },
    }));
    await rename(join(created.root, '.bobo'), join(created.root, '.noobi'));

    const restored = new ProjectStore(storageFile, games);
    await restored.init();
    expect(await restored.get(created.id)).toEqual(expected);
    expect(await restored.getSettings()).toEqual(settings);
    expect(await readFile(join(created.root, '.bobo', 'icon.png'))).toEqual(iconBytes);
    expect(await readFile(join(created.root, '.bobo', 'playtests', 'evidence.json'), 'utf8')).toBe('{"keep":true}');
    expect(await readFile(join(created.root, 'my-game.js'), 'utf8')).toBe('const myGame = "keep all gameplay";');
    await expect(lstat(join(created.root, '.noobi'))).rejects.toMatchObject({ code: 'ENOENT' });
    const persisted = await readFile(storageFile, 'utf8');
    expect(persisted).not.toMatch(/noobi/i);
    expect(await readFile(join(created.root, '.bobo', 'project.json'), 'utf8')).not.toMatch(/noobi/i);
    await restored.init();
    const restarted = new ProjectStore(storageFile, games);
    await restarted.init();
    expect(await restarted.get(created.id)).toEqual(expected);
    expect(await restarted.getSettings()).toEqual(settings);
    expect(await readFile(storageFile, 'utf8')).toBe(persisted);
  });

  it('retains the whole catalog when one workspace has moved and can initialize repeatedly', async () => {
    const root = await workspace();
    const storageFile = join(root, 'catalog.json');
    const games = join(root, 'games');
    const original = new ProjectStore(storageFile, games);
    const available = await original.create({ name: 'Available', idea: 'keep', parentDirectory: games, engine: 'web' });
    const missing = await original.create({ name: 'Moved', idea: 'keep too', parentDirectory: games, engine: 'web' });
    const movedPath = join(root, 'moved-in-finder');
    await rename(missing.root, movedPath);
    const persisted = JSON.parse(await readFile(storageFile, 'utf8'));
    persisted.settings.defaultNoobiPackId = persisted.settings.defaultBoboPackId;
    delete persisted.settings.defaultBoboPackId;
    await writeFile(storageFile, JSON.stringify(persisted));

    const restored = new ProjectStore(storageFile, games);
    await restored.init();
    await restored.init();
    expect((await restored.list()).map((project) => project.id).sort()).toEqual([available.id, missing.id].sort());
    expect((await restored.get(missing.id)).root).toBe(missing.root);
    expect((await lstat(join(movedPath, '.bobo', 'project.json'))).isFile()).toBe(true);
    const after = JSON.parse(await readFile(storageFile, 'utf8'));
    expect(after.projects).toHaveLength(2);
    expect(after.settings.defaultBoboPackId).toBe('classic');
    expect(after.settings).not.toHaveProperty('defaultNoobiPackId');
    const restarted = new ProjectStore(storageFile, games);
    expect(await restarted.list()).toHaveLength(2);
  });

  it('keeps healthy and damaged projects visible when metadata is corrupt or directories conflict', async () => {
    const root = await workspace();
    const storageFile = join(root, 'catalog.json');
    const games = join(root, 'games');
    const original = new ProjectStore(storageFile, games);
    const healthy = await original.create({ name: 'Healthy', idea: 'keep', parentDirectory: games, engine: 'web' });
    const corrupt = await original.create({ name: 'Corrupt', idea: 'keep too', parentDirectory: games, engine: 'web' });
    const conflict = await original.create({ name: 'Conflict', idea: 'keep both directories', parentDirectory: games, engine: 'web' });
    const brokenFile = join(corrupt.root, '.bobo', 'project.json');
    await writeFile(brokenFile, '{keep this broken metadata for recovery');
    const currentFile = join(conflict.root, '.bobo', 'project.json');
    const currentBytes = await readFile(currentFile);
    await mkdir(join(conflict.root, '.noobi'));
    const legacyFile = join(conflict.root, '.noobi', 'project.json');
    await writeFile(legacyFile, JSON.stringify({ id: conflict.id, keep: 'legacy metadata' }));
    const legacyBytes = await readFile(legacyFile);

    const restored = new ProjectStore(storageFile, games);
    await restored.init();
    expect((await restored.list()).map((project) => project.id).sort())
      .toEqual([healthy.id, corrupt.id, conflict.id].sort());
    expect((await restored.get(healthy.id)).lastError).toBeNull();
    expect((await restored.get(corrupt.id)).lastError).toContain('无法解析');
    expect((await restored.get(conflict.id)).lastError).toContain('两套元数据');
    expect(await readFile(brokenFile, 'utf8')).toBe('{keep this broken metadata for recovery');
    expect(await readFile(currentFile)).toEqual(currentBytes);
    expect(await readFile(legacyFile)).toEqual(legacyBytes);
    expect(JSON.parse(await readFile(storageFile, 'utf8')).projects).toHaveLength(3);
    const restarted = new ProjectStore(storageFile, games);
    expect(await restarted.list()).toHaveLength(3);
    expect(await readFile(currentFile)).toEqual(currentBytes);
    expect(await readFile(legacyFile)).toEqual(legacyBytes);
  });

});
