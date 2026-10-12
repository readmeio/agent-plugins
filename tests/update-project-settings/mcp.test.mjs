import assert from 'node:assert/strict';
import { after, describe, test } from 'node:test';

import { expectRejected, expectWrite, pickDifferent } from './lib/assertions.mjs';
import { loadProfiles } from './lib/profiles.mjs';
import { createSession } from './lib/snapshot.mjs';

const profiles = await loadProfiles();

function credential(clientId) {
  return {
    client_id: clientId,
    authorization_url: 'https://auth.example.com/authorize',
    token_url: 'https://auth.example.com/token',
    scopes: ['read', 'write'],
  };
}

for (const profile of profiles) {
  describe(`mcp settings: ${profile.id}`, () => {
    const session = createSession(profile);
    after(() => session.restore());

    describe('Server', () => {
      test('Turn the MCP server on or off', async () => {
        await expectWrite(session, project => ({
          mcp: { state: pickDifferent(project.mcp.state, ['disabled', 'enabled']) },
        }));
      });

      // The password cannot be read back, so only a project without one can be restored (to null).
      let passwordSkip = false;
      if (profile.project.mcp.has_password !== false) passwordSkip = 'project already has an MCP password';

      test('Password-protect the MCP server', { skip: passwordSkip }, async () => {
        // Lets restore verify the password was removed.
        session.track(['mcp.has_password']);
        const res = await session.patch(
          { mcp: { privacy: { password: `skill-test-${Date.now()}` } } },
          { restoreWith: { 'mcp.privacy.password': null } },
        );
        assert.equal(res.status, 200, JSON.stringify(res.body));
        const project = await session.current();
        assert.equal(project.mcp.has_password, true);
        assert.equal(project.mcp.privacy.password, null, 'the password must never be returned');
      });

      test('Remove the MCP password with null', { skip: passwordSkip }, async () => {
        const res = await session.patch({ mcp: { privacy: { password: null } } });
        assert.equal(res.status, 200, JSON.stringify(res.body));
        const project = await session.current();
        assert.equal(project.mcp.has_password, false);
      });

      test('mcp.has_password ignores writes', async () => {
        await expectWrite(session, project => ({ mcp: { has_password: !project.mcp.has_password } }), {
          saved: false,
        });
      });
    });

    describe('Endpoints and tools', () => {
      describe('Disable endpoints, or expose hidden and deprecated ones', () => {
        test('Disable endpoints with disabled_routes', async () => {
          await expectWrite(session, project => ({
            mcp: {
              disabled_routes: pickDifferent(project.mcp.disabled_routes, [
                ['skillTestOperation-skill-test.json'],
                ['otherSkillTestOperation-skill-test.json'],
              ]),
            },
          }));
        });

        test('Expose hidden or deprecated endpoints with explicitly_enabled_routes', async () => {
          await expectWrite(session, project => ({
            mcp: {
              disabled_routes: [],
              explicitly_enabled_routes: pickDifferent(project.mcp.explicitly_enabled_routes, [
                ['hiddenSkillTestOperation-skill-test.json'],
                ['deprecatedSkillTestOperation-skill-test.json'],
              ]),
            },
          }));
        });

        test('A disabled route is dropped from explicitly_enabled_routes', async () => {
          await expectWrite(
            session,
            () => ({
              mcp: {
                disabled_routes: ['bothSkillTestOperation-skill-test.json'],
                explicitly_enabled_routes: [
                  'bothSkillTestOperation-skill-test.json',
                  'hiddenSkillTestOperation-skill-test.json',
                ],
              },
            }),
            { expected: { 'mcp.explicitly_enabled_routes': ['hiddenSkillTestOperation-skill-test.json'] } },
          );
        });
      });

      test('Disable built-in tools', async () => {
        await expectWrite(session, project => ({
          mcp: { disabled_tools: pickDifferent(project.mcp.disabled_tools, [['search'], ['fetch']]) },
        }));
      });

      test('Add custom tools', async () => {
        await expectWrite(session, () => ({
          mcp: {
            custom_tools: [
              {
                title: `skill-test-tool-${Date.now()}`,
                description: 'Call before any POST request.',
                body: 'Validate the token with /auth/validate before calling anything else.',
              },
            ],
          },
        }));
      });
    });

    describe('OAuth', () => {
      // The map is replaced in full, so every write keeps the existing schemes; omitting client_secret keeps theirs.
      // Restore sends `existing` back, which drops only the temporary scheme.
      const existing = profile.project.mcp.oauth_credentials;
      const scheme = `skill_test_oauth_${Date.now()}`;

      test('Set OAuth credentials per security scheme', async () => {
        await expectWrite(
          session,
          () => ({
            mcp: {
              oauth_credentials: {
                ...existing,
                [scheme]: { ...credential('skill-test-client'), client_secret: 'skill-test-secret' },
              },
            },
          }),
          { expected: { 'mcp.oauth_credentials': { ...existing, [scheme]: credential('skill-test-client') } } },
        );
      });

      test('Omitting client_secret for a stored scheme is accepted and keeps the public fields', async () => {
        await expectWrite(session, () => ({
          mcp: { oauth_credentials: { ...existing, [scheme]: credential('skill-test-client-updated') } },
        }));
      });

      test('A new scheme without client_secret is rejected', async () => {
        await expectRejected(session, {
          mcp: { oauth_credentials: { ...existing, [`${scheme}_new`]: credential('skill-test-client') } },
        });
      });

      test('Customize the OAuth sign-in, success, and error pages', async () => {
        const stamp = Date.now();
        await expectWrite(session, () => ({
          mcp: {
            oauth_pages: {
              auth_url: `https://example.com/mcp/sign-in?t=${stamp}`,
              success_url: `https://example.com/mcp/success?t=${stamp}`,
              error_url: `https://example.com/mcp/error?t=${stamp}`,
            },
          },
        }));
      });

      test('Restore the default OAuth pages with null', async () => {
        await expectWrite(session, () => ({
          mcp: { oauth_pages: { auth_url: null, success_url: null, error_url: null } },
        }));
      });
    });

    describe('OpenAI app verification', () => {
      test('Set the OpenAI app challenge token', async () => {
        await expectWrite(session, () => ({ mcp: { openai_challenge_token: `skill-test-token-${Date.now()}` } }));
      });

      test('Clear the OpenAI app challenge token with an empty string', async () => {
        await expectWrite(session, () => ({ mcp: { openai_challenge_token: '' } }), {
          expected: { 'mcp.openai_challenge_token': null },
        });
      });

      test('A challenge token with whitespace is rejected', async () => {
        await expectRejected(session, { mcp: { openai_challenge_token: 'skill test token' } });
      });
    });
  });
}
