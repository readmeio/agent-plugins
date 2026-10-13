#!/usr/bin/env node
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const authDir = join(repoRoot, 'skills', 'mcp-auth');
const promptsDir = join(repoRoot, 'prompts');
const distDir = join(repoRoot, 'dist');

export const PROMPTS = {
  all: ['cursor.md', 'claude-code.md', 'claude-chat.md', 'chatgpt-and-codex.md', 'other-agents.md'],
  claude: ['claude-code.md', 'claude-chat.md'],
  codex: ['chatgpt-and-codex.md'],
  cursor: ['cursor.md'],
  other: ['other-agents.md'],
};

const INTRO = `Set me up with the ReadMe skills and MCP server in this agent, then help me create my ReadMe project.

The instructions below call me "the user". Skip any step that is already done. When a step can only be done by me (in an app's UI, or in my own terminal so that my API key stays out of the chat), tell me exactly what to do and wait for me to confirm.`;

const OUTRO = `## After setup

Once the ReadMe skills are available and you can list tools from the ReadMe MCP server, use the \`setup-project\` skill to set me up with my new ReadMe account and project.

If the skills or MCP tools are not available yet because the client needs a restart or reload, tell me exactly what to restart. Once I have, I will resume this conversation or paste this prompt again - skip the steps that are already done.`;

// Matches `./file.md`, `clients/file.md` and [text](./file.md) references to other client files.
const FILE_REFERENCE = /\[([^\]]+)\]\((?:\.\/)?(?:clients\/)?([\w-]+\.md)\)|`(?:\.\/)?(?:clients\/)?([\w-]+\.md)`/g;
const LEFTOVER_REFERENCE = /(?:\.\/|clients\/)[\w-]+\.md|\]\([^)]*\.md\)/;

