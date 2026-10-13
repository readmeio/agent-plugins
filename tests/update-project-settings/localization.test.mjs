import assert from 'node:assert/strict';
import { after, describe, test } from 'node:test';

import { expectRejected, expectWrite, pickDifferent } from './lib/assertions.mjs';
import { findProfile, loadProfiles } from './lib/profiles.mjs';
import { cleanUp, createSession } from './lib/snapshot.mjs';

const profiles = await loadProfiles();

function languagesWith(project, code) {
  const others = project.i18n.languages.filter(language => language.code !== project.i18n.defaultLanguage);
  return [{ code: project.i18n.defaultLanguage, type: 'manual' }, ...others, { code, type: 'manual' }];
}

function pickNewLanguage(project) {
  const codes = project.i18n.languages.map(language => language.code);
  return ['fr', 'de', 'es', 'ja'].find(code => !codes.includes(code));
}

for (const profile of profiles) {
  // Localization is stored on the enterprise group parent only: children read it, standalone projects have none.
  const isGroupParent = profile.id === 'enterprise-parent';

  describe(`localization settings: ${profile.id}`, () => {
    const session = createSession(profile);
    after(() => session.restore());

    // Notes merge per language and null deletes one, so restore only the touched languages.
    let originalContexts = profile.project.i18n.custom_contexts;
    if (!originalContexts) originalContexts = {};
    const contextsRestore = { 'i18n.custom_contexts': { fr: null, de: null } };
    for (const code of ['fr', 'de']) {
      if (code in originalContexts) contextsRestore['i18n.custom_contexts'][code] = originalContexts[code];
    }

    test('Turn translation on or off', async () => {
      await expectWrite(
        session,
        project => ({ i18n: { state: project.i18n.state === 'enabled' ? 'disabled' : 'enabled' } }),
        { saved: isGroupParent },
      );
    });

    test('Add or remove languages', async () => {
      await expectWrite(
        session,
        project => ({ i18n: { languages: languagesWith(project, pickNewLanguage(project)) } }),
        { saved: isGroupParent },
      );
    });

    test('The default language is always kept, first and manual', async t => {
      if (!isGroupParent) {
        t.skip('only the group parent stores localization');
        return;
      }
      const project = await session.current();
      const code = pickNewLanguage(project);
      const res = await session.patch({ i18n: { languages: [{ code, type: 'manual' }] } });
      assert.equal(res.status, 200, JSON.stringify(res.body));
      const updated = await session.current();
      assert.deepEqual(updated.i18n.languages, [
        { code: project.i18n.defaultLanguage, type: 'manual' },
        { code, type: 'manual' },
      ]);
    });

    test('Change the default language', async () => {
      await expectWrite(
        session,
        project => {
          const defaultLanguage = pickDifferent(project.i18n.defaultLanguage, ['es', 'fr']);
          return {
            i18n: {
              defaultLanguage,
              languages: [
                { code: defaultLanguage, type: 'manual' },
                { code: project.i18n.defaultLanguage, type: 'manual' },
              ],
            },
          };
        },
        { saved: isGroupParent },
      );
    });

    test('AI languages need ReadMe to unlock them', async t => {
      if (!isGroupParent) {
        t.skip('only the group parent stores localization');
        return;
      }
      const project = await session.current();
      const code = ['fr', 'de', 'es', 'ja'].find(candidate => !project.i18n.ai_unlocked_languages.includes(candidate));
      await expectRejected(session, {
        i18n: {
          languages: [
            { code: project.i18n.defaultLanguage, type: 'manual' },
            { code, type: 'ai' },
          ],
        },
      });
    });

    test('Keep words untranslated', async () => {
      await expectWrite(
        session,
        project => ({
          i18n: {
            do_not_translate_words: pickDifferent(project.i18n.do_not_translate_words, [
              ['SkillTestTerm', 'ReadMe'],
              ['SkillTestTerm'],
            ]),
          },
        }),
        { saved: isGroupParent },
      );
    });

    test('Untranslated words are trimmed and deduplicated ignoring case', async t => {
      if (!isGroupParent) {
        t.skip('only the group parent stores localization');
        return;
      }
      await expectWrite(
        session,
        () => ({ i18n: { do_not_translate_words: ['  SkillTestNorm  ', 'skilltestnorm', 'Other'] } }),
        { expected: { 'i18n.do_not_translate_words': ['SkillTestNorm', 'Other'] } },
      );
    });

    test('Give the translator guidance per language', async () => {
      const before = await session.current();
      const note = `Skill test note ${Date.now()}`;
      const res = await session.patch(
        { i18n: { custom_contexts: { fr: note } } },
        { restoreWith: contextsRestore },
      );
      assert.equal(res.status, 200, JSON.stringify(res.body));

      const updated = await session.current();
      if (isGroupParent) {
        assert.deepEqual(updated.i18n.custom_contexts, { ...before.i18n.custom_contexts, fr: note });
      } else {
        assert.deepEqual(updated.i18n.custom_contexts, before.i18n.custom_contexts);
      }
    });

    test('Translator guidance merges per language, and null removes one', async t => {
      if (!isGroupParent) {
        t.skip('only the group parent stores localization');
        return;
      }
      await session.patch({ i18n: { custom_contexts: { fr: 'Skill test fr' } } }, { restoreWith: contextsRestore });

      await session.patch({ i18n: { custom_contexts: { de: 'Skill test de' } } }, { restoreWith: contextsRestore });
      const merged = await session.current();
      assert.equal(merged.i18n.custom_contexts.fr, 'Skill test fr');
      assert.equal(merged.i18n.custom_contexts.de, 'Skill test de');

      await session.patch({ i18n: { custom_contexts: { fr: null } } }, { restoreWith: contextsRestore });
      const removed = await session.current();
      assert.equal(removed.i18n.custom_contexts.fr, undefined);
      assert.equal(removed.i18n.custom_contexts.de, 'Skill test de');
    });

    test('i18n.ai_unlocked_languages ignores writes', async () => {
      await expectWrite(
        session,
        project => ({
          i18n: { ai_unlocked_languages: pickDifferent(project.i18n.ai_unlocked_languages, [['fr'], ['de']]) },
        }),
        { saved: false },
      );
    });
  });
}

const parent = findProfile(profiles, 'enterprise-parent');
const child = findProfile(profiles, 'enterprise-child');

describe('localization settings: enterprise group', { skip: !(parent && child) && 'needs both enterprise profiles' }, () => {
  const parentSession = parent && createSession(parent);
  const childSession = child && createSession(child);
  after(() =>
    cleanUp(
      () => childSession.restore(),
      () => parentSession.restore(),
    ),
  );

  test('A parent change shows on the child', async () => {
    const { after: updated } = await expectWrite(parentSession, project => ({
      i18n: { do_not_translate_words: pickDifferent(project.i18n.do_not_translate_words, [['SkillGroupTerm'], []]) },
    }));
    const childProject = await childSession.current();
    assert.deepEqual(childProject.i18n.do_not_translate_words, updated.i18n.do_not_translate_words);
  });

  test('A child change leaves the parent unchanged', async () => {
    const { before } = await expectWrite(
      childSession,
      project => ({ i18n: { state: project.i18n.state === 'enabled' ? 'disabled' : 'enabled' } }),
      { saved: false },
    );
    const parentProject = await parentSession.current();
    assert.equal(parentProject.i18n.state, before.i18n.state);
  });
});
