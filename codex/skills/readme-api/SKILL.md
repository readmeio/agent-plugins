---
name: readme-api
description: Call the ReadMe API v2 (api.readme.com/v2) through the ReadMe MCP server. Use whenever the user wants to list, read, create, update or delete anything in their ReadMe project - branches/versions, API definitions, guides, reference pages, categories, custom pages, changelog, recipes, images, API keys, search, or Owlbot. Carries the full route map so you can skip list-specs and list-endpoints.
---

# ReadMe API v2

## Quick Start

1. Confirm the key works: `readme:execute-request` with spec title `ReadMe API`, `GET https://api.readme.com/v2/projects/me`. The response names the project the key belongs to.
   - A 500 with title `An unknown error has occurred.` means the bearer is empty or invalid. The v2 API does not answer 401 for a missing key. Stop there. Do not probe with curl, `list-specs`, or the Legacy API. Tell the user to create a key at `https://dash.readme.com/project/{subdomain}/v{version}/api-key` (Configuration → API Keys), export it as `README_API_KEY`, and restart the editor.
2. Pick the route from the tables below.
3. Call `readme:get-endpoint` (title `ReadMe API`) only when you need the full request or response schema.
4. Call `readme:execute-request` with the full URL `https://api.readme.com/v2/...`. The server adds the bearer header from `README_API_KEY`.

Use `readme:search-endpoints` only when the tables have no match. Never use the `Legacy API` spec (v1) for new work.

## The key is the project

- One API key maps to exactly one project. Primary routes take no project parameter; the key decides.
- Enterprise child projects need the child's own key. Only the API key routes take a `{subdomain}`, and `me` works there as the subdomain.
- `{branch}` is a version number (`1.0`), `stable`, or a branch name.
- Everything is branch-scoped except changelogs, images, fonts, API keys, search and the project itself.
- Pagination: `page`, `per_page` (max 100, search max 50). Responses carry `paging.next`, `paging.previous`, `paging.first`, `paging.last`.
- Routes marked **Refactored only** return 404 on projects still on the legacy data model.
- Send header `prefer: handling=strict` on page-create routes to get a 409 instead of an auto-suffixed slug when the slug already exists.

## Routes

Base URL `https://api.readme.com/v2`. Auth `Authorization: Bearer <key>`.

### Project and API keys

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/projects/me` | Project the key belongs to |
| POST | `/projects/me/children` | Create a child project (Enterprise). Body: `name`, `subdomain`, optional `privacy` |
| GET | `/projects/{subdomain}/apikeys` | List API keys |
| POST | `/projects/{subdomain}/apikeys` | Create API key. Body: `label` |
| GET | `/projects/{subdomain}/apikeys/{api_key_id}` | Read one key |
| PATCH | `/projects/{subdomain}/apikeys/{api_key_id}` | Rename. Body: `label` |
| DELETE | `/projects/{subdomain}/apikeys/{api_key_id}` | Revoke a key |

### Branches (versions), Refactored only

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/branches` | List branches. Query: `sort_by`, `prefix` (e.g. `v2.0`) |
| POST | `/branches` | Create branch. Fetch the body with `readme:get-endpoint` |
| GET | `/branches/{branch}` | Read one branch |
| PATCH | `/branches/{branch}` | Update a branch |
| DELETE | `/branches/{branch}` | Delete branch |

### API definitions (OpenAPI 3.x, Swagger 2.0, experimental Postman)

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/branches/{branch}/apis` | List API definitions on the branch |
| POST | `/branches/{branch}/apis` | Upload. Body: `schema` (multipart file) or `url` |
| GET | `/branches/{branch}/apis/{filename}` | Read one definition |
| PUT | `/branches/{branch}/apis/{filename}` | Replace. Body: `schema` or `url` |
| DELETE | `/branches/{branch}/apis/{filename}` | Delete definition |
| POST | `/validate/api` | Validate without uploading. Body: `schema` or `url` |

### Guides

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/branches/{branch}/guides` | Create. Body: `title`, `category.uri`; optional `content.body` (Markdown), `parent.uri`, `slug`, `type` (`basic`, `link`, `endpoint`, `api_config`, `webhook`), `privacy.view`, `state`, `position` |
| GET | `/branches/{branch}/guides/{slug}` | Read guide, body included |
| PATCH | `/branches/{branch}/guides/{slug}` | Update any create field |
| DELETE | `/branches/{branch}/guides/{slug}` | Delete guide |

