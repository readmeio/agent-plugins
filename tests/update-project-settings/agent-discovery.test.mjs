import assert from 'node:assert/strict';
import { after, describe, test } from 'node:test';

import { expectWrite, pickDifferent } from './lib/assertions.mjs';
import { findProfile, loadProfiles } from './lib/profiles.mjs';
import { cleanUp, createSession } from './lib/snapshot.mjs';

const profiles = await loadProfiles();

const GROUP_ENFORCED = ['api_catalog', 'agent_skills_index', 'mcp_server_card'];
const MENU_OPTIONS = ['ask_ai', 'chatgpt', 'claude', 'clipboard', 'view_as_markdown'];
const MENU_MCP_OPTIONS = ['command', 'config', 'cursor', 'vscode'];

function flip(value) {
  return value === 'enabled' ? 'disabled' : 'enabled';
}

const parentProfile = findProfile(profiles, 'enterprise-parent');
const childProfile = findProfile(profiles, 'enterprise-child');

let inheritanceSkip = false;
if (!parentProfile || !childProfile) inheritanceSkip = 'needs both enterprise profiles';

describe('agent discovery: enterprise inheritance', { skip: inheritanceSkip }, () => {
  if (!parentProfile || !childProfile) return;
  const parent = createSession(parentProfile);
  const child = createSession(childProfile);
  after(() =>
    cleanUp(
      () => child.restore(),
      () => parent.restore(),
    ),
  );

  for (const field of GROUP_ENFORCED) {
    test(`A child always shows the parent's ai.discovery.${field}`, async () => {
      const before = await parent.current();
      const res = await parent.patch({ ai: { discovery: { [field]: !before.ai.discovery[field] } } });
      assert.equal(res.status, 200, JSON.stringify(res.body));
      const childProject = await child.current();
      assert.equal(childProject.ai.discovery[field], !before.ai.discovery[field]);
    });
  }

  test("A child's own llms_txt wins over the parent's", async () => {
    const childBefore = await child.current();
    const own = flip(childBefore.llms_txt);
    let res = await child.patch({ llms_txt: own });
    assert.equal(res.status, 200, JSON.stringify(res.body));
    res = await parent.patch({ llms_txt: flip(own) });
    assert.equal(res.status, 200, JSON.stringify(res.body));
    assert.equal((await child.current()).llms_txt, own);
  });

  test("A child's own custom llms.txt setting wins over the parent's", async () => {
    const childBefore = await child.current();
    const own = flip(childBefore.llms_txt_options.custom.enabled);
    let res = await child.patch({ llms_txt_options: { custom: { enabled: own } } });
    assert.equal(res.status, 200, JSON.stringify(res.body));
    res = await parent.patch({ llms_txt_options: { custom: { enabled: flip(own) } } });
    assert.equal(res.status, 200, JSON.stringify(res.body));
    assert.equal((await child.current()).llms_txt_options.custom.enabled, own);
  });

  test('A child with oauth.type null shows the parent OAuth metadata', async t => {
    const childBefore = await child.current();
    if (childBefore.ai.discovery.oauth.type !== null) {
      t.skip('child owns its OAuth block');
      return;
    }
    const issuer = `https://auth.example.com/group-${Date.now()}`;
    const res = await parent.patch({ ai: { discovery: { oauth: { type: 'oidc', issuer_url: issuer } } } });
    assert.equal(res.status, 200, JSON.stringify(res.body));
    const childProject = await child.current();
    assert.equal(childProject.ai.discovery.oauth.type, null);
    assert.equal(childProject.ai.discovery.oauth.issuer_url, issuer);
  });

  test('A child sets its own OAuth type, then null to follow the parent again', async t => {
    const parentProject = await parent.current();
    const childBefore = await child.current();
    if (childBefore.ai.discovery.oauth.type !== null) {
      t.skip('child owns its OAuth block');
      return;
    }
    const own = pickDifferent(parentProject.ai.discovery.oauth.type, ['oauth2', 'oidc']);
    let res = await child.patch({ ai: { discovery: { oauth: { type: own } } } });
    assert.equal(res.status, 200, JSON.stringify(res.body));
    const owning = await child.current();
    assert.equal(owning.ai.discovery.oauth.type, own);
    assert.equal(owning.ai.discovery.oauth.issuer_url, parentProject.ai.discovery.oauth.issuer_url);

    res = await child.patch({ ai: { discovery: { oauth: { type: null } } } });
    assert.equal(res.status, 200, JSON.stringify(res.body));
    const issuer = `https://auth.example.com/group-again-${Date.now()}`;
    res = await parent.patch({ ai: { discovery: { oauth: { issuer_url: issuer } } } });
    assert.equal(res.status, 200, JSON.stringify(res.body));
    const following = await child.current();
    assert.equal(following.ai.discovery.oauth.type, null);
    assert.equal(following.ai.discovery.oauth.issuer_url, issuer);
  });

  test("A child's ai.discovery write pins inherited fields to ReadMe defaults", async t => {
    const followed = [];
    for (const value of [false, true]) {
      const res = await parent.patch({ ai: { discovery: { show_sub_pages: value } } });
      assert.equal(res.status, 200, JSON.stringify(res.body));
      followed.push((await child.current()).ai.discovery.show_sub_pages === value);
    }
    if (!followed.every(Boolean)) {
      t.skip('child already stores its own show_sub_pages');
      return;
    }
    const inheriting = await child.current();
    const write = await child.patch({ ai: { discovery: { link_headers: !inheriting.ai.discovery.link_headers } } });
    assert.equal(write.status, 200, JSON.stringify(write.body));
    const pinned = await child.current();
    assert.equal(pinned.ai.discovery.show_sub_pages, false, 'show_sub_pages should fall back to its default');
  });
});