// A fence closes on the same character, at least as long as the opener, with nothing after it.
function fencedLines(lines) {
  let opener = null;
  return lines.map(line => {
    const fence = line.match(/^\s{0,3}(`{3,}|~{3,})(.*)$/);
    if (opener === null) {
      if (fence) opener = fence[1];
      return fence !== null;
    }
    if (fence && fence[1][0] === opener[0] && fence[1].length >= opener.length && fence[2].trim() === '') {
      opener = null;
    }
    return true;
  });
}

export function mapOutsideFences(markdown, transform) {
  const lines = markdown.split('\n');
  const fenced = fencedLines(lines);
  return lines.map((line, index) => (fenced[index] ? line : transform(line))).join('\n');
}

export function stripSection(markdown, heading) {
  const lines = markdown.split('\n');
  const fenced = fencedLines(lines);
  const start = lines.findIndex((line, index) => !fenced[index] && line.trim() === `## ${heading}`);
  if (start === -1) return markdown;
  let end = lines.findIndex((line, index) => index > start && !fenced[index] && /^#{1,2} /.test(line));
  if (end === -1) end = lines.length;
  lines.splice(start, end - start);
  return lines.join('\n');
}

function titleOf(markdown, file) {
  const match = markdown.match(/^# (.+)$/m);
  if (!match) throw new Error(`clients/${file} has no "# " heading`);
  return match[1].trim();
}

function sectionName(file, titles, included, source) {
  if (!included.includes(file)) {
    throw new Error(`${source} references clients/${file}, which is not part of this prompt`);
  }
  return `the "${titles[file]}" section`;
}

function rewriteReferences(markdown, titles, included, source) {
  const rewritten = mapOutsideFences(markdown, line =>
    line.replace(FILE_REFERENCE, (match, linkText, linkFile, codeFile) => {
      if (linkFile) return `${linkText} (${sectionName(linkFile, titles, included, source)})`;
      return sectionName(codeFile, titles, included, source);
    }),
  );
  mapOutsideFences(rewritten, line => {
    if (LEFTOVER_REFERENCE.test(line)) throw new Error(`${source} has an unresolved file reference: ${line.trim()}`);
    return line;
  });
  return rewritten;
}

function routingTable(clientsIndex, titles, included) {
  const rows = clientsIndex
    .split('\n')
    .filter(line => line.startsWith('|'))
    .filter((line, index) => {
      if (index < 2) return true;
      const target = line.match(/\(clients\/([\w-]+\.md)\)/);
      return target && included.includes(target[1]);
    })
    .map((line, index) => {
      if (index === 0) return line.replace('Reference', 'Section');
      return line.replace(/\[[^\]]+\]\(clients\/([\w-]+\.md)\)/, (match, file) => `"${titles[file]}"`);
    });
  return rows.join('\n');
}

export async function buildPrompts() {
  const clientFiles = (await readdir(join(authDir, 'clients'))).filter(file => file.endsWith('.md'));
  const sources = {};
  const titles = {};
  for (const file of clientFiles) {
    sources[file] = stripSection(await readFile(join(authDir, 'clients', file), 'utf8'), 'Before merge');
    titles[file] = titleOf(sources[file], file);
  }

  const covered = new Set(Object.values(PROMPTS).flat());
  const uncovered = clientFiles.filter(file => !covered.has(file));
  if (uncovered.length > 0) throw new Error(`Add clients/${uncovered.join(', clients/')} to PROMPTS in scripts/build-prompts.mjs`);
  const missing = [...covered].filter(file => !clientFiles.includes(file));
  if (missing.length > 0) throw new Error(`PROMPTS references missing clients/${missing.join(', clients/')}`);

  const clientsIndex = await readFile(join(authDir, 'CLIENTS.md'), 'utf8');
  const prompts = {};
  for (const [key, files] of Object.entries(PROMPTS)) {
    const parts = [INTRO];
    if (files.length > 1) {
      parts.push(
        `Work out which client and surface you are running in, then follow only the matching section below. If it is unclear, ask the user.\n\n${routingTable(clientsIndex, titles, files)}`,
      );
    }
    for (const file of files) {
      const body = rewriteReferences(sources[file], titles, files, `clients/${file}`);
      parts.push(mapOutsideFences(body.trim(), line => (/^#{1,5} /.test(line) ? `#${line}` : line)));
    }
    parts.push(OUTRO);
    prompts[key] = `${parts.join('\n\n')}\n`;
  }
  return prompts;
}

function moduleSource(prompts) {
  const entries = Object.entries(prompts).map(([key, text]) => `  ${key}: ${JSON.stringify(text)},`);
  return `export const setupPrompts = Object.freeze({\n${entries.join('\n')}\n});\n`;
}

function typesSource(prompts) {
  const keys = Object.keys(prompts).map(key => `'${key}'`).join(' | ');
  return `export type SetupPromptClient = ${keys};\n\nexport declare const setupPrompts: Readonly<Record<SetupPromptClient, string>>;\n`;
}

async function main() {
  const prompts = await buildPrompts();

  if (process.argv.includes('--check')) {
    const problems = [];
    const committed = (await readdir(promptsDir).catch(() => [])).filter(file => file.endsWith('.md'));
    for (const [key, text] of Object.entries(prompts)) {
      const current = await readFile(join(promptsDir, `${key}.md`), 'utf8').catch(() => null);
      if (current === null) problems.push(`missing: prompts/${key}.md`);
      else if (current !== text) problems.push(`differs: prompts/${key}.md`);
    }
    for (const file of committed) {
      if (!(basename(file, '.md') in prompts)) problems.push(`extra: prompts/${file}`);
    }
    if (problems.length > 0) {
      console.error('Generated prompts are out of date:');
      for (const problem of problems) console.error(`  ${problem}`);
      console.error('\nRun `node scripts/build-prompts.mjs` and commit the result.');
      process.exit(1);
    }
    console.log('Prompts are up to date');
    return;
  }

  await mkdir(promptsDir, { recursive: true });
  await mkdir(distDir, { recursive: true });
  for (const [key, text] of Object.entries(prompts)) {
    await writeFile(join(promptsDir, `${key}.md`), text);
  }
  await writeFile(join(distDir, 'index.js'), moduleSource(prompts));
  await writeFile(join(distDir, 'index.d.ts'), typesSource(prompts));
  console.log(`Wrote ${Object.keys(prompts).length} prompt(s) to ${relative(repoRoot, promptsDir)}/ and ${relative(repoRoot, distDir)}/`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
