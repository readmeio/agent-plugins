import assert from 'node:assert/strict';
import { isDeepStrictEqual } from 'node:util';

import { getPath, leafPaths } from './snapshot.mjs';

export function pickDifferent(current, options) {
  const option = options.find(candidate => !isDeepStrictEqual(candidate, current));
  if (option === undefined) throw new Error(`No option differs from the current value ${JSON.stringify(current)}`);
  return option;
}

// `saved: false` expects a 200 that leaves each field unchanged (plan-gated, read-only, group-enforced).
export async function expectWrite(session, buildBody, { saved = true, expected = {} } = {}) {
  const before = await session.current();
  const body = buildBody(before);
  const res = await session.patch(body);
  assert.equal(res.status, 200, `PATCH ${JSON.stringify(body)} on ${session.profile.id}: ${JSON.stringify(res.body)}`);

  const after = await session.current();
  for (const path of leafPaths(body)) {
    let want = getPath(before, path);
    if (saved) want = path in expected ? expected[path] : getPath(body, path);
    assert.deepEqual(
      getPath(after, path),
      want,
      `${session.profile.id}: ${path} should ${saved ? 'be saved' : 'stay unchanged'}`,
    );
  }
  return { before, after, res };
}

export async function expectRejected(session, body) {
  const res = await session.patch(body);
  assert.ok(res.status >= 400 && res.status < 500, `expected a 4xx for ${JSON.stringify(body)}, got ${res.status}`);
  return res;
}