for (const profile of profiles) {
  describe(`agent discovery settings: ${profile.id}`, () => {
    const session = createSession(profile);
    after(() => session.restore());
    const isChild = Boolean(profile.project.parent);

    describe('llms.txt', () => {
      test('Turn llms.txt on or off', async () => {
        await expectWrite(session, project => ({ llms_txt: flip(project.llms_txt) }));
      });

      test('Split llms.txt per section', async () => {
        await expectWrite(session, project => ({
          llms_txt_options: { split: { enabled: flip(project.llms_txt_options.split.enabled) } },
        }));
      });

      test('Serve a custom llms.txt from the git repo', async () => {
        await expectWrite(session, project => ({
          llms_txt_options: { custom: { enabled: flip(project.llms_txt_options.custom.enabled) } },
        }));
      });
    });

    describe('Content signals', () => {
      describe('Set Content-Signal preferences', () => {
        for (const signal of ['ai_train', 'search', 'ai_input']) {
          test(`ai.discovery.content_signal.${signal}`, async () => {
            await expectWrite(session, project => ({
              ai: { discovery: { content_signal: { [signal]: !project.ai.discovery.content_signal[signal] } } },
            }));
          });
        }
      });
    });

    describe('Markdown for agents', () => {
      const operations = [
        ['Serve markdown to agents and advertise discovery links', ['markdown_negotiation', 'link_headers']],
        [
          'Add sub-page, sibling, and "What\'s next" links to markdown pages',
          ['show_sub_pages', 'show_sibling_pages', 'show_whats_next'],
        ],
        ['Turn the hidden agent hint on or off', ['agent_hint_banner']],
      ];

      for (const [operation, fields] of operations) {
        describe(operation, () => {
          for (const field of fields) {
            test(`ai.discovery.${field}`, async () => {
              await expectWrite(session, project => ({ ai: { discovery: { [field]: !project.ai.discovery[field] } } }));
            });
          }
        });
      }
    });

    describe('Well-known endpoints', () => {
      describe('Turn the API catalog, agent skills index, and MCP server card on or off', () => {
        for (const field of GROUP_ENFORCED) {
          test(`ai.discovery.${field}${isChild ? ' (ignored on a child)' : ''}`, async () => {
            await expectWrite(session, project => ({ ai: { discovery: { [field]: !project.ai.discovery[field] } } }), {
              saved: !isChild,
            });
          });
        }
      });

      test('Turn WebMCP on or off', async () => {
        await expectWrite(session, project => ({ ai: { discovery: { webmcp: !project.ai.discovery.webmcp } } }));
      });

      test('Advertise OAuth/OIDC discovery metadata', async () => {
        const stamp = Date.now();
        await expectWrite(session, project => ({
          ai: {
            discovery: {
              oauth: {
                type: pickDifferent(project.ai.discovery.oauth.type, ['oidc', 'oauth2']),
                issuer_url: `https://auth.example.com/${stamp}`,
                authorization_servers: [`https://auth.example.com/${stamp}`],
                resource_identifier: `https://api.example.com/${stamp}`,
                scopes_supported: ['read', 'write'],
              },
            },
          },
        }));
      });
    });

    describe('"Open with…" menu', () => {
      describe('Turn the "Open with…" menu on or off, and choose its entries', () => {
        test('appearance.ai.dropdown', async () => {
          await expectWrite(session, project => ({
            appearance: { ai: { dropdown: flip(project.appearance.ai.dropdown) } },
          }));
        });

        for (const option of MENU_OPTIONS) {
          test(`appearance.ai.options.${option}`, async () => {
            await expectWrite(session, project => ({
              appearance: { ai: { options: { [option]: flip(project.appearance.ai.options[option]) } } },
            }));
          });
        }

        for (const option of MENU_MCP_OPTIONS) {
          test(`appearance.ai.options.mcp.${option}`, async () => {
            await expectWrite(session, project => ({
              appearance: { ai: { options: { mcp: { [option]: flip(project.appearance.ai.options.mcp[option]) } } } },
            }));
          });
        }
      });
    });

    describe('Agent-readiness score (read-only)', () => {
      test('Check the agent-readiness score: ai.readiness ignores writes', async () => {
        await expectWrite(
          session,
          project => ({
            ai: { readiness: { status: pickDifferent(project.ai.readiness.status, ['completed', 'failed']) } },
          }),
          { saved: false },
        );
      });
    });
  });
}
