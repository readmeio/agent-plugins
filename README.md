# ReadMe

Search, read, and update your ReadMe documentation from your editor.

## Overview

This plugin connects compatible AI assistants to [ReadMe](https://readme.com) through ReadMe's
[MCP](https://modelcontextprotocol.io/) server at `https://docs.readme.com/mcp`.

Once connected, your assistant can search your guides and API reference, inspect your OpenAPI specs,
draft changelog entries, and open documentation updates for review — without leaving the editor.

## Installation

### Cursor

1. Open **Customize** in Cursor's sidebar.
2. Find **ReadMe** in the marketplace.
3. Select **Install** and choose project or user scope.
4. Set your **ReadMe API key** when prompted (see below).

Or run `/add-plugin readme` in chat.

### API key

The server authenticates with a ReadMe API key. Open **Account Settings → API Keys** in ReadMe and
create a key. Paste it into **Plugins → Configure** as **ReadMe API key**.

The key decides which projects the assistant can reach, and grants read and write access to them.
Rotate it from Account Settings if it is ever exposed.

Once connected, ask Cursor to work with your docs, for example: "Find our authentication guide and
add a section on refresh tokens."

## MCP

```json
{
  "mcpServers": {
    "readme": {
      "type": "http",
      "url": "https://docs.readme.com/mcp",
      "headers": {
        "Authorization": "Bearer ${README_API_KEY}"
      }
    }
  }
}
```

## Tools

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

- **ReadMe’s MCP server:** https://docs.readme.com/main/docs/readmes-mcp-server
- **Report issues:** https://github.com/readmeio/agent-plugins/issues
- **Contact support:** support@readme.io

## License

MIT
