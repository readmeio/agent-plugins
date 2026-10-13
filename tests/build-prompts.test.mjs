import assert from 'node:assert/strict';
import { test } from 'node:test';

import { PROMPTS, buildPrompts } from '../scripts/build-prompts.mjs';

const prompts = await buildPrompts();

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
