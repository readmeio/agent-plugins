---
name: developer-metrics-api
description: Read or send ReadMe Developer Metrics (metrics.readme.io) through the ReadMe MCP server. Use when the user asks about page views, top pages, search terms, page quality votes, API call logs, or wants to send API request logs from their own server to ReadMe. Knows which metrics only exist in the dashboard and which the API can return.
---

# Developer Metrics API

## Quick Start

1. Decide the direction. **Read** metrics out of ReadMe, or **ingest** your API's request logs into ReadMe.
2. Reads need the Enterprise plan. Without it the API answers with an auth or plan error. Point the user at the dashboard instead: `https://dash.readme.com/project/{subdomain}/v{version}/metrics/v2/page-views`, `.../metrics/v2/search`, `.../metrics/v2/page-quality`.
3. Call `readme:get-endpoint` with spec title `Developer Metrics API` only when you need the full schema. The tables below cover the params.
4. Call `readme:execute-request` with the full URL `https://metrics.readme.io/...`. The MCP server adds auth from `README_API_KEY`; do not read the variable or build the header yourself. The API wants Basic auth with the project API key as username and an empty password, so if a request still returns `Unauthorized` with a key set, add header `Authorization: Basic <base64 of "<key>:">` to the HAR request.

A response `{"status":"Unauthorized","message":"You must pass in an API key."}` means no key is set. Stop and send the user to `https://dash.readme.com/project/{subdomain}/v{version}/api-key`, then ask them to export `README_API_KEY` and restart the editor.

## Metrics ReadMe records

| Metric | Dashboard page | Readable via API |
| --- | --- | --- |
| Page Views | Docs → Page Views | Yes |
| Page Quality (thumbs up/down, comments) | Docs → Page Quality | Yes |
| Search terms | Docs → Search | Yes |
| MCP Tool Calls | Docs → MCP | No |
| API Calls | API → API Calls | No, ingest only |
| API Errors | API → API Errors | No |
| Top Endpoints | API → Top Endpoints | No |
| New Users / My Developers | Users | No |

Dashboard history covers 24 hours of API request and Try It logs on every plan. The Developer Dashboard add-on extends it. For anything in the "No" rows, send the user to `https://dash.readme.com/project/{subdomain}/v{version}/metrics`.

## Read endpoints (Enterprise)

Base URL `https://metrics.readme.io`. All GET.

### Common query params

| Param | Meaning |
| --- | --- |
| `rangeStart`, `rangeEnd` | `YYYY-MM-DD` |
| `rangeLength` | Days, 1–720, default 30. Used when `rangeStart`/`rangeEnd` are absent |
| `resolution` | `hour`, `day`, `week`, `month`, `year`. Default `day` |
| `email` | Filter to one or more authenticated users |
| `path` | Doc path such as `/docs/getting-started`, single or array |
| `limit` | 1–500, default 30 |
| `page`, `pageSize` | Page starts at 0, `pageSize` 1–100 |
| header `x-timezone` | IANA zone, default `UTC` |

### Page views

| Path | Returns |
| --- | --- |
| `/v2/pageview/total` | Total views in range |
| `/v2/pageview/unique` | Unique viewers in range |
| `/v2/pageview/views-per-day` | Bucketed counts by `resolution` |
| `/v2/pageview/historical` | Percent change period-over-period, total and unique |
| `/v2/pageview/top` | Top pages with counts |
| `/v2/pageview/users` | Emails with the most views |
| `/v2/pageview/{path}` | Viewers of one page and how often, path URL-encoded |

### Search

| Path | Returns |
| --- | --- |
| `/v2/search/top-search-terms` | Top terms with counts |
| `/v2/search/{searchTerm}` | Who searched a term and how often |

### Page quality

| Path | Returns |
| --- | --- |
| `/v2/thumb/average` | Average vote across the project or filtered `path` |
| `/v2/thumb/best` | Pages with the most positive votes |
| `/v2/thumb/worst` | Pages with the most negative votes |
| `/v2/thumb/comments` | Vote comments |
| `/v2/thumb/{path}` | Votes for one page |

## Ingest endpoint (all plans)

`POST https://metrics.readme.io/request`, same Basic auth. Body is an array of log entries:

| Field | Required | Meaning |
| --- | --- | --- |
| `clientIPAddress` | Yes | Caller IP |
| `group.id` | Yes | The caller's API key on your API. Named `apiKey` in the SDKs |
| `group.email`, `group.label` | No | Identify the developer in My Developers |
| `request` | Yes | One HAR entry: `request` and `response` objects with method, url, headers, body, status |
| `development` | No | `true` marks the log as non-production |
| `_id` | No | UUIDv4; lets you link to the log at `{hub url}/logs/{id}` |

Prefer an SDK over hand-built payloads when the user runs one of these stacks:

| Language | Package |
| --- | --- |
| Node | `readmeio` |
| Python | `readme-metrics` |
| Ruby | `readme-metrics` |
| PHP | `readme/metrics` |
| .NET | `ReadMe.Metrics` |

Setup docs: `readme:fetch` with id `main/sdks`, `main/developer-dashboard`, or `main/sending-logs-to-readme-with-nodejs`.
