import assert from 'node:assert/strict';
import { after, describe, test } from 'node:test';

import { expectRejected, expectWrite, pickDifferent } from './lib/assertions.mjs';
import { patchProject } from './lib/client.mjs';
import { enterpriseSkip, planSkip } from './lib/plan-features.mjs';
import { DESTRUCTIVE_SKIP, loadProfiles } from './lib/profiles.mjs';
import { createSession } from './lib/snapshot.mjs';

const profiles = await loadProfiles();

for (const profile of profiles) {
  describe(`access and domain settings: ${profile.id}`, () => {
    const session = createSession(profile);
    after(() => session.restore());

    const privateSiteSkip = DESTRUCTIVE_SKIP || planSkip(profile, 'password');

    describe('Who can view the site', () => {
      test('Choose who can view the site', { skip: privateSiteSkip }, async () => {
        await expectWrite(session, project => ({
          privacy: { view: pickDifferent(project.privacy.view, ['admin', 'public']) },
        }));
      });

      test(
        'Choose who can view the site: password without a password is rejected',
        { skip: planSkip(profile, 'password') },
        async () => {
          // Sent outside the session so restore never rewrites privacy.view, which can revoke share links.
          const res = await patchProject(profile.key, { privacy: { view: 'password' } });
          assert.ok(res.status >= 400 && res.status < 500, `expected a 4xx, got ${res.status}`);
        },
      );

      // The site password cannot be read back, so the original can never be restored.
      test('Set the site password', { skip: privateSiteSkip }, async () => {
        const res = await session.patch(
          { privacy: { password: `skill-test-${Date.now()}` } },
          { restoreWith: { 'privacy.password': null } },
        );
        assert.equal(res.status, 200, JSON.stringify(res.body));

        const updated = await session.current();
        assert.equal(updated.privacy.password, null, 'the site password should never be returned');
      });

      test('Choose who can view the site: password, sent with the password', { skip: privateSiteSkip }, async () => {
        const res = await session.patch(
          { privacy: { view: 'password', password: `skill-test-${Date.now()}` } },
          { restoreWith: { 'privacy.password': null } },
        );
        assert.equal(res.status, 200, JSON.stringify(res.body));

        const updated = await session.current();
        assert.equal(updated.privacy.view, 'password');
        assert.equal(updated.privacy.password, null);
      });
    });

    describe('Custom login', () => {
      test('Set up custom login: login and logout URLs', async () => {
        const stamp = Date.now();
        await expectWrite(session, () => ({
          custom_login: {
            login_url: `https://auth.example.com/login-${stamp}`,
            logout_url: `https://auth.example.com/logout-${stamp}`,
          },
        }));
      });

      test('Set up custom login: session length', async () => {
        await expectWrite(session, project => ({
          custom_login: { jwt_expiration_time: pickDifferent(project.custom_login.jwt_expiration_time, [60, 120]) },
        }));
      });

      test('Rotate the JWT secret: a chosen secret is ignored', async () => {
        await expectWrite(session, () => ({ custom_login: { jwt_secret: `skill-test-${Date.now()}` } }), {
          saved: false,
        });
      });

      test('Rotate the JWT secret', { skip: DESTRUCTIVE_SKIP }, async () => {
        const before = await session.current();
        const res = await session.patch({ custom_login: { jwt_secret: '' } });
        assert.equal(res.status, 200, JSON.stringify(res.body));

        const updated = await session.current();
        assert.ok(updated.custom_login.jwt_secret, 'a new secret should be generated');
        assert.notEqual(updated.custom_login.jwt_secret, before.custom_login.jwt_secret);
      });

      test('Choose who can view the site: custom_login', { skip: DESTRUCTIVE_SKIP || enterpriseSkip(profile) }, async () => {
        await expectWrite(session, () => ({
          privacy: { view: 'custom_login' },
          custom_login: { login_url: `https://auth.example.com/login-${Date.now()}` },
        }));
      });
    });

    describe('Personalized Docs webhook', () => {
      // An empty array is ignored, so the API cannot remove a webhook it adds.
      test('Set the login webhook: update an existing one', async t => {
        const project = await session.current();
        const existing = project.webhooks.find(webhook => webhook.action === 'login');
        if (!existing) {
          t.skip('no login webhook to update; adding one cannot be undone through the API');
          return;
        }
        await expectWrite(session, () => ({
          webhooks: [{ ...existing, url: `https://hooks.example.com/skill-test-${Date.now()}` }],
        }));
      });

      test('Set the login webhook', { skip: DESTRUCTIVE_SKIP }, async () => {
        const webhook = { action: 'login', timeout: 5000, url: `https://hooks.example.com/skill-test-${Date.now()}` };
        const res = await session.patch({ webhooks: [webhook] });
        assert.equal(res.status, 200, JSON.stringify(res.body));

        const updated = await session.current();
        assert.deepEqual(updated.webhooks.find(item => item.action === 'login'), webhook);
      });

      test('Set the login webhook: an empty array is ignored', async () => {
        const before = await session.current();
        const res = await session.patch({ webhooks: [] });
        assert.equal(res.status, 200, JSON.stringify(res.body));

        const updated = await session.current();
        assert.deepEqual(updated.webhooks, before.webhooks);
      });
    });

    describe('Sharing', () => {
      // Any change revokes every outstanding branch share link.
      test('Turn private branch share links on or off', { skip: DESTRUCTIVE_SKIP }, async () => {
        await expectWrite(session, project => ({
          privacy: { branches: pickDifferent(project.privacy.branches, ['disabled', 'enabled']) },
        }));
      });

      test('Choose who can view the /openapi page', async () => {
        await expectWrite(session, project => ({
          privacy: { openapi: pickDifferent(project.privacy.openapi, ['public', 'admin']) },
        }));
      });
    });

    describe('Domain', () => {
      test('Set the custom domain', { skip: DESTRUCTIVE_SKIP || planSkip(profile, 'custom_domain') }, async () => {
        const name = `skill-test-${Date.now()}.example.com`;
        const { after: updated } = await expectWrite(session, () => ({ custom_domain: { name } }));
        assert.equal(updated.custom_domain.validation.status, 'unvalidated');
      });

      test('Set the custom domain: a readme.io domain is rejected', { skip: planSkip(profile, 'custom_domain') }, async () => {
        await expectRejected(session, { custom_domain: { name: 'skill-test.readme.io' } });
      });

      test('Set the custom domain: target and validation are read-only', async () => {
        await expectWrite(
          session,
          () => ({
            custom_domain: {
              target: 'skill-test.example.com',
              validation: { status: 'validated', code: 'skilltest' },
            },
          }),
          { saved: false },
        );
      });

      test('Change the subdomain', { skip: DESTRUCTIVE_SKIP }, async () => {
        await expectWrite(session, project => ({
          subdomain: `${project.subdomain.slice(0, 20)}-st${Date.now() % 10000}`,
        }));
      });

      test('Change the subdomain: more than 30 characters is rejected', async () => {
        await expectRejected(session, { subdomain: 'skill-test-subdomain-over-thirty' });
      });

      test("Change the subdomain: another project's subdomain is rejected", async t => {
        const other = profiles.find(candidate => candidate.id !== profile.id);
        if (!other) {
          t.skip('needs a second configured profile');
          return;
        }
        await expectRejected(session, { subdomain: other.project.subdomain });
      });

      test('Set the minimum TLS version and HSTS: TLS', { skip: DESTRUCTIVE_SKIP }, async () => {
        await expectWrite(session, project => ({
          ssl: { min_tls_version: pickDifferent(project.ssl.min_tls_version, ['1.3', '1.2']) },
        }));
      });

      test('Set the minimum TLS version and HSTS: HSTS', { skip: DESTRUCTIVE_SKIP }, async () => {
        await expectWrite(session, project => ({ hsts: { include_subdomains: !project.hsts.include_subdomains } }));
      });
    });
  });
}
