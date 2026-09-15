# ReadMe

Cursor plugin that connects agents to [ReadMe](https://readme.com) through ReadMe's remote
[Model Context Protocol](https://modelcontextprotocol.io/) server at `https://docs.readme.com/mcp`.

Search your guides and API reference, inspect your OpenAPI specs, draft changelog entries, and open
documentation updates for review — without leaving the editor.

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

Write tools such as `update-docs` need your ReadMe API key. Register the server yourself once with
the key, and your `readme` entry replaces the plugin's anonymous one:

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

| Tool               | What it does                                                         |
| ------------------ | -------------------------------------------------------------------- |
| `search`           | Search guide pages, reference pages, and docs content by keyword     |
| `fetch`            | Retrieve a specific guide or reference page by ID                    |
| `update-docs`      | Open a documentation update on a new branch and return a review link |
| `list-specs`       | List the OpenAPI specs available in the project                      |
| `search-endpoints` | Search paths, operations, and parameters                             |
| `list-endpoints`   | List all API paths and HTTP methods with summaries                   |
| `get-endpoint`     | Get detail on one endpoint, including security schemes and servers   |
| `execute-request`  | Execute an API request from a HAR request object                     |
| `draft-changelog`  | Generate a changelog draft from merged GitHub PRs                    |

`update-docs` writes to a new branch and returns a review link, so your published docs are never
edited in place. `execute-request` sends a real request to the API in the spec.

## Which ReadMe MCP server is this?

ReadMe has two kinds of MCP server, and this plugin is the first one.

**ReadMe's MCP server** (`https://docs.readme.com/mcp`) is what this plugin installs. You use it to
manage the documentation in your own ReadMe project.

**Your project's MCP server** (`https://your-project.readme.io/mcp`) is the one ReadMe generates
from your API spec for _your_ users. Every project has its own URL, so it cannot be installed from
the marketplace. To connect to one, use the instructions published on that project's hub. See
[your project's MCP server](https://docs.readme.com/main/docs/your-projects-mcp-server).

## Support

- **ReadMe's MCP server:** https://docs.readme.com/main/docs/readmes-mcp-server
- **Report issues:** https://github.com/readmeio/agent-plugins/issues
- **Contact support:** support@readme.io

## License

MIT
