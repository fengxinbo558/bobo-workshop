import { readdir, readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

// These files recognize older data or test its upgrade; they do not emit an old brand.
const compatibilityFiles = new Set([
  'src/main/branding.ts',
  'src/main/branding.test.ts',
  'src/main/legacyMigration.ts',
  'src/main/legacyMigration.test.ts',
  'scripts/check-branding.mjs',
]);
const oldBrand = /noobi/iu;
const textExtensions = new Set(['.ts', '.tsx', '.cts', '.js', '.jsx', '.mjs', '.cjs', '.json', '.md', '.html', '.css', '.svg', '.yml', '.yaml', '.txt']);
const failures = [];
let inspected = 0;

async function inspect(path) {
  for (const entry of await readdir(path, { withFileTypes: true })) {
    const name = join(path === '.' ? '' : path, entry.name);
    if (entry.isSymbolicLink()) continue;
    if (oldBrand.test(name)) failures.push(`${name}: obsolete file or directory name`);
    if (entry.isDirectory()) await inspect(name);
    else if (entry.isFile() && textExtensions.has(extname(name)) && !compatibilityFiles.has(name)) {
      inspected++;
      if (oldBrand.test(await readFile(name, 'utf8'))) failures.push(`${name}: obsolete product identifier`);
    }
  }
}

for (const directory of ['src', 'scripts', 'docs', 'design', '.design', '.github', '.impeccable']) {
  await inspect(directory);
}
for (const entry of await readdir('.', { withFileTypes: true })) {
  if (entry.isFile() && textExtensions.has(extname(entry.name))) {
    inspected++;
    if (oldBrand.test(await readFile(entry.name, 'utf8'))) failures.push(`${entry.name}: obsolete product identifier`);
  }
}
if (failures.length) {
  process.stderr.write(`波波工坊品牌检查失败：\n${failures.join('\n')}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(`波波工坊品牌检查通过：${inspected} 个活动文本文件；旧数据兼容代码单独保留。\n`);
}
