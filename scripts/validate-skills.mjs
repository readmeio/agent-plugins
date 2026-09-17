#!/usr/bin/env node
import { readdir, readFile } from 'node:fs/promises';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SKILL_CHAR_LIMIT = 20000;

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const roots = ['skills', 'claude/skills', 'codex/skills', 'cursor/skills'];
const problems = [];

function parseFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) return null;
  const fields = {};
  for (const line of match[1].split(/\r?\n/)) {
    const field = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (field) fields[field[1]] = field[2].trim();
  }
  return fields;
}

for (const root of roots) {
  const dir = join(repoRoot, root);
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    problems.push(`${root}: directory is missing`);
    continue;
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const path = join(dir, entry.name, 'SKILL.md');
    const label = relative(repoRoot, path);
    let text;
    try {
      text = await readFile(path, 'utf8');
    } catch {
      problems.push(`${label}: skill directory has no SKILL.md`);
      continue;
    }

    if (text.length > SKILL_CHAR_LIMIT) {
      problems.push(`${label}: ${text.length} chars exceeds the ${SKILL_CHAR_LIMIT} limit`);
    }

    const frontmatter = parseFrontmatter(text);
    if (!frontmatter) {
      problems.push(`${label}: no YAML frontmatter`);
      continue;
    }
    if (!frontmatter.name) problems.push(`${label}: frontmatter has no name`);
    else if (frontmatter.name !== basename(dirname(path))) {
      problems.push(`${label}: name "${frontmatter.name}" does not match its directory`);
    }
    if (!frontmatter.description) problems.push(`${label}: frontmatter has no description`);
  }
}

if (problems.length > 0) {
  console.error('Skill validation failed:');
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}

console.log(`Validated frontmatter and size for skills in ${roots.join(', ')}`);
