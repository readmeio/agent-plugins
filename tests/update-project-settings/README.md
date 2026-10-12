# update-project-settings live tests

Checks the API operations documented in `skills/update-project-settings` against a real `PATCH /v2/projects/me`. The suite writes to live projects and restores them afterwards, so point it at dummy projects only.

## Setup

1. `cp .env.example .env` in this directory.
2. Set `API_ENDPOINT_DOMAIN` and one API key per dummy project. Blank keys skip that profile.
3. Optional: add `RATE_LIMIT_BYPASS_KEY=<key>` (sent as `x-ratelimit-bypass`) to avoid waiting on the 10-per-minute PATCH limit. Ask a ReadMe engineer for the key; never commit it.

## Run

From the repo root:

```sh
node --env-file=tests/update-project-settings/.env --test --test-concurrency=1 'tests/update-project-settings/*.test.mjs'
```

Files run one at a time because they share projects. To run one category, pass its file instead of the glob.

## Behaviour

- Expected results follow each project's real `plan.type`, so a plan-gated write is expected to save on plans with the feature and be silently ignored on plans without it. Set `STRICT_PROFILES=true` to fail when a project does not match its profile label.
- Tests that cannot be undone (site password, branch share links, site visibility, custom domain, subdomain, TLS, JWT rotation, adding a login webhook, main logo replacement) only run with `RUN_DESTRUCTIVE=true`.
- Writing to the enterprise child, including the restore, can leave it holding its own values instead of inheriting from the parent. Use a disposable child.
- Not run in CI.
