---
name: mcp-server
description: Establish which ReadMe project is in play, and how it is authenticated, before acting on anything of the user's. Use whenever the user mentions "our docs", "my docs", their hub, or a named project, whenever a ReadMe call fails on authentication, and before any write. This server reads ReadMe's own documentation; the user's project is reached only through execute-request and their key.
---

# Which project am I touching?

This plugin connects to ReadMe's own documentation project at `https://docs.readme.com/mcp`. A
ReadMe MCP server is bound to one project by its hostname, fixed when the server is built, and no
tool takes a project argument. This server always answers for ReadMe's own docs.

Their project is reachable too, but only through the ReadMe API, and only with their key. So reads
and writes land in different places.

## The split

| Tool | Answers for | Use it when |
| --- | --- | --- |
| `search`, `fetch` | ReadMe's own product documentation | The question is about how ReadMe works |
| `list-specs`, `list-endpoints`, `get-endpoint`, `search-endpoints`, `get-server-variables` | ReadMe's own API definitions, as documents | Looking up a route before calling it |
| `execute-request` | **The user's project**, via `api.readme.com` with their key | Reading or changing anything of theirs |
| `send-feedback` | ReadMe's feedback queue, not theirs | They want to report something to ReadMe |
| `update-docs`, `draft-changelog` | Nothing. They return instructions for you to carry out | You want the recommended procedure |

`execute-request` is the only tool the user's key applies to, and the only way to touch their
project. It calls only the servers declared in this project's API definitions, which means
`api.readme.com` and `metrics.readme.io`; their own hub is not reachable from here.

## Start here, before touching anything of theirs

Questions about ReadMe itself need none of this: use `search` and `fetch` and answer.

Anything concerning *their* project starts by establishing which project, and whether a key is
already attached. Resolve this once per session and reuse the answer; do not re-probe each turn.

**Step 1. Probe.** Call `execute-request` with no `Authorization` header:

```json
{
  "title": "ReadMe API",
  "harRequest": {
    "method": "get",
    "url": "https://api.readme.com/v2/projects/me"
  }
}
```

`title` is required and names the spec. Omitting it fails with
`Invalid arguments: title: expected string, received undefined`.

| Result | Meaning | Next |
| --- | --- | --- |
| A project object | The server registration already carries a key | Name the project and subdomain, then carry on. Ask for nothing |
| `Missing Security Schemes` | No key anywhere | Step 2 |

Probe before asking the user anything. The plugin ships anonymous, but a user who registered their
own `readme` server already has a key on the connection, and asking for one they supplied is noise.

**Step 2. No key, and no project named.** Ask, and wait. Pick no project, infer none from open
files or earlier turns, and read no guides to narrow it down:

> This plugin talks to ReadMe's own documentation, so I can answer questions about how ReadMe works
> right now. To work on your project I need to know which one, and an API key. Which project, and
> would you rather register the key with the server or paste it here?

**Step 3. Project known, no key.** This step applies only when the server is anonymous. If step 1
returned a project, the registration carries a key, it is applied automatically, and you send none
of your own.

Offer the better option first:

- **Preferred:** they register the server with the key themselves, so it stays out of the chat. The
  plugin README has the `~/.cursor/mcp.json` snippet.
- **Otherwise:** they paste it and you send it as a header in the call:

  ```json
  {
    "title": "ReadMe API",
    "harRequest": {
      "method": "get",
      "url": "https://api.readme.com/v2/projects/me",
      "headers": [{ "name": "Authorization", "value": "Bearer rdme_..." }]
    }
  }
  ```

  This works, and it also puts the key in the transcript. Say so, and tell them to rotate it.

**Step 4. Name the project before you change anything.** The key decides which project a write
lands in, and the user cannot override it, so asking them is misleading. State the name and
subdomain from step 1, then make the change.

## When authentication looks configured but fails

`Missing Security Schemes` while the user believes a key is set almost always means the registration
holds a placeholder rather than a value: `${env:README_API_KEY}` or `${README_API_KEY}` left in
`mcp.json` with the environment variable unset, which clients pass through as literal text.

Say that plainly, and check it before asking for the key in chat. Ask them to confirm the variable
is exported in the environment the editor launched from, then restart the editor, since the header
resolves once when the server connects.

## When the user asks about their own docs

"Search our docs", "what does our guide say", "find the page about X in my project" cannot be
answered by `search` or `fetch` here. Those read ReadMe's documentation and would return confident,
wrong answers about someone else's content.

Their key already reaches their content through the ReadMe API, so switch tools and carry on rather
than sending them away to configure anything:

| They want | Call, via `execute-request`, spec title `ReadMe API` |
| --- | --- |
| Search their content | `GET https://api.readme.com/v2/search?query=...`, optionally `section`, `version`, `projects` |
| Read one guide | `GET https://api.readme.com/v2/branches/{branch}/guides/{slug}` |
| List what is in a category | `GET https://api.readme.com/v2/branches/{branch}/categories/{section}/{title}/pages` |

`{branch}` is a version number, `stable`, or a branch name. The `readme-api` skill carries the full
route map when a request goes beyond these.

A different server is the answer only when the user explicitly wants an assistant over their
published hub for their own end users: every project publishes one at
`https://{subdomain}.readme.io/mcp` or its custom domain. That is a product feature they set up
deliberately, not a workaround for this conversation.
