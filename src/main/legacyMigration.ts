import { constants, type Stats } from 'node:fs';
import { lstat, open, readdir, realpath, rename, unlink } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { isAbsolute, join, resolve } from 'node:path';
import { isDeepStrictEqual } from 'node:util';

// Old identifiers live here so current code and newly written data use one brand.
export const LEGACY_PROJECT_DIRECTORY = '.noobi';
export const CURRENT_PROJECT_DIRECTORY = '.bobo';
export const LEGACY_ENV_PREFIX = 'NOOBI_';

const PROJECT_KEYS = {
  noobiPackOverrideId: 'boboPackOverrideId',
  noobiCrewOverride: 'boboCrewOverride',
} as const;
const SETTINGS_KEYS = {
  defaultNoobiStageMode: 'defaultBoboStageMode',
  defaultNoobiSoloSceneId: 'defaultBoboSoloSceneId',
  defaultNoobiSceneId: 'defaultBoboSceneId',
  defaultNoobiPackId: 'defaultBoboPackId',
  defaultNoobiCrew: 'defaultBoboCrew',
} as const;
const MAX_METADATA_BYTES = 1024 * 1024;
const READ_NOFOLLOW = constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0);
const WRITE_EXCLUSIVE = constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL
  | (constants.O_NOFOLLOW ?? 0);

export class LegacyMigrationError extends Error {
  readonly recoverable = true;

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'LegacyMigrationError';
  }
}

export interface LegacyDirectoryMigration {
  changed: boolean;
  status: 'missing' | 'current' | 'migrated';
}

/** Pure, conservative migration: leaves user text and unknown fields untouched. */
export function migrateLegacyProjectStore<T>(value: T): { value: T; changed: boolean } {
  if (!isRecord(value)) return { value, changed: false };
  let changed = false;
  const next: Record<string, unknown> = { ...value };
  if (Array.isArray(value.projects)) {
    next.projects = value.projects.map((project) => {
      const migrated = migrateProjectRecord(project);
      changed ||= migrated.changed;
      return migrated.value;
    });
  }
  if (isRecord(value.settings)) {
    const migrated = renameKeys(value.settings, SETTINGS_KEYS);
    next.settings = migrated.value;
    changed ||= migrated.changed;
  }
  return { value: (changed ? next : value) as T, changed };
}

/**
 * Move only a verified host metadata directory. Missing/moved workspaces are
 * normal catalog entries, not a reason to create an empty replacement catalog.
 * A conflict is recoverable and must be surfaced without discarding the catalog.
 */
export async function migrateLegacyProjectDirectory(
  root: string,
  expectedProjectId?: string,
): Promise<LegacyDirectoryMigration> {
  if (!isAbsolute(root)) throw new LegacyMigrationError('项目迁移需要绝对路径。');
  if (expectedProjectId !== undefined && !expectedProjectId.trim()) {
    throw new LegacyMigrationError('项目迁移需要有效的项目 ID。');
  }
  try {
    const lexicalRoot = resolve(root);
    const rootInfo = await optionalLstat(lexicalRoot);
    if (!rootInfo) return { changed: false, status: 'missing' };
    assertDirectory(rootInfo, '项目文件夹');
    const canonicalRoot = await realpath(lexicalRoot);
    const legacy = join(canonicalRoot, LEGACY_PROJECT_DIRECTORY);
    const current = join(canonicalRoot, CURRENT_PROJECT_DIRECTORY);
    const legacyInfo = await optionalLstat(legacy);
    const currentInfo = await optionalLstat(current);
    if (legacyInfo && currentInfo) {
      throw new LegacyMigrationError('项目存在两套元数据目录；已保留全部文件，请先合并或移走重复目录后重试。');
    }
    if (!legacyInfo && !currentInfo) return { changed: false, status: 'missing' };
    const metadataDirectory = legacyInfo ? legacy : current;
    assertDirectory((legacyInfo ?? currentInfo)!, '项目元数据目录');
    await assertNoSymbolicLinks(metadataDirectory);
    const metadataPath = join(metadataDirectory, 'project.json');
    const metadata = await readMetadata(metadataPath, expectedProjectId);
    const migrated = migrateProjectRecord(metadata.value);

    // All validation completes before the first mutation. Never merge directories.
    let destination = metadataDirectory;
    if (legacyInfo) {
      if (await optionalLstat(current)) {
        throw new LegacyMigrationError('迁移目标目录已出现；已保留原文件，请重试。');
      }
      await rename(legacy, current);
      destination = current;
    }
    if (migrated.changed) {
      await replaceMetadata(join(destination, 'project.json'), migrated.value, metadata.info);
    }
    return { changed: Boolean(legacyInfo) || migrated.changed, status: legacyInfo ? 'migrated' : 'current' };
  } catch (error) {
    if (error instanceof LegacyMigrationError) throw error;
    // Do not leak ENOENT to catalog initialization's create-new-store branch.
    throw new LegacyMigrationError('项目数据迁移未完成，已有文件已保留，可修复路径或访问问题后重试。', { cause: error });
  }
}

