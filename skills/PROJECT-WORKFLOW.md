# Working on a ReadMe project

Shared reference for project operations. Read the sections needed by the current workflow.

## Draft boundaries

`NEEDS_INPUT` marks maintainer work required before merge, not information the customer must supply. Use documented, available capabilities; when an unresolved detail is required for an action, pause that action and explain the manual continuation. Report partial work as partial.

## MCP routing

The plugin connects to [ReadMe's MCP server](https://docs.readme.com/main/docs/readmes-mcp-server). Its documentation search and fetch tools read **ReadMe's own docs**, not the customer's project.

For customer content, discover the available ReadMe API operations and inspect their current schemas before executing them against the authenticated project. Use the current ReadMe API rather than treating legacy routes as a fallback. Tool schemas are the authority for names, arguments, supported fields, and pagination.

The existing server uses `execute-request` with the `ReadMe API` spec for project operations; endpoint discovery tools describe those operations. Those discovery tools describe ReadMe's APIs, not the endpoints in a customer's API reference. For customer endpoint questions, use an available project API-reference operation and inspect its current schema. If none is available, state that limitation instead of substituting ReadMe's own endpoint definitions. An instructional tool response is a procedure to follow, not evidence that a mutation happened.

Route project analytics separately: page views, search terms, and page quality belong to the `Developer Metrics API`, not the `ReadMe API` content routes. Discover the available operation and inspect its current schema before calling it. Treat authorization or plan errors as errors, not as empty results.

**NEEDS_INPUT — MCP contract:** Confirm the current project-identity operation, search scoping, and execution contract against the monorepo. Add an agent-facing API documentation pointer for operations not covered by the product docs.

## Target and branch

For hosted writes, confirm the intended project's name and subdomain with a successful non-mutating project read; the credential determines the project. Resolve a mismatch through the connection configuration, not a per-request project guess. For local work, confirm the project context through the sync mapping below instead.

For branch-scoped work, use the user's explicit target. If none was given, ask whether to use a named/new branch or the project's stable branch, and wait before writing. A ReadMe branch is a product branch/version, not automatically a local Git branch.

Use [ReadMe branches](https://docs.readme.com/main/docs/branches) when choosing or creating a target. Check each operation's scope: project-wide changes are not isolated by selecting a docs branch.

**NEEDS_INPUT — Scope map:** Document which page types and settings are branch-scoped, project-wide, and Git-backed, with canonical documentation links. Confirm changelog and discussion behavior separately.

## Source of truth

Select the write surface for each item before checking hosted access. Use MCP for hosted changes by default. Switch to local files only when the user explicitly confirms bidirectional Git sync and the repository, intended ReadMe project, mapped ReadMe branch, and synced files are established. Missing MCP or failed authentication is not evidence of sync or a file mapping; ask for missing confirmation before local writes.

Confirmed mapped local edits do not require a working MCP connection or authenticated project read. Read, edit, and validate those files locally, using the same ReadMe MDX rules. Keep each change on one write surface. In mixed work, handle confirmed local items separately from hosted-only items; unavailable hosted access blocks only the latter, which remain pending with their next actions.

For sync work, consult the current ReadMe Git-sync documentation.

**NEEDS_INPUT — Git sync:** Add the canonical bidirectional-sync URL, branch mapping, file layout, supported sections/settings, and conflict/verification workflow. Until those are established, limit local edits to confirmed synced files.

## Authentication failure

Attempt the needed project operation with the existing connection. On an authentication rejection, use [mcp-auth](mcp-auth/SKILL.md), then resume the interrupted operation after verification. Handle validation, plan, permission, and network errors according to their actual response rather than assuming each needs a new key.

## Verification

After a hosted write, re-read the changed resource and compare the requested content/settings and preserved fields. Report the project, branch or project-wide scope, changed resources, review links, and remaining manual work. A saved draft is not necessarily published.

For confirmed Git-sync work, report local validation and diff separately from remote synchronization/publication.

**NEEDS_INPUT — Review:** Add supported preview, publishing, and sync-status checks for each operation. Provide a manual review link when automated checks are unavailable.
