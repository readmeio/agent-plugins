import { after, describe, test } from 'node:test';

import { expectRejected, expectWrite, pickDifferent } from './lib/assertions.mjs';
import { enterpriseSkip, hasPlanFeature } from './lib/plan-features.mjs';
import { loadProfiles } from './lib/profiles.mjs';
import { createSession } from './lib/snapshot.mjs';

const profiles = await loadProfiles();

function toggle(value) {
  return value === 'enabled' ? 'disabled' : 'enabled';
}

function flipExpanded(value) {
  return value === 'expanded' ? 'collapsed' : 'expanded';
}

function referenceWrite(session, field, next) {
  return expectWrite(session, project => ({ reference: { [field]: next(project.reference[field]) } }));
}

for (const profile of profiles) {
  describe(`api reference settings: ${profile.id}`, () => {
    const session = createSession(profile);
    after(() => session.restore());

    describe('Interactive explorer', () => {
      test('Choose which parts of the explorer are interactive: parameter inputs and Try It', async () => {
        await referenceWrite(session, 'param_inputs', current =>
          pickDifferent(current, ['inputs_only', 'try_it_only', 'none', 'all']),
        );
      });

      test('Choose which parts of the explorer are interactive: authentication', async () => {
        await referenceWrite(session, 'credentials', toggle);
      });

      test('Prefill parameters with default values', async () => {
        await referenceWrite(session, 'defaults', current =>
          pickDifferent(current, ['always_use', 'use_only_if_required']),
        );
      });

      for (const field of ['validate_required_fields', 'json_editor', 'fill_optional_objects_on_expand']) {
        let skip = false;
        if (field === 'json_editor') skip = enterpriseSkip(profile);
        test(`Tune how the request form behaves: ${field}`, { skip }, async () => {
          await referenceWrite(session, field, toggle);
        });
      }

      test('Turn the OAuth flows experience on or off', async () => {
        await referenceWrite(session, 'oauth_flows', toggle);
      });

      test('Show or hide request history', async () => {
        await referenceWrite(session, 'request_history', toggle);
      });
    });

    describe('Examples and code snippets', () => {
      for (const field of ['request_examples', 'response_examples', 'response_schemas']) {
        test(`Expand examples and schemas by default: ${field}`, async () => {
          await referenceWrite(session, field, flipExpanded);
        });
      }

      test('Offer SDK-generated Node.js snippets', async () => {
        await referenceWrite(session, 'api_sdk_snippets', toggle);
      });

      test('Show or hide the OpenAPI download button', async () => {
        await referenceWrite(session, 'show_openapi_download', toggle);
      });

      test('reference.sdk_snippets.external ignores writes', async () => {
        await expectWrite(
          session,
          project => ({
            reference: {
              sdk_snippets: { external: pickDifferent(project.reference.sdk_snippets.external, ['enabled', 'disabled']) },
            },
          }),
          { saved: false },
        );
      });
    });

    describe('Display', () => {
      const displayFields = {
        method_badge_style: current => pickDifferent(current, ['classic', 'modern']),
        show_method_in_sidebar: toggle,
        webhook_badge: current => pickDifferent(current, ['pill', 'none', 'icon']),
        flat_sections: toggle,
        param_font: current => pickDifferent(current, ['monospace', 'default']),
        oneof_layout: current => pickDifferent(current, ['tabs', 'dropdown']),
      };

      for (const [field, next] of Object.entries(displayFields)) {
        test(`Adjust how reference pages look: ${field}`, async () => {
          await referenceWrite(session, field, next);
        });
      }
    });

    describe('API Designer', () => {
      test('Allow or block editing in the API Designer', async () => {
        await expectWrite(session, project => ({
          api_designer: { allow_editing: toggle(project.api_designer.allow_editing) },
        }));
      });
    });

    describe('API status', () => {
      const saved = hasPlanFeature(profile, 'healthCheck');

      test('Show the API status to readers: manual', async () => {
        await expectWrite(
          session,
          project => ({
            health_check: {
              provider: 'manual',
              settings: {
                manual: {
                  status: pickDifferent(project.health_check.settings.manual.status, ['up', 'down']),
                  url: pickDifferent(project.health_check.settings.manual.url, [
                    'https://status.example.com/skill-test-a',
                    'https://status.example.com/skill-test-b',
                  ]),
                },
              },
            },
          }),
          { saved },
        );
      });

      // Real public Statuspage page IDs (GitHub, then Atlassian): ReadMe fetches the page on save.
      test('Show the API status to readers: Statuspage', async () => {
        await expectWrite(
          session,
          project => ({
            health_check: {
              provider: 'statuspage',
              settings: {
                statuspage: {
                  id: pickDifferent(project.health_check.settings.statuspage.id, ['kctbh9vrtdwd', '0f54fx204jpt']),
                },
              },
            },
          }),
          { saved },
        );
      });

      test('Show the API status to readers: an unknown Statuspage ID is rejected', async t => {
        if (!saved) {
          t.skip('plan lacks healthCheck, so the ID is never checked');
          return;
        }
        await expectRejected(session, {
          health_check: { provider: 'statuspage', settings: { statuspage: { id: 'skilltest-not-a-page' } } },
        });
      });

      test('Show the API status to readers: none', async () => {
        const project = await session.current();
        if (project.health_check.provider === 'none') {
          await session.patch({ health_check: { provider: 'manual' } });
        }
        await expectWrite(session, () => ({ health_check: { provider: 'none' } }), { saved });
      });
    });
  });
}
