# Cursor connection

Applies to the Cursor IDE, Cursor web, and the Cursor CLI (`agent`). A plugin installed at user scope in any one is available in the others. Install the plugin once. Cursor web follows the same steps as the Cursor UI below.

The plugin includes the ReadMe MCP server, so installing the plugin is the whole setup.

## Install the ReadMe Plugin

### Cursor UI

1. Open **Customize** in the sidebar.
2. Search for **ReadMe**.
3. Find the "Readme" plugin with author "ReadMe" and select **Add**.
4. When Cursor prompts, sign in with a ReadMe account.

In the IDE chat, running the command `/add-plugin readme` will also do the same.

### Cursor CLI - `agent`

Cursor's `agent` cannot sign in to MCP servers with OAuth yet, so the plugin's MCP server does not authenticate there.

1. Install the plugin through the Cursor UI steps above. Its skills are then available in `agent` too.
2. Connect the MCP server with a project API key instead (see Project API keys in the main skill). The user should run this themselves in a terminal and pick Cursor when prompted. `add-mcp` prompts for `README_API_KEY`, so the key never enters the chat or shell history:

```sh
npx add-mcp "https://docs.readme.com/mcp" --name readme -g --header 'Authorization: Bearer ${README_API_KEY}'
```

Keep the single quotes so the shell does not expand the variable. `-g` writes to the user-level Cursor config, which keeps the key out of project files.

### Confirmation

Confirm that the ReadMe plugin is installed, that its skills are available, and that you can list tools from its MCP server. The user may need to reload the window or start a new session before the install is recognized.
