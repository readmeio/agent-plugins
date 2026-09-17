#!/usr/bin/env node
import { readdir, readFile, mkdir, copyFile, rm } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(repoRoot, 'skills');
const hosts = ['claude', 'codex', 'cursor'];

async function listFiles(root) {
  const found = [];
  async function walk(dir) {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch (error) {
      if (error.code === 'ENOENT') return;
      throw error;
    }
    for (const entry of entries) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) await walk(full);
      else found.push(relative(root, full));
    }
  }
  await walk(root);
  return found.sort();
}

async function sameContent(a, b) {
  const [left, right] = await Promise.all([readFile(a), readFile(b)]);
  return left.equals(right);
}

const sourceFiles = await listFiles(source);
if (sourceFiles.length === 0) {
  console.error(`No skills found in ${relative(repoRoot, source)}`);
  process.exit(1);
}

const check = process.argv.includes('--check');
const problems = [];

for (const host of hosts) {
  const target = join(repoRoot, host, 'skills');
  const targetFiles = await listFiles(target);
  const extras = targetFiles.filter((file) => !sourceFiles.includes(file));

  for (const file of sourceFiles) {
    const from = join(source, file);
    const to = join(target, file);
    if (check) {
      if (!targetFiles.includes(file)) problems.push(`missing: ${host}/skills/${file}`);
      else if (!(await sameContent(from, to))) problems.push(`differs: ${host}/skills/${file}`);
      continue;
    }
    await mkdir(dirname(to), { recursive: true });
    await copyFile(from, to);
  }

  for (const file of extras) {
    if (check) problems.push(`extra: ${host}/skills/${file}`);
    else await rm(join(target, file));
  }
}

if (!check) {
  for (const host of hosts) {
    const target = join(repoRoot, host, 'skills');
    for (const entry of await readdir(target, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const contents = await listFiles(join(target, entry.name));
      if (contents.length === 0) await rm(join(target, entry.name), { recursive: true });
    }
  }
  console.log(`Synced ${sourceFiles.length} file(s) to ${hosts.join(', ')}`);
  process.exit(0);
}

if (problems.length > 0) {
  console.error('Generated skills are out of sync with skills/:');
  for (const problem of problems) console.error(`  ${problem}`);
  console.error('\nRun `node scripts/sync-skills.mjs` and commit the result.');
  process.exit(1);
}

console.log(`Skills are in sync across ${hosts.join(', ')}`);
