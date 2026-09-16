# ReadMe

Cursor plugin that connects agents to [ReadMe](https://readme.com) through ReadMe's remote
[Model Context Protocol](https://modelcontextprotocol.io/) server at `https://docs.readme.com/mcp`.

Ask how ReadMe works, look up the ReadMe API, and drive your own project through that API with your
key, without leaving the editor.

The server is bound to one project by its hostname, and this one is ReadMe's own documentation. So
`search` and `fetch` answer questions *about ReadMe*, while your project is reached through
`execute-request` and your key. The `mcp-server` skill keeps the agent straight on that.

## Install

1. Open **Cursor Settings → Plugins**.
2. Search for **ReadMe**.
3. Click **Install** and choose project or user scope.

Or run `/add-plugin readme` in chat. Nothing to configure afterwards: the plugin reads public docs
straight away, and a key is only needed for writes (see below).

### From this repository

Teams that want the plugin from source, or ahead of the marketplace, can add the repository itself:

1. Open **Dashboard → Plugins**.
2. Under **Team Marketplaces**, click **Add Marketplace**, then **Import from Repo**.
3. Enter `readmeio/agent-plugins`.

Cursor reads `.cursor-plugin/marketplace.json` from the repository root and indexes the plugin from
there. Teams and Enterprise plans only.

## MCP

```json
{
  "mcpServers": {
    "readme": {
      "type": "http",
      "url": "https://docs.readme.com/mcp"
    }
  }
}
```

## Authentication

Public read access works without any setup, so the plugin ships no credential and asks for nothing
on install.

Anything that changes your project goes through `execute-request` against `api.readme.com`, and that
needs your ReadMe API key. Register the server yourself once with the key, and your `readme` entry
replaces the plugin's anonymous one:

```json
{
  "mcpServers": {
    "readme": {
      "type": "http",
      "url": "https://docs.readme.com/mcp",
      "headers": {
        "Authorization": "Bearer ${env:README_API_KEY}"
      }
    }
  }
}
```

Put that in `~/.cursor/mcp.json` for every project, or `.cursor/mcp.json` for one. Create the key
under **Account Settings → API Keys** in ReadMe and export it as `README_API_KEY` rather than
committing it. The key decides which project the agent reaches, and grants read and write access to
it. Rotate it from Account Settings if it is ever exposed.

## What agents can do

| Tool               | What it does                                                       | Reads or acts on   |
| ------------------ | ------------------------------------------------------------------ | ------------------ |
| `search`           | Search guides, reference pages, and docs content by keyword         | ReadMe's own docs  |
| `fetch`            | Retrieve a specific guide or reference page by ID                   | ReadMe's own docs  |
| `list-specs`       | List the OpenAPI specs available                                    | ReadMe's own specs |
| `list-endpoints`   | List all API paths and HTTP methods with summaries                  | ReadMe's own specs |
| `search-endpoints` | Search paths, operations, and parameters                            | ReadMe's own specs |
| `get-endpoint`     | Detail on one endpoint, including security schemes and servers      | ReadMe's own specs |
| `execute-request`  | Execute a real API request                                          | **Your project**   |
| `update-docs`      | Returns instructions for updating docs, for the agent to follow     | Nothing by itself  |
| `draft-changelog`  | Returns instructions for drafting a changelog from merged PRs       | Nothing by itself  |

`execute-request` is the only tool that changes anything, and the only one your API key applies to.
`update-docs` and `draft-changelog` are prompts rather than actions: they hand the agent a procedure,
and the agent carries it out through `execute-request`.

## Skills

| Skill | What it does |
| ----- | ------------ |
| `mcp-server` | Keeps the agent straight on which project a call lands in: this server reads ReadMe's own docs, while `execute-request` plus your key acts on yours |
| `mcp-auth` | Establishes which key is in play and diagnoses the failures a missing or unresolved one produces |
| `readme-api` | The full ReadMe API v2 route map, so the agent can go straight to the right call |
| `developer-metrics-api` | Page views, search terms and page quality reads, plus sending your API's request logs to ReadMe |
| `onboarding` | Walks a new customer from signup to a published hub and a working API key |

## Which ReadMe MCP server is this?

ReadMe has two kinds of MCP server, and this plugin is the first one.

**ReadMe's MCP server** (`https://docs.readme.com/mcp`) is what this plugin installs. It answers
questions about ReadMe from ReadMe's own documentation, and lets the agent drive the ReadMe API
against your project once you attach a key.

**Your project's MCP server** (`https://your-project.readme.io/mcp`) is the one ReadMe generates for
_your_ users to ask questions of your published hub. You do not need it to work on your own docs
from here: with a key, `execute-request` reaches your content through `api.readme.com/v2`. Every
project has its own URL, so it cannot be installed from the marketplace. See
[your project's MCP server](https://docs.readme.com/main/docs/your-projects-mcp-server).

Both are the same software; the hostname is what decides which project it serves.

## Support

- **ReadMe's MCP server:** https://docs.readme.com/main/docs/readmes-mcp-server
- **Report issues:** https://github.com/readmeio/agent-plugins/issues
- **Contact support:** support@readme.io

## License

MIT
