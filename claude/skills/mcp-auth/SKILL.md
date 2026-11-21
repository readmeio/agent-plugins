---
name: mcp-auth
description: Install and authenticate ReadMe's plugin and MCP server. Use during first-time setup, when ReadMe's skills or MCP server are missing, or when a ReadMe request fails authentication.
---

# ReadMe MCP authentication

## Assume the user is authenticated

Treat the user as authenticated. Make ReadMe requests directly, and enter the [workflow](#workflow) only when ReadMe's skills or MCP server are missing from this session, or a request actually fails authentication. When the user says they have signed in, take that as done and retry.

## Installed check

The ReadMe plugin brings both the ReadMe skills and the ReadMe MCP server (with tools such as `execute-request`). Before any install step, check what this session already has:

- **Skills and MCP server both available:** install nothing. Installing again creates duplicate skills and duplicate MCP servers.
- **Only one available:** install only the missing piece, following the client reference.

## Authentication

### OAuth (recommended)

The user signs in with their ReadMe account. One sign-in gives access to every project their account can reach, so recommend OAuth by default.

When sign-in happens depends on the client:

- Some clients ask the user to sign in as soon as the plugin or MCP server is installed or connected.
- Others wait until the first `execute-request` that needs authentication. ReadMe returns `401`, and the client prompts the user to sign in.

Both are expected. When a prompt appears, ask the user to complete sign-in in their client, then retry the original request.

### Choosing the project

With OAuth, select the project on every project-scoped `execute-request` call to `https://api.readme.com/v2/...` with the `x-readme-subdomain` header. OAuth requests to a project require it. User-scoped endpoints that aren't about one project, such as `GET https://api.readme.com/v2/users/me/projects`, don't take the header.

```json
"headers": [{ "name": "x-readme-subdomain", "value": "<project-subdomain>" }]
```

Identify the project as the `managing-readme-docs` skill describes: list the user's projects with `GET https://api.readme.com/v2/users/me/projects`, and when the project is unclear, ask the user by project name rather than subdomain. To work across several projects, change the header value per request; the one connection covers all of them.

With a project API key, don't send `x-readme-subdomain`; the key selects its project.

### Project API keys

Offer a project API key only when the user asks for API key authentication, or their client cannot sign in with OAuth. A key reaches a single project.

- The user creates the key in their project under **Settings → API Keys** (append `#/settings/api-keys` to any URL on their docs domain).
- The key is sent as an `Authorization: Bearer <key>` header on the MCP server, set through the client's own MCP settings. Have the user enter it there themselves so the key stays out of the chat.
- This is a separate MCP server entry from the plugin's. Have the user disable the plugin's ReadMe MCP server so the two don't duplicate.
- Don't send `x-readme-subdomain` with a key.

## Workflow

1. **Classify.** Capture the failing operation and the non-secret error response. Confirm it is an authentication failure (`401`, a missing or expired sign-in) or a missing install, rather than validation, a missing or wrong `x-readme-subdomain`, insufficient permissions, plan restrictions, or a service outage.
   **Done:** There is an authentication failure or missing install to repair, or the error is handed back to its owning workflow.
2. **Identify the client.** Establish the client and surface you are running in (for example Claude Code versus Claude Desktop Chat). You commonly have this information already; ask if unclear. Read only the matching [client connection reference](CLIENTS.md).
   **Done:** You know the client and surface, and have read its reference.
3. **Connect.** Run the [installed check](#installed-check) and install only what is missing. Then have the user sign in through their client as the reference describes.
   **Done:** Nothing is missing and the user confirms sign-in is complete.
4. **Verify and resume.** Call `GET https://api.readme.com/v2/projects/me` through `execute-request` (with the `x-readme-subdomain` header under OAuth), and confirm it returns the intended project. Resume the user's original operation.
   **Done:** The intended project is reachable and the original workflow resumes, or the unresolved error is reported without repeated guesses.

## First-time account setup

New accounts and projects are created through the `setup-project` skill. With OAuth, a user without a ReadMe account creates one in the ReadMe UI when their client prompts them to sign in.

## Cloud agents

A cloud or remote sandbox (e.g. Claude Code on the web, Codex cloud, Cursor background agents) is temporary and is not the user's app config, so leave its plugins and MCP config as they are. Direct the user to install the plugin and sign in through the app's own settings, following the UI steps in the matching client reference.
