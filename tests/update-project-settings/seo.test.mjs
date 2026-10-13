import { after, describe, test } from 'node:test';

import { expectRejected, expectWrite, pickDifferent } from './lib/assertions.mjs';
import { hasPlanFeature } from './lib/plan-features.mjs';
import { loadProfiles } from './lib/profiles.mjs';
import { createSession } from './lib/snapshot.mjs';

const profiles = await loadProfiles();

function toggle(value) {
  if (value === 'enabled') return 'disabled';
  return 'enabled';
}

for (const profile of profiles) {
  describe(`seo settings: ${profile.id}`, () => {
    const session = createSession(profile);
    after(() => session.restore());

    describe('Crawling and indexing', () => {
      test('Allow or block search engine crawlers', async () => {
        await expectWrite(session, project => ({ allow_crawlers: toggle(project.allow_crawlers) }));
      });

      test('Publish a sitemap.xml', async () => {
        await expectWrite(session, project => ({ sitemap: toggle(project.sitemap) }));
      });

      test('Use custom metadata titles as the page <title>', async () => {
        await expectWrite(session, project => ({
          seo: { overwrite_title_tag: toggle(project.seo.overwrite_title_tag) },
        }));
      });

      test('Set the canonical URL', async () => {
        await expectWrite(session, () => ({ canonical_url: `https://docs.example.com/skill-test-${Date.now()}` }));
      });

      test('Set the canonical URL: null restores the default', async () => {
        await expectWrite(session, () => ({ canonical_url: null }));
      });

      test('Set the canonical URL: a URL without a scheme is rejected', async () => {
        await expectRejected(session, { canonical_url: 'docs.example.com' });
      });
    });

    describe('Redirects and 404', () => {
      test('Manage redirects', async () => {
        await expectWrite(
          session,
          project => ({
            redirects: pickDifferent(project.redirects, [
              [{ from: '/docs/skill-test-old', to: '/docs/skill-test-new' }],
              [{ from: '/docs/skill-test-(.*)', to: '/docs/$1' }],
            ]),
          }),
          { saved: hasPlanFeature(profile, 'errors') },
        );
      });

      test('Set a custom 404 page', async () => {
        await expectWrite(
          session,
          project => ({
            pages: {
              not_found: pickDifferent(project.pages.not_found, [
                '/branches/stable/custom_pages/skill-test-404',
                '/branches/stable/custom_pages/skill-test-404-alt',
              ]),
            },
          }),
          { saved: hasPlanFeature(profile, 'errors') },
        );
      });

      test('Set a custom 404 page: a page outside the stable version is rejected', async t => {
        if (!hasPlanFeature(profile, 'errors')) {
          t.skip('plan lacks the errors feature, so the write is ignored');
          return;
        }
        await expectRejected(session, { pages: { not_found: '/branches/98.7.6/custom_pages/skill-test-404' } });
      });
    });

    describe('Search engine verification', () => {
      test('Set the Google or Bing verification code: Google', async () => {
        await expectWrite(session, () => ({
          integrations: { google: { site_verification: `skill-test-${Date.now()}` } },
        }));
      });

      test('Set the Google or Bing verification code: Bing', async () => {
        await expectWrite(session, () => ({ integrations: { bing: { verify: `SKILLTEST${Date.now()}` } } }));
      });

      test('Set the Google or Bing verification code: a pasted meta tag is rejected', async () => {
        await expectRejected(session, {
          integrations: { google: { site_verification: '<meta name="google-site-verification" content="abc" />' } },
        });
      });
    });
  });
}
