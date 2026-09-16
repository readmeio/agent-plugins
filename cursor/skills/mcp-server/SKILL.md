---
name: mcp-server
description: Work out which ReadMe project a tool call will hit before making it. Use whenever the user asks to search, read, or change "our docs", "my docs", or a named project through the ReadMe MCP server, and before any write. Explains that this server reads ReadMe's own documentation while writes land on the user's project.
---

# Which project am I touching?

This plugin connects to ReadMe's own documentation project at `https://docs.readme.com/mcp`. A
ReadMe MCP server is bound to exactly one project by its hostname, decided when the server is built,
and no tool takes a project argument. You cannot point this server at the user's project.

That matters because reads and writes land in different places.

## The split

| Tool | Reads or acts on |
| --- | --- |
| `search`, `fetch` | ReadMe's own product documentation. Never the user's content. |
| `list-specs`, `list-endpoints`, `get-endpoint`, `search-endpoints`, `get-server-variables` | ReadMe's own API definitions, as documents |
| `execute-request` | Makes a real HTTP call. With the user's key against `api.readme.com`, this acts on **their** project |
| `send-feedback` | Files feedback against ReadMe, not the user's project. Rarely exposed |
| `update-docs`, `draft-changelog` | Prompt text, not actions. They return instructions for you to follow, and change nothing by themselves |

Two of these have side effects, and only one of them touches the user: `execute-request` is the only
tool their key applies to, and the only way to change anything in their project. `send-feedback`
writes too, but the record lands in ReadMe's queue.

`execute-request` cannot call just any URL. It is restricted to the servers declared in this
project's own API definitions, which here means `api.readme.com` and `metrics.readme.io`. The user's
own hub is not reachable from this server, so there is no way to read or write their content except
through the ReadMe API.

## Before any write

Do not ask the user which project. They cannot change the answer, and the key already decides it.
Look it up and say it:

1. `execute-request`, spec title `ReadMe API`, `GET https://api.readme.com/v2/projects/me`.
2. State the project name and subdomain from the response, then make the change.

A 500 titled `An unknown error has occurred.` means no key is attached. The v2 API does not return
401 for a missing bearer. Stop and tell the user to register the server with their key, as described
in the plugin README. Never read `README_API_KEY` yourself or build the header by hand.

## When the user asks about their own docs

"Search our docs", "what does our guide say", "find the page about X in my project" cannot be
answered with `search` or `fetch` here. Those read ReadMe's documentation and will return confident,
wrong answers about someone else's content.

Do not send the user off to configure anything. Their key already reaches their content through the
ReadMe API, so switch tools and carry on:

| They want | Call, via `execute-request` with spec title `ReadMe API` |
| --- | --- |
| Search their content | `GET https://api.readme.com/v2/search?query=...`, optionally `section`, `version`, `projects` |
| Read one guide | `GET https://api.readme.com/v2/branches/{branch}/guides/{slug}` |
| List what is in a category | `GET https://api.readme.com/v2/branches/{branch}/categories/{section}/{title}/pages` |

`{branch}` is a version number, `stable`, or a branch name. The `readme-api` skill has the full
route map if the request goes beyond these.

Only if the user explicitly wants an assistant over their published hub, for their own end users,
is the answer a different server: every project publishes one at `https://{subdomain}.readme.io/mcp`
or its custom domain. That is a product feature they set up deliberately, not a workaround for this
conversation.

## Quick check

Ask yourself which of these a request needs before choosing a tool:

- **How does ReadMe work?** → `search` and `fetch`. Correct server, no key needed.
- **What is in my hub?** → not `search`. Use `execute-request` against `api.readme.com/v2`.
- **Change something in my project** → `execute-request` with their key, after naming the project.
