import { after, describe, test } from 'node:test';

import { expectRejected, expectWrite, pickDifferent } from './lib/assertions.mjs';
import { loadProfiles } from './lib/profiles.mjs';
import { createSession } from './lib/snapshot.mjs';

const profiles = await loadProfiles();

for (const profile of profiles) {
  describe(`integrations: ${profile.id}`, () => {
    const session = createSession(profile);
    after(() => session.restore());

    describe('Analytics', () => {
      test('Connect an analytics tool: Google Analytics', async () => {
        await expectWrite(session, project => ({
          integrations: {
            google: { analytics: pickDifferent(project.integrations.google.analytics, ['G-SKILLTEST1', 'G-SKILLTEST2']) },
          },
        }));
      });

      test('Connect an analytics tool: a Google Analytics ID without a UA or G prefix is rejected', async () => {
        await expectRejected(session, { integrations: { google: { analytics: 'SKILLTEST-1' } } });
      });

      test('Connect an analytics tool: Heap', async () => {
        await expectWrite(session, project => ({
          integrations: { heap: { id: pickDifferent(project.integrations.heap.id, ['1234567890', '9876543210']) } },
        }));
      });

      test('Connect an analytics tool: Segment and its proxy domain', async () => {
        await expectWrite(session, project => ({
          integrations: {
            segment: {
              key: pickDifferent(project.integrations.segment.key, ['skilltest-write-key-a', 'skilltest-write-key-b']),
              domain: pickDifferent(project.integrations.segment.domain, ['seg-a.example.com', 'seg-b.example.com']),
            },
          },
        }));
      });

      test('Connect an analytics tool: Koala', async () => {
        await expectWrite(session, project => ({
          integrations: { koala: { key: pickDifferent(project.integrations.koala.key, ['pk_skilltesta', 'pk_skilltestb']) } },
        }));
      });

      test("Connect an analytics tool: a Koala key without the 'pk_' prefix is rejected", async () => {
        await expectRejected(session, { integrations: { koala: { key: 'skilltest' } } });
      });
    });

    describe('Support widgets', () => {
      test('Add the Intercom messenger', async () => {
        await expectWrite(session, project => ({
          integrations: {
            intercom: { app_id: pickDifferent(project.integrations.intercom.app_id, ['skilltest-a', 'skilltest-b']) },
          },
        }));
      });

      test('Add the Intercom messenger: identity verification', async () => {
        await expectWrite(session, project => ({
          integrations: {
            intercom: {
              secure_mode: {
                key: pickDifferent(project.integrations.intercom.secure_mode.key, ['skilltest-secret-a', 'skilltest-secret-b']),
                email_only: !project.integrations.intercom.secure_mode.email_only,
              },
            },
          },
        }));
      });

      test('Add the Zendesk widget', async () => {
        await expectWrite(session, project => ({
          integrations: {
            zendesk: { subdomain: pickDifferent(project.integrations.zendesk.subdomain, ['skilltest-a', 'skilltest-b']) },
          },
        }));
      });
    });

    describe('Other integrations', () => {
      test('Load an Adobe Fonts kit', async () => {
        await expectWrite(session, project => ({
          integrations: { typekit: { key: pickDifferent(project.integrations.typekit.key, ['skilltesta', 'skilltestb']) } },
        }));
      });

      test('Add the Localize.js widget', async () => {
        await expectWrite(session, project => ({
          integrations: { localize: { key: pickDifferent(project.integrations.localize.key, ['skilltest-a', 'skilltest-b']) } },
        }));
      });

      test('Protect forms with reCAPTCHA', async () => {
        await expectWrite(session, project => ({
          integrations: {
            recaptcha: {
              site_key: pickDifferent(project.integrations.recaptcha.site_key, ['skilltest-site-a', 'skilltest-site-b']),
              secret_key: pickDifferent(project.integrations.recaptcha.secret_key, [
                'skilltest-secret-a',
                'skilltest-secret-b',
              ]),
            },
          },
        }));
      });

      test('Store Postman credentials', async () => {
        await expectWrite(session, project => ({
          integrations: {
            postman: {
              key: pickDifferent(project.integrations.postman.key, ['skilltest-key-a', 'skilltest-key-b']),
              client_id: pickDifferent(project.integrations.postman.client_id, ['skilltest-id-a', 'skilltest-id-b']),
              client_secret: pickDifferent(project.integrations.postman.client_secret, [
                'skilltest-secret-a',
                'skilltest-secret-b',
              ]),
            },
          },
        }));
      });

      test('integrations.postman.is_connected ignores writes', async () => {
        await expectWrite(
          session,
          project => ({ integrations: { postman: { is_connected: !project.integrations.postman.is_connected } } }),
          { saved: false },
        );
      });
    });
  });
}
