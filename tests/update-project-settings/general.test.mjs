import assert from 'node:assert/strict';
import { after, describe, test } from 'node:test';

import { expectRejected, expectWrite, pickDifferent } from './lib/assertions.mjs';
import { send } from './lib/client.mjs';
import { planSkip } from './lib/plan-features.mjs';
import { findProfile, loadProfiles } from './lib/profiles.mjs';
import { cleanUp, createSession } from './lib/snapshot.mjs';

const profiles = await loadProfiles();
const TEMP_VERSION = '99.0.0';

function ownTerms(project) {
  return project.glossary.filter(term => !term.inherited).map(({ term, definition }) => ({ term, definition }));
}

for (const profile of profiles) {
  describe(`general settings: ${profile.id}`, () => {
    const session = createSession(profile);
    let createdVersion = false;

    after(() =>
      cleanUp(
        () => session.restore(),
        async () => {
          if (!createdVersion) return;
          const res = await send(profile.key, 'DELETE', `v2/branches/${TEMP_VERSION}`);
          assert.equal(res.status, 204, `deleting version ${TEMP_VERSION} on ${profile.id}: ${JSON.stringify(res.body)}`);
        },
      ),
    );

    describe('Project identity', () => {
      test('Rename the project', async () => {
        await expectWrite(session, project => ({ name: `${project.name} skill-test` }));
      });

      test('Update the meta description', async () => {
        await expectWrite(session, () => ({ description: `Skill test description ${Date.now()}` }));
      });

      test('Update the meta description: null clears it', async () => {
        await expectWrite(session, () => ({ description: null }));
      });

      test('Set the "Go Home" company link', async () => {
        await expectWrite(session, () => ({ homepage_url: `https://example.com/skill-test-${Date.now()}` }));
      });
    });

    describe('Versions and pages', () => {
      test('Change the default version', async t => {
        const branches = await send(profile.key, 'GET', 'v2/branches');
        if (branches.body.data.length === 0) {
          t.skip('project has no versions (enterprise group parent)');
          return;
        }
        const created = await send(profile.key, 'POST', 'v2/branches', { json: { name: TEMP_VERSION, base: null } });
        assert.equal(created.status, 201, `creating version ${TEMP_VERSION}: ${JSON.stringify(created.body)}`);
        createdVersion = true;

        await expectWrite(session, () => ({ default_version: { name: TEMP_VERSION } }));
      });

      test('Change the default version: an unknown version is rejected', async () => {
        await expectRejected(session, { default_version: { name: '98.7.6' } });
      });

      test('Turn suggested edits on or off', async () => {
        await expectWrite(session, project => ({
          suggested_edits: project.suggested_edits === 'enabled' ? 'disabled' : 'enabled',
        }));
      });

      test('Set default visibility for new pages', async () => {
        await expectWrite(session, project => ({
          pages: {
            default_visibility: pickDifferent(project.pages.default_visibility, ['anyone_with_link', 'public']),
          },
        }));
      });
    });

    describe('Glossary and variables', () => {
      test('Manage glossary terms', { skip: planSkip(profile, 'glossary') }, async () => {
        const before = await session.current();
        const terms = [...ownTerms(before), { term: 'skill-test-term', definition: `Defined at ${Date.now()}` }];
        const res = await session.patch({ glossary: terms });
        assert.equal(res.status, 200, JSON.stringify(res.body));

        const updated = await session.current();
        assert.deepEqual(ownTerms(updated), terms);
      });

      test('Manage glossary terms: add through the glossary endpoint', { skip: planSkip(profile, 'glossary') }, async () => {
        // The glossary endpoint bypasses the session.
        session.track(['glossary']);
        const existing = ownTerms(await session.current());

        const added = { term: 'skill-test-merge', definition: `Merged at ${Date.now()}` };
        const res = await send(profile.key, 'PATCH', 'v2/projects/me/glossary', { json: { terms: [added] } });
        assert.equal(res.status, 200, JSON.stringify(res.body));

        const updated = await session.current();
        assert.deepEqual(ownTerms(updated), [added, ...existing]);
      });

      test('Set variable defaults', async () => {
        const variable = { name: 'skill_test_var', default: `value-${Date.now()}`, source: '' };
        const res = await session.patch({ variable_defaults: [{ id: '', ...variable }] });
        assert.equal(res.status, 200, JSON.stringify(res.body));

        const updated = await session.current();
        const saved = updated.variable_defaults.map(({ name, default: value, source }) => ({
          name,
          default: value,
          source,
        }));
        assert.deepEqual(saved, [variable]);
      });

      test("Set variable defaults: source 'custom' is rejected", async () => {
        await expectRejected(session, {
          variable_defaults: [{ id: '', name: 'skill_test_custom', default: 'x', source: 'custom' }],
        });
      });
    });

    describe('Page feedback and metrics', () => {
      test('Turn page-quality voting on or off', async () => {
        await expectWrite(session, project => ({
          metrics: { voting: { page_quality: { enabled: !project.metrics.voting.page_quality.enabled } } },
        }));
      });

      test('Turn email and company collection in metrics on or off', async () => {
        await expectWrite(session, project => ({ metrics: { pii: { enabled: !project.metrics.pii.enabled } } }));
      });
    });
  });
}

const parent = findProfile(profiles, 'enterprise-parent');
const child = findProfile(profiles, 'enterprise-child');

const inheritanceSkip = parent && child ? false : 'needs both enterprise profiles';

describe('general settings: enterprise inheritance', { skip: inheritanceSkip }, () => {
  if (inheritanceSkip) return;
  const parentSession = createSession(parent);
  const childSession = createSession(child);
  after(() =>
    cleanUp(
      () => parentSession.restore(),
      () => childSession.restore(),
    ),
  );

  test('A child shows parent glossary terms as inherited and keeps them when it writes its own', async () => {
    const groupTerm = { term: 'skill-test-group', definition: `Group term ${Date.now()}` };
    const parentProject = await parentSession.current();
    const parentRes = await parentSession.patch({ glossary: [...ownTerms(parentProject), groupTerm] });
    assert.equal(parentRes.status, 200, JSON.stringify(parentRes.body));

    const childBefore = await childSession.current();
    assert.ok(
      childBefore.glossary.some(term => term.term === groupTerm.term && term.inherited === true),
      'child should list the parent term with inherited: true',
    );

    const childTerms = [...ownTerms(childBefore), { term: 'skill-test-child', definition: 'Child term' }];
    const childRes = await childSession.patch({ glossary: childTerms });
    assert.equal(childRes.status, 200, JSON.stringify(childRes.body));

    const childAfter = await childSession.current();
    assert.deepEqual(ownTerms(childAfter), childTerms);
    assert.ok(childAfter.glossary.some(term => term.term === groupTerm.term && term.inherited === true));
  });

  test("A child's variable_defaults lists only its own variables", async () => {
    const variable = { id: '', name: 'skill_test_group_var', default: 'group', source: '' };
    const res = await parentSession.patch({ variable_defaults: [variable] });
    assert.equal(res.status, 200, JSON.stringify(res.body));

    const childProject = await childSession.current();
    assert.ok(!childProject.variable_defaults.some(item => item.name === variable.name));
  });
});
