import { lstat, readdir, readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

export const BOBO_BRAND_POLICY = `Product identity: BoBo / 波波工坊; the mascot is 波波, an orange-and-cream rounded little monster. Preserve the user's game title. Any platform credit, logo, watermark, loading screen, app title, export metadata or generated art must use this identity, never the upstream identity from old context. Use resources/bobo-runtime-icon.png for the approved platform logo. Game-specific artwork is welcome; no platform watermark is required in gameplay. Inspect generated images and final screenshots for stale names or mascots, and repair them before delivery. Private compatibility identifiers must not become visible branding.`;
export const BOBO_BRANDING_VERSION = 2;

// Old identifiers are confined to the upgrade boundary. New projects, tools,
// configuration and exports always use the current product identity.
export const LEGACY_BUILDER_SKILL = '.codex/skills/noobi-game-builder/SKILL.md';
export const LEGACY_RUNTIME_ICON = 'resources/noobi-runtime-icon.svg';
export const LEGACY_MEDIA_SECRET_PREFIX = 'noobi-media-provider-secret\nv1\n';

export function brandEnvironmentValue(name: string, environment: NodeJS.ProcessEnv = process.env): string | undefined {
  return environment[name] ?? environment[name.replace(/^BOBO_/, 'NOOBI_')];
}

export function applyLegacyEnvironmentAliases(environment: NodeJS.ProcessEnv = process.env): void {
  for (const [name, value] of Object.entries(environment)) {
    if (name.startsWith('NOOBI_')) environment[name.replace(/^NOOBI_/, 'BOBO_')] ??= value;
  }
}

export function currentToolName(name: string): string {
  return name.replace(/^noobi_/, 'bobo_');
}

export function currentReviewText(source: string): string {
  return source.replace(/NOOBI_REVIEW_VERDICT/gi, 'BOBO_REVIEW_VERDICT');
}

/** Upgrade host-owned instructions and presentation, including metadata paths. */
export function rebrandHostText(source: string): string {
  return source
    .replace(/noobi-runtime-icon\.svg/gi, 'bobo-runtime-icon.png')
    .replace(/\.noobi(?=\/)/g, '.bobo')
    .replace(/NOOBI_HOST_GENERATED_NEUTRAL_STARTER/g, 'BOBO_HOST_GENERATED_NEUTRAL_STARTER')
    .replace(/<!-- (?:NOOBI|BoBo):HOST-RUNTIME-POLICY:/g, '<!-- BOBO:HOST-RUNTIME-POLICY:')
    .replace(/noobi\.ai/gi, 'BoBo')
    .replace(/noobi_(?=asset_|audio_|image_|model3d_)/g, 'bobo_')
    .replace(/noobi-(?=browser-neutral|godot-4-neutral|game-builder|game\b)/g, 'bobo-')
    .replace(/\bnoobi\b/gi, 'BoBo');
}

const SKIP_DIRS = new Set(['.git', '.godot', '.bobo', '.noobi', '.codex', 'node_modules', 'artifacts', '.cache']);
const TEXT_EXTENSIONS = new Set(['.html', '.htm', '.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.css', '.gd', '.tscn', '.tres', '.godot', '.cfg', '.svg', '.json', '.webmanifest']);
const OLD_PUBLIC_BRAND = /noobi/iu;

/** Text/export gate. Bitmap logos are additionally checked by the visual reviewer. */
export async function auditGeneratedBranding(root: string): Promise<string[]> {
  const findings: string[] = [];
  let count = 0;
  let bytes = 0;
  async function walk(directory: string, relative: string, depth: number): Promise<void> {
    if (depth > 24) throw new Error('BoBo branding audit exceeded directory depth');
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (++count > 25000) throw new Error('BoBo branding audit exceeded file limit');
      const path = join(directory, entry.name);
      const label = relative ? `${relative}/${entry.name}` : entry.name;
      if (entry.isSymbolicLink()) throw new Error(`BoBo branding audit cannot inspect symlink: ${label}`);
      if (entry.isDirectory()) {
        // A user may create another game inside this game's parent directory.
        if (await lstat(join(path, '.bobo/project.json')).then(() => true, () => false)) continue;
        if (!SKIP_DIRS.has(entry.name)) await walk(path, label, depth + 1);
      } else if (entry.isFile() && TEXT_EXTENSIONS.has(extname(entry.name))) {
        const info = await lstat(path);
        if (info.size > 16 * 1024 * 1024 || (bytes += info.size) > 128 * 1024 * 1024) {
          throw new Error(`BoBo branding audit exceeded text size limit: ${label}`);
        }
        if (OLD_PUBLIC_BRAND.test(await readFile(path, 'utf8'))) findings.push(label);
      }
    }
  }
  await walk(root, '', 0);
  return findings;
}
