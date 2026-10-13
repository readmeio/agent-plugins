import { after, describe, test } from 'node:test';

import { expectRejected, expectWrite, pickDifferent } from './lib/assertions.mjs';
import { loadProfiles } from './lib/profiles.mjs';
import { createSession } from './lib/snapshot.mjs';

const profiles = await loadProfiles();

for (const profile of profiles) {
  describe(`ai settings: ${profile.id}`, () => {
    const session = createSession(profile);
    after(() => session.restore());

    describe('Ask AI', () => {
      test('Turn Ask AI on or off', async () => {
        await expectWrite(session, project => ({ ai: { owlbot: { enabled: !project.ai.owlbot.enabled } } }));
      });

      test('Choose where Ask AI appears', async () => {
        await expectWrite(session, project => ({
          ai: { owlbot: { placements: pickDifferent(project.ai.owlbot.placements, [['floating'], ['header', 'floating']]) } },
        }));
      });

      test('An empty placements array hides every surface but leaves Ask AI enabled', async () => {
        const { before, after: updated } = await expectWrite(session, () => ({ ai: { owlbot: { placements: [] } } }));
        if (updated.ai.owlbot.enabled !== before.ai.owlbot.enabled) {
          throw new Error('emptying placements changed ai.owlbot.enabled');
        }
      });
    });

    describe('In-product AI agent', () => {
      test('Give the agent custom knowledge', async () => {
        await expectWrite(session, () => ({
          ai: { chat: { knowledge: { custom_knowledge: `Skill test knowledge ${Date.now()}` } } },
        }));
      });

      test('Clear custom knowledge with null', async () => {
        await expectWrite(session, () => ({ ai: { chat: { knowledge: { custom_knowledge: null } } } }));
      });

      test('Custom knowledge over the length limit is rejected', async () => {
        await expectRejected(session, { ai: { chat: { knowledge: { custom_knowledge: 'x'.repeat(100001) } } } });
      });

      test('Let the agent search project content', async () => {
        await expectWrite(session, project => ({
          ai: { chat: { knowledge: { use_project_knowledge: !project.ai.chat.knowledge.use_project_knowledge } } },
        }));
      });

      test("Choose the agent's built-in models", async t => {
        const project = await session.current();
        if (project.ai.chat.models.length === 0) {
          t.skip('project has no built-in models listed');
          return;
        }
        await expectWrite(session, current => ({
          ai: {
            chat: {
              models: current.ai.chat.models.map((model, index) =>
                index === 0 ? { ...model, enabled: !model.enabled } : model,
              ),
            },
          },
        }));
      });
    });

    describe('Feature availability (read-only)', () => {
      const readOnlyFields = [
        ['ai_writer', 'enabled'],
        ['chat', 'enabled'],
        ['inline_editor', 'enabled'],
        ['linter', 'enabled'],
        ['docs_audit', 'enabled'],
      ];

      for (const [feature, field] of readOnlyFields) {
        test(`ai.${feature}.${field} ignores writes`, async () => {
          await expectWrite(
            session,
            project => ({ ai: { [feature]: { [field]: !project.ai[feature][field] } } }),
            { saved: false },
          );
        });
      }

      test('ai.hidden ignores writes', async () => {
        await expectWrite(session, project => ({ ai: { hidden: !project.ai.hidden } }), { saved: false });
      });
    });
  });
}