function migrateProjectRecord(value: unknown): { value: unknown; changed: boolean } {
  if (!isRecord(value)) return { value, changed: false };
  const migrated = renameKeys(value, PROJECT_KEYS);
  const icon = migrated.value.icon;
  if (!isRecord(icon)) return migrated;
  const nextIcon = { ...icon };
  let iconChanged = false;
  for (const key of ['path', 'relativePath']) {
    if (icon[key] === '.noobi/icon.png' || icon[key] === '.noobi\\icon.png') {
      nextIcon[key] = '.bobo/icon.png';
      iconChanged = true;
    }
  }
  return iconChanged
    ? { value: { ...migrated.value, icon: nextIcon }, changed: true }
    : migrated;
}

function renameKeys(
  value: Record<string, unknown>,
  keys: Readonly<Record<string, string>>,
): { value: Record<string, unknown>; changed: boolean } {
  const next = { ...value };
  let changed = false;
  for (const [oldKey, newKey] of Object.entries(keys)) {
    if (!Object.hasOwn(value, oldKey)) continue;
    if (Object.hasOwn(value, newKey) && !isDeepStrictEqual(value[oldKey], value[newKey])) {
      throw new LegacyMigrationError(`项目设置存在重复且不同的 ${newKey} 值；已保留原数据，请确认后重试。`);
    }
    next[newKey] = value[oldKey];
    delete next[oldKey];
    changed = true;
  }
  return { value: changed ? next : value, changed };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

async function optionalLstat(path: string) {
  try {
    return await lstat(path);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw error;
  }
}

function assertDirectory(info: Awaited<ReturnType<typeof lstat>>, label: string): void {
  if (info.isSymbolicLink() || !info.isDirectory()) {
    throw new LegacyMigrationError(`${label}必须是真实目录，不能使用符号链接。`);
  }
}

async function assertNoSymbolicLinks(directory: string): Promise<void> {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    const info = await lstat(path);
    if (info.isSymbolicLink()) throw new LegacyMigrationError('项目元数据包含符号链接，已停止迁移并保留全部文件。');
    if (info.isDirectory()) await assertNoSymbolicLinks(path);
    else if (!info.isFile()) throw new LegacyMigrationError('项目元数据包含不支持的特殊文件，已停止迁移。');
  }
}

async function readMetadata(path: string, expectedProjectId?: string) {
  const handle = await open(path, READ_NOFOLLOW);
  try {
    const info = await handle.stat();
    if (!info.isFile() || info.size > MAX_METADATA_BYTES) {
      throw new LegacyMigrationError('项目标记文件无效或过大，已停止迁移。');
    }
    let value: unknown;
    try { value = JSON.parse(await handle.readFile('utf8')); }
    catch (error) { throw new LegacyMigrationError('项目标记文件无法解析，已停止迁移。', { cause: error }); }
    if (!isRecord(value) || typeof value.id !== 'string' || !value.id.trim()
      || (expectedProjectId !== undefined && value.id !== expectedProjectId)) {
      throw new LegacyMigrationError('所选文件夹不属于当前游戏（项目 ID 不匹配），已停止迁移；请选择正确的游戏文件夹。');
    }
    return { value, info };
  } finally { await handle.close(); }
}

async function replaceMetadata(
  path: string,
  value: unknown,
  original: Stats,
): Promise<void> {
  const temporary = `${path}.migration-${randomUUID()}`;
  const handle = await open(temporary, WRITE_EXCLUSIVE, original.mode & 0o777);
  try {
    await handle.writeFile(`${JSON.stringify(value, null, 2)}\n`);
    await handle.sync();
  } catch (error) {
    await handle.close();
    await unlink(temporary).catch(() => undefined);
    throw error;
  }
  await handle.close();
  try {
    const current = await lstat(path);
    if (current.isSymbolicLink() || current.ino !== original.ino || current.dev !== original.dev) {
      throw new LegacyMigrationError('项目标记在迁移期间发生变化，已停止更新并保留原文件。');
    }
    await rename(temporary, path);
  } finally {
    await unlink(temporary).catch(() => undefined);
  }
}