`category.uri` is `/branches/{branch}/categories/guides/{title}`; `parent.uri` is `/branches/{branch}/guides/{slug}`. Read them from the category and page responses rather than building them by hand.

### Reference pages

Same shape as guides under `/branches/{branch}/reference` and `/branches/{branch}/reference/{slug}`. `category.uri` uses section `reference`. Extra fields: `api` and `api_config` bind the page to an uploaded definition.

### Categories, Refactored only

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/branches/{branch}/categories` | Create. Body: `title`, `section` (`guide` or `reference`, default `guide`) |
| GET | `/branches/{branch}/categories/{section}` | List. `{section}` is `guides` or `reference` |
| GET | `/branches/{branch}/categories/{section}/{title}` | Read one category |
| PATCH | `/branches/{branch}/categories/{section}/{title}` | Body: `title`, `position` |
| DELETE | `/branches/{branch}/categories/{section}/{title}` | Delete category and its pages |
| GET | `/branches/{branch}/categories/{section}/{title}/pages` | Pages in the category, sidebar order |

### Custom pages, Refactored only

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/branches/{branch}/custom_pages` | List custom pages |
| POST | `/branches/{branch}/custom_pages` | Create. Body: `title`; optional `content.body`, `content.type` (`markdown` or `html`), `slug`, `appearance.fullscreen`, `privacy.view` |
| GET | `/branches/{branch}/custom_pages/{slug}` | Read one |
| PATCH | `/branches/{branch}/custom_pages/{slug}` | Update |
| DELETE | `/branches/{branch}/custom_pages/{slug}` | Delete |

### Changelog (not branch-scoped)

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/changelogs` | List. Query: `page`, `per_page`, `visibility` (`public`, `anyone_with_link`, `all`) |
| POST | `/changelogs` | Create. Body: `title`; optional `content.body`, `type` (`none`, `added`, `fixed`, `improved`, `deprecated`, `removed`), `slug`, `author.id`, `created_at`, `privacy.view` |
| GET | `/changelogs/{identifier}` | Read one |
| PATCH | `/changelogs/{identifier}` | Update |
| DELETE | `/changelogs/{identifier}` | Delete |

Prefer `readme:draft-changelog` when the user wants an entry written rather than raw API access.

### Recipes, Refactored only

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/branches/{branch}/recipes` | List recipes |
| POST | `/branches/{branch}/recipes` | Create. Body: `title`, `description`, `content.steps`; optional `content.snippet`, `content.response`, `appearance.emoji`, `privacy.view` |
| GET | `/branches/{branch}/recipes/{slug}` | Read one |
| PATCH | `/branches/{branch}/recipes/{slug}` | Update |
| DELETE | `/branches/{branch}/recipes/{slug}` | Delete |

### Images and fonts

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/images` | List uploaded images, paginated |
| POST | `/images` | Upload. Multipart `file`; query `resize_height` |
| GET | `/images/{identifier}` | Read image metadata |
| POST | `/fonts/{slot}` | Upload font. `{slot}`: `heading`, `body_regular`, `body_medium`, `body_semibold`, `code`. Multipart `file` |

### Search and Owlbot

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/search` | Query: `query` (required), `section`, `version`, `projects` (Enterprise), `page`, `per_page` (max 50) |
| POST | `/owlbot/ask` | Ask AI. Body: `question`; optional `chat_id`, `message_id`, `customization`. Header `accept: text/event-stream` to stream |
| POST | `/owlbot/export` | Start a CSV export of Ask AI logs. Body: `range_start`, `range_end` |
| GET | `/owlbot/export/{id}` | Poll an export |

### Misc

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/discuss/{identifier}` | Read a discussion thread |
| GET | `/outbound_ips` | IPs ReadMe calls out from, for allowlisting |

## Related tools

- `readme:update-docs` edits a page by slug without building the PATCH yourself.
- `readme:search` and `readme:fetch` read the public docs at docs.readme.com (ids `main/<slug>`, `ref:main/<slug>`, `recipe:main/<slug>`).
