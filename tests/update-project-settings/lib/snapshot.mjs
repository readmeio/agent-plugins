import assert from 'node:assert/strict';
import { isDeepStrictEqual } from 'node:util';

import { getProject, patchProject } from './client.mjs';

// Keyed maps that must be written as a whole, so they count as a single leaf.
const MAP_PATHS = ['mcp.oauth_credentials', 'i18n.custom_contexts'];

// The setter ignores `inherited`, so replaying parent terms would copy them into the child's own glossary.
const RESTORE_TRANSFORMS = {
  glossary: terms => terms.filter(term => !term.inherited).map(({ term, definition }) => ({ term, definition })),
};

export function getPath(object, path) {
  return path.split('.').reduce((value, key) => (value == null ? undefined : value[key]), object);
}

function setPath(object, path, value) {
  const keys = path.split('.');
  let cursor = object;
  for (const key of keys.slice(0, -1)) {
    if (cursor[key] === undefined) cursor[key] = {};
    cursor = cursor[key];
  }
  cursor[keys.at(-1)] = value;
}

export function leafPaths(object, prefix = '') {
  return Object.entries(object).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    const isObject = value !== null && typeof value === 'object' && !Array.isArray(value);
    if (isObject && !MAP_PATHS.includes(path)) return leafPaths(value, path);
    return [path];
  });
}

function readForRestore(project, path) {
  const value = getPath(project, path);
  if (value === undefined) return null;
  if (path in RESTORE_TRANSFORMS) return RESTORE_TRANSFORMS[path](value);
  return value;
}

// Runs every cleanup action even when an earlier one fails, then reports all failures together.
export async function cleanUp(...actions) {
  const errors = [];
  for (const action of actions) {
    try {
      await action();
    } catch (error) {
      errors.push(error);
    }
  }
  if (errors.length > 0) {
    throw new AggregateError(errors, errors.map(error => error.message).join('\n'));
  }
}

export function createSession(profile) {
  const original = profile.project;
  const restoreValues = new Map();
  // Paths restored with `restoreWith` cannot be read back as written, so restore does not verify them.
  const unverified = new Set();

  function track(paths, { restoreWith = {} } = {}) {
    for (const path of paths) {
      if (restoreValues.has(path)) continue;
      if (path in restoreWith) {
        restoreValues.set(path, restoreWith[path]);
        unverified.add(path);
        continue;
      }
      restoreValues.set(path, readForRestore(original, path));
    }
  }

  return {
    profile,

    track,

    async patch(body, options) {
      track(leafPaths(body), options);
      return patchProject(profile.key, body);
    },

    async restore() {
      if (restoreValues.size === 0) return;
      const body = {};
      for (const [path, value] of restoreValues) setPath(body, path, value);
      const res = await patchProject(profile.key, body);
      assert.equal(res.status, 200, `restore on ${profile.id} failed: ${JSON.stringify(res.body)}`);

      const restored = await getProject(profile.key);
      const mismatches = [];
      for (const [path, value] of restoreValues) {
        if (unverified.has(path)) continue;
        const actual = readForRestore(restored, path);
        if (!isDeepStrictEqual(actual, value)) {
          mismatches.push(`${path}: expected ${JSON.stringify(value)}, got ${JSON.stringify(actual)}`);
        }
      }
      assert.deepEqual(mismatches, [], `restore on ${profile.id} left fields changed:\n${mismatches.join('\n')}`);
    },

    current() {
      return getProject(profile.key);
    },
  };
}
