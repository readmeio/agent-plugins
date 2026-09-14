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
