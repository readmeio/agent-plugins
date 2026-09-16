---
name: mcp-server
description: Establish which ReadMe project is in play, and how it is authenticated, before acting on anything of the user's. Use whenever the user mentions "our docs", "my docs", their hub, or a named project, whenever a ReadMe call fails on authentication, and before any write. This server reads ReadMe's own documentation; the user's project is reached only through execute-request and their key.
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

## Start here, before touching anything of theirs

Reading ReadMe's own documentation needs nothing. The moment a request concerns *their* project,
establish which project it is. Do not guess, and do not quietly answer from ReadMe's docs instead.

**Step 1. Find out whether a key is already attached.** Call `execute-request`, spec title
`ReadMe API`, `GET https://api.readme.com/v2/projects/me`, and send no `Authorization` header.

| Result | What it means | Do |
| --- | --- | --- |
| A project object | The server registration already carries a key | Name the project and subdomain, then carry on. Never ask for a key |
| `Missing Security Schemes` | No key anywhere | Go to step 2 |

Do this before asking the user anything. The plugin ships anonymous, but a user who registered their
own `readme` server has a key on the connection, and asking them for one they already supplied is
noise.

**Step 2. No key, and no project named.** Stop and ask. Do not pick a project, do not assume the
user means ReadMe's own docs, and do not start reading guides to infer one. Ask which ReadMe project
they mean and how they want to authenticate.

While waiting, be clear about what does work unauthenticated: `search` and `fetch` over ReadMe's own
product documentation, and the reference tools over ReadMe's API definitions. None of their content.

**Step 3. Project known, no key.** Ask for it, and offer the better option first:

- **Preferred:** they register the server with the key themselves, so it never enters the chat. The
  plugin README has the `~/.cursor/mcp.json` snippet.
- **Otherwise:** they paste the key and you pass it as an `Authorization: Bearer` header inside the
  `execute-request` call. This works, but the key is then in the transcript. Say so when it happens,
  and tell them to rotate it afterwards.

**Step 4. Name the project before you change anything.** Never ask the user which project a write
lands in. The key already decides, and they cannot override it. State the name and subdomain from
step 1, then make the change.

## When authentication looks configured but fails

`Missing Security Schemes` while the user believes a key is set almost always means the registration
carries a placeholder rather than a value: `${env:README_API_KEY}` or `${README_API_KEY}` written
into `mcp.json` with the environment variable unset, which clients pass through as literal text.

Say that plainly. Ask them to confirm the variable is exported in the environment the editor was
launched from, and to restart the editor, since the header is resolved once when the server
connects. Do not work around it by asking for the key in chat before checking.

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

- **How does ReadMe work?** → `search` and `fetch`. Correct server, no key needed, no project to establish.
- **What is in my hub?** → not `search`. Run the step 1 probe, then `execute-request` against `api.readme.com/v2`.
- **Change something in my project** → `execute-request`, after naming the project from step 1.
- **No project named and no key?** → ask. Never default to ReadMe's own docs and present it as theirs.
