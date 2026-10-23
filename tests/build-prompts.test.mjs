import assert from 'node:assert/strict';
import { test } from 'node:test';

import { INSTALL_SKILL_NAME, PROMPTS, buildPrompts, mapOutsideFences, stripSection } from '../scripts/build-prompts.mjs';

const { prompts, installSkill } = await buildPrompts();

test('builds every prompt', () => {
  assert.deepEqual(Object.keys(prompts).sort(), Object.keys(PROMPTS).sort());
});

for (const [key, text] of Object.entries(prompts)) {
  test(`${key}: ends by handing off to setup-project`, () => {
    assert.match(text, /use the `setup-project` skill/);
  });

  test(`${key}: has no file references or unfinished notes`, () => {
    assert.doesNotMatch(text, /\]\([^)]*\.md\)|\.\/[\w-]+\.md/);
    assert.doesNotMatch(text, /Before merge|NEEDS_INPUT/);
  });
}

test('claude covers Claude Code and Claude Chat, with a routing table', () => {
  assert.match(prompts.claude, /^## Claude Code connection$/m);
  assert.match(prompts.claude, /^## Claude Chat connection$/m);
  assert.match(prompts.claude, /\| Claude Code CLI or the desktop Code tab \| "Claude Code connection" \|/);
  assert.doesNotMatch(prompts.claude, /Cursor connection/);
});

test('single-client prompts skip the routing table', () => {
  for (const key of ['codex', 'cursor', 'other']) {
    assert.doesNotMatch(prompts[key], /\| Environment \| Section \|/);
  }
});

test('all lists every client section', () => {
  const sections = prompts.all.match(/^## .+$/gm);
  assert.equal(sections.length, PROMPTS.all.length + 1);
});

test('install skill is manual-only and named after its directory', () => {
  const frontmatter = installSkill.match(/^---\n([\s\S]*?)\n---\n/);
  assert.ok(frontmatter, 'install skill has frontmatter');
  assert.match(frontmatter[1], new RegExp(`^name: ${INSTALL_SKILL_NAME}$`, 'm'));
  assert.match(frontmatter[1], /^description: .+$/m);
  assert.match(frontmatter[1], /^disable-model-invocation: true$/m);
});

test('install skill covers every client in the all prompt', () => {
  const clientHeadings = prompts.all.match(/^## .+$/gm).filter(heading => heading !== '## After setup');
  assert.equal(clientHeadings.length, PROMPTS.all.length);
  for (const heading of clientHeadings) {
    assert.ok(installSkill.includes(`\n${heading}\n`), `install skill is missing "${heading}"`);
  }
});

test('install skill speaks about the user, not as the user', () => {
  assert.match(installSkill, /^Set the user up with the ReadMe skills and MCP server/m);
  assert.doesNotMatch(installSkill, /Set me up|call me "the user"|tell me exactly/);
  assert.match(installSkill, /use the `setup-project` skill next/);
});

test('install skill has no file references or unfinished notes', () => {
  assert.doesNotMatch(installSkill, /\]\([^)]*\.md\)|\.\/[\w-]+\.md/);
  assert.doesNotMatch(installSkill, /Before merge|NEEDS_INPUT/);
});

test('leaves longer fences with nested fences untouched', () => {
  const markdown = ['# Title', '````md', '```sh', '# not a heading', '```', '## still code', '````', '## Heading'].join('\n');
  const demoted = mapOutsideFences(markdown, line => (line.startsWith('#') ? `#${line}` : line));
  assert.deepEqual(demoted.split('\n'), ['## Title', '````md', '```sh', '# not a heading', '```', '## still code', '````', '### Heading']);
});

test('only strips real sections, not fenced examples', () => {
  const markdown = ['# Title', '```md', '## Before merge', '```', 'kept', '## Before merge', 'dropped', '## Next', 'kept'].join('\n');
  assert.equal(stripSection(markdown, 'Before merge'), ['# Title', '```md', '## Before merge', '```', 'kept', '## Next', 'kept'].join('\n'));
});
